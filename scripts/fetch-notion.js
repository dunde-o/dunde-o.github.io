import "dotenv/config";
import { Client } from "@notionhq/client";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import https from "https";
import http from "http";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const notion = new Client({
  auth: process.env.VITE_NOTION_API_KEY,
});

const databaseId = process.env.VITE_NOTION_DATABASE_ID;

// 이미지 저장 디렉토리
const IMAGE_DIR = join(__dirname, "../public/images/blog");
const POSTS_PATH = join(__dirname, "../src/data/posts.json");

// 기존 posts.json 로드
function loadExistingPosts() {
  try {
    if (existsSync(POSTS_PATH)) {
      const data = readFileSync(POSTS_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.log("No existing posts.json found or failed to parse");
  }
  return [];
}

// 이미지 다운로드 함수
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    protocol.get(url, (response) => {
      // 리다이렉트 처리
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filename)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const filepath = join(IMAGE_DIR, filename);
        writeFileSync(filepath, buffer);
        resolve(`/images/blog/${filename}`);
      });
      response.on("error", reject);
    }).on("error", reject);
  });
}

// URL에서 파일 확장자 추출
function getExtension(url) {
  const match = url.match(/\.(jpg|jpeg|png|gif|webp|svg)/i);
  return match ? match[0].toLowerCase() : ".jpg";
}

// URL을 해시하여 고유 파일명 생성
// Notion의 file.url은 매번 다른 서명된 URL을 반환하므로,
// 서명 부분을 제외한 파일 경로만 해시합니다.
function generateFilename(url, pageId) {
  // URL에서 쿼리 파라미터(서명 등)를 제거하고 경로만 추출
  const urlWithoutQuery = url.split("?")[0];
  const hash = crypto.createHash("md5").update(urlWithoutQuery).digest("hex").slice(0, 8);
  const ext = getExtension(url);
  return `${pageId.slice(0, 8)}-${hash}${ext}`;
}

// 블록을 마크다운으로 변환
function blockToMarkdown(block) {
  const type = block.type;
  const content = block[type];

  switch (type) {
    case "paragraph":
      return richTextToMarkdown(content?.rich_text) + "\n";
    case "heading_1":
      return `# ${richTextToMarkdown(content?.rich_text)}\n`;
    case "heading_2":
      return `## ${richTextToMarkdown(content?.rich_text)}\n`;
    case "heading_3":
      return `### ${richTextToMarkdown(content?.rich_text)}\n`;
    case "bulleted_list_item":
      return `- ${richTextToMarkdown(content?.rich_text)}\n`;
    case "numbered_list_item":
      return `1. ${richTextToMarkdown(content?.rich_text)}\n`;
    case "quote":
      return `> ${richTextToMarkdown(content?.rich_text)}\n`;
    case "code":
      return `\`\`\`${content?.language || ""}\n${richTextToMarkdown(content?.rich_text)}\n\`\`\`\n`;
    case "divider":
      return "---\n";
    case "image":
      const url = content?.file?.url || content?.external?.url || "";
      return `![image](${url})\n`;
    default:
      return "";
  }
}

// 리치 텍스트를 마크다운으로 변환
function richTextToMarkdown(richText) {
  if (!richText) return "";
  return richText
    .map((text) => {
      let content = text.plain_text || "";
      if (text.annotations?.bold) content = `**${content}**`;
      if (text.annotations?.italic) content = `*${content}*`;
      if (text.annotations?.code) content = `\`${content}\``;
      if (text.annotations?.strikethrough) content = `~~${content}~~`;
      if (text.href) content = `[${content}](${text.href})`;
      return content;
    })
    .join("");
}

// 페이지의 모든 블록 가져오기
async function getPageContent(pageId) {
  try {
    const blocks = [];
    let cursor;

    do {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
      });
      blocks.push(...response.results);
      cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);

    return blocks.map(blockToMarkdown).join("\n");
  } catch (error) {
    console.error(`Error fetching content for page ${pageId}:`, error.message);
    return "";
  }
}

async function fetchBlogPosts() {
  console.log("Fetching blog posts from Notion...");

  // 이미지 디렉토리 생성
  if (!existsSync(IMAGE_DIR)) {
    mkdirSync(IMAGE_DIR, { recursive: true });
    console.log(`Created image directory: ${IMAGE_DIR}`);
  }

  // 기존 포스트 로드
  const existingPosts = loadExistingPosts();
  const existingPostsMap = new Map(
    existingPosts.map((post) => [post.id, post])
  );

  try {
    // v5에서는 search API를 사용하여 데이터베이스 페이지 검색
    const response = await notion.search({
      filter: {
        property: "object",
        value: "page",
      },
    });

    // 해당 데이터베이스에 속한 페이지만 필터링 (v5에서는 data_source_id 사용)
    const databasePages = response.results.filter((page) => {
      if (page.object !== "page") return false;

      const parentType = page.parent?.type;
      const parentId =
        page.parent?.database_id?.replace(/-/g, "") ||
        page.parent?.data_source_id?.replace(/-/g, "");

      return (
        (parentType === "database_id" || parentType === "data_source_id") &&
        parentId === databaseId.replace(/-/g, "")
      );
    });

    const posts = await Promise.all(
      databasePages.map(async (page) => {
        const properties = page.properties;

        // title 속성 찾기 (이름이 다를 수 있음)
        const titleProp = Object.values(properties).find(
          (p) => p.type === "title"
        );

        const title = titleProp?.title?.[0]?.plain_text || "Untitled";

        // 현재 페이지의 updatedAt 계산
        const currentUpdatedAt =
          properties.updateAt?.date?.start ||
          page.last_edited_time?.split("T")[0] ||
          new Date().toISOString().split("T")[0];

        // 기존 포스트와 비교
        const existingPost = existingPostsMap.get(page.id);
        const isUpdated = !existingPost || existingPost.updatedAt !== currentUpdatedAt;

        // 페이지 본문 가져오기
        const content = await getPageContent(page.id);

        // 커버 이미지 처리
        let coverImage = null;
        const coverUrl = page.cover?.external?.url || page.cover?.file?.url;

        if (coverUrl) {
          try {
            // external URL은 그대로 사용
            if (page.cover?.external?.url) {
              coverImage = coverUrl;
            } else {
              // Notion 내부 URL인 경우
              const filename = generateFilename(coverUrl, page.id);
              const localPath = `/images/blog/${filename}`;
              const fullPath = join(IMAGE_DIR, filename);

              // 업데이트된 포스트이거나 이미지 파일이 없는 경우에만 다운로드
              if (isUpdated || !existsSync(fullPath)) {
                coverImage = await downloadImage(coverUrl, filename);
                console.log(`Downloaded cover image for: ${title}`);
              } else {
                // 기존 이미지 경로 유지
                coverImage = localPath;
                console.log(`Skipped download (unchanged): ${title}`);
              }
            }
          } catch (error) {
            console.error(`Failed to download cover image for ${page.id}:`, error.message);
            // 다운로드 실패 시 기존 이미지 유지
            coverImage = existingPost?.coverImage || null;
          }
        }

        return {
          id: page.id,
          title,
          slug:
            properties.slug?.rich_text?.[0]?.plain_text ||
            page.id.replace(/-/g, ""),
          createdAt:
            properties.createAt?.date?.start ||
            page.created_time?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          updatedAt: currentUpdatedAt,
          category:
            properties.category?.select?.name || "",
          tags: properties.tag?.multi_select?.map((tag) => tag.name) || [],
          coverImage,
          content,
        };
      })
    );

    // createdAt 기준 내림차순 정렬
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    writeFileSync(POSTS_PATH, JSON.stringify(posts, null, 2), "utf-8");

    console.log(`Successfully fetched ${posts.length} posts`);
    console.log(`Saved to: ${POSTS_PATH}`);
  } catch (error) {
    console.error("Error fetching from Notion:", error.message);

    // 에러 시 빈 배열로 저장 (빌드 실패 방지)
    writeFileSync(POSTS_PATH, JSON.stringify([], null, 2), "utf-8");
    console.log("Created empty posts.json as fallback");
  }
}

fetchBlogPosts();
