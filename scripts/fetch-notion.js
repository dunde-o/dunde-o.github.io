import "dotenv/config";
import { Client } from "@notionhq/client";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import https from "https";
import http from "http";
import crypto from "crypto";
import sharp from "sharp";

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

// 이미지 다운로드 함수 (버퍼 반환)
async function downloadImageBuffer(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    protocol.get(url, (response) => {
      // 리다이렉트 처리
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImageBuffer(response.headers.location)
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
        resolve(buffer);
      });
      response.on("error", reject);
    }).on("error", reject);
  });
}

// 이미지 다운로드 함수 (파일 저장용 - 콘텐츠 이미지용)
async function downloadImage(url, filename, targetDir = IMAGE_DIR) {
  const buffer = await downloadImageBuffer(url);
  const filepath = join(targetDir, filename);
  writeFileSync(filepath, buffer);
  const relativePath = targetDir === IMAGE_DIR
    ? `/images/blog/${filename}`
    : `/images/blog/${targetDir.split('/images/blog/')[1]}/${filename}`;
  return relativePath;
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

// 블록을 마크다운으로 변환 (이미지 처리 시 pageId 필요)
function blockToMarkdown(block, pageId = null, imageDownloader = null) {
  const type = block.type;
  const content = block[type];

  switch (type) {
    case "paragraph":
      return { text: richTextToMarkdown(content?.rich_text) + "\n", imagePromise: null };
    case "heading_1":
      return { text: `# ${richTextToMarkdown(content?.rich_text)}\n`, imagePromise: null };
    case "heading_2":
      return { text: `## ${richTextToMarkdown(content?.rich_text)}\n`, imagePromise: null };
    case "heading_3":
      return { text: `### ${richTextToMarkdown(content?.rich_text)}\n`, imagePromise: null };
    case "bulleted_list_item":
      return { text: `- ${richTextToMarkdown(content?.rich_text)}\n`, imagePromise: null };
    case "numbered_list_item":
      return { text: `1. ${richTextToMarkdown(content?.rich_text)}\n`, imagePromise: null };
    case "quote":
      return { text: `> ${richTextToMarkdown(content?.rich_text)}\n`, imagePromise: null };
    case "code":
      return { text: `\`\`\`${content?.language || ""}\n${richTextToMarkdown(content?.rich_text)}\n\`\`\`\n`, imagePromise: null };
    case "divider":
      return { text: "---\n", imagePromise: null };
    case "image":
      const url = content?.file?.url || content?.external?.url || "";
      const caption = richTextToMarkdown(content?.caption);

      // 이미지 다운로더가 제공된 경우 비동기로 처리
      if (imageDownloader && url && pageId) {
        const imagePromise = imageDownloader(url, pageId, caption);
        return { text: null, imagePromise, caption };
      }

      // 캡션이 있으면 alt에 포함 (크기 태그 포함)
      const altText = caption || "image";
      return { text: `![${altText}](${url})\n`, imagePromise: null };
    default:
      return { text: "", imagePromise: null };
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
async function getPageContent(pageId, isUpdated) {
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

    // postId별 이미지 저장 디렉토리
    const postImageDir = join(IMAGE_DIR, pageId.slice(0, 8));

    // 디렉토리 생성
    if (!existsSync(postImageDir)) {
      mkdirSync(postImageDir, { recursive: true });
    }

    // 이미지 다운로드 함수 (커버 이미지와 동일한 캐싱 로직 적용)
    const downloadContentImage = async (url, pageId, caption) => {
      const isExternalUrl = !url.includes("secure.notion-static.com") && !url.includes("prod-files-secure");

      if (isExternalUrl) {
        // 외부 URL은 그대로 사용
        return { localPath: url, caption };
      }

      const filename = generateFilename(url, pageId);
      const fullPath = join(postImageDir, filename);
      const localPath = `/images/blog/${pageId.slice(0, 8)}/${filename}`;

      // 파일이 없거나 포스트가 업데이트된 경우에만 다운로드
      if (!existsSync(fullPath)) {
        // 파일이 없으면 무조건 다운로드
        try {
          await downloadImage(url, filename, postImageDir);
          console.log(`  Downloaded content image (new): ${filename}`);
          return { localPath, caption };
        } catch (error) {
          console.error(`  Failed to download content image: ${error.message}`);
          return { localPath: url, caption };
        }
      } else if (isUpdated) {
        // 포스트가 업데이트되었으면 이미지도 다시 다운로드
        try {
          await downloadImage(url, filename, postImageDir);
          console.log(`  Downloaded content image (updated): ${filename}`);
          return { localPath, caption };
        } catch (error) {
          console.error(`  Failed to download content image: ${error.message}`);
          // 다운로드 실패 시 기존 파일 유지
          return { localPath, caption };
        }
      } else {
        // 파일이 존재하고 업데이트되지 않았으면 캐시 사용
        return { localPath, caption };
      }
    };

    // 블록을 마크다운으로 변환하며 이미지 프로미스 수집
    const results = blocks.map(block => blockToMarkdown(block, pageId, downloadContentImage));

    // 이미지 프로미스 처리
    const imagePromises = results
      .map((r, i) => ({ result: r, index: i }))
      .filter(item => item.result.imagePromise !== null);

    // 모든 이미지 다운로드 완료 대기
    const imageResults = await Promise.all(
      imagePromises.map(item => item.result.imagePromise)
    );

    // 결과를 인덱스에 맞게 매핑
    const imageMap = new Map();
    imagePromises.forEach((item, i) => {
      imageMap.set(item.index, imageResults[i]);
    });

    // 최종 마크다운 조합
    const markdownParts = results.map((r, i) => {
      if (r.text !== null) {
        return r.text;
      }
      // 이미지인 경우
      const imageData = imageMap.get(i);
      if (imageData) {
        const altText = imageData.caption || "image";
        return `![${altText}](${imageData.localPath})\n`;
      }
      return "";
    });

    return markdownParts.join("\n");
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
    // search API를 사용하여 모든 페이지 검색 (페이지네이션 적용)
    const allPages = [];
    let cursor;

    do {
      const response = await notion.search({
        filter: {
          property: "object",
          value: "page",
        },
        start_cursor: cursor,
        page_size: 100,
      });
      allPages.push(...response.results);
      cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);

    console.log(`Total pages found: ${allPages.length}`);

    // 디버깅: 첫 번째 페이지의 in_trash, archived 값 확인
    if (allPages.length > 0) {
      const samplePage = allPages[0];
      console.log(`Sample page - in_trash: ${samplePage.in_trash}, archived: ${samplePage.archived}`);
    }

    // 해당 데이터베이스에 속한 페이지만 필터링 + 휴지통/아카이브 페이지 제외
    const databasePages = allPages.filter((page) => {
      if (page.object !== "page") return false;
      if (page.in_trash === true) return false; // 휴지통에 있는 페이지 제외
      if (page.archived === true) return false; // 아카이브된 페이지 제외

      const parentType = page.parent?.type;
      const parentId =
        page.parent?.database_id?.replace(/-/g, "") ||
        page.parent?.data_source_id?.replace(/-/g, "");

      return (
        (parentType === "database_id" || parentType === "data_source_id") &&
        parentId === databaseId.replace(/-/g, "")
      );
    });

    console.log(`Database pages (excluding trash): ${databasePages.length}`);

    const posts = await Promise.all(
      databasePages.map(async (page) => {
        const properties = page.properties;

        // title 속성 찾기 (이름이 다를 수 있음)
        const titleProp = Object.values(properties).find(
          (p) => p.type === "title"
        );

        const title = titleProp?.title?.[0]?.plain_text || "Untitled";

        // 현재 페이지의 updatedAt 계산 (시분초 포함)
        const currentUpdatedAt =
          properties.updateAt?.date?.start ||
          page.last_edited_time ||
          new Date().toISOString();

        // 기존 포스트와 비교
        const existingPost = existingPostsMap.get(page.id);
        const isUpdated = !existingPost || existingPost.updatedAt !== currentUpdatedAt;

        // 페이지 본문 가져오기 (isUpdated 전달하여 이미지 다운로드 여부 결정)
        const content = await getPageContent(page.id, isUpdated);

        // 커버 이미지 처리 (원본 저장 없이 바로 배너/썸네일 생성)
        let coverImage = null;
        let thumbnailImage = null;
        const coverUrl = page.cover?.external?.url || page.cover?.file?.url;

        if (coverUrl) {
          try {
            const filename = generateFilename(coverUrl, page.id);
            const bannerFilename = filename.replace(/\.[^.]+$/, "-banner.jpg");
            const thumbFilename = filename.replace(/\.[^.]+$/, "-thumb.jpg");
            const bannerPath = join(IMAGE_DIR, bannerFilename);
            const thumbPath = join(IMAGE_DIR, thumbFilename);
            const bannerLocalPath = `/images/blog/${bannerFilename}`;
            const thumbLocalPath = `/images/blog/${thumbFilename}`;

            // 업데이트된 포스트이거나 배너 파일이 없는 경우
            if (isUpdated || !existsSync(bannerPath)) {
              // 이미지 버퍼 다운로드 (원본 저장 안함)
              const imageBuffer = await downloadImageBuffer(coverUrl);

              // 배너 이미지 생성 (1200px 최적화)
              const metadata = await sharp(imageBuffer).metadata();
              const bannerWidth = metadata.width > 1200 ? 1200 : metadata.width;
              await sharp(imageBuffer)
                .resize(bannerWidth, null, { fit: "inside", withoutEnlargement: true })
                .jpeg({ quality: 85 })
                .toFile(bannerPath);
              coverImage = bannerLocalPath;

              // 썸네일 생성 (400x225)
              await sharp(imageBuffer)
                .resize(400, 225, { fit: "cover" })
                .jpeg({ quality: 80 })
                .toFile(thumbPath);
              thumbnailImage = thumbLocalPath;

              console.log(`Optimized: ${title}`);
            } else if (!existsSync(thumbPath)) {
              // 배너는 있지만 썸네일이 없는 경우 - 배너에서 썸네일 생성
              coverImage = bannerLocalPath;
              await sharp(bannerPath)
                .resize(400, 225, { fit: "cover" })
                .jpeg({ quality: 80 })
                .toFile(thumbPath);
              thumbnailImage = thumbLocalPath;
              console.log(`Generated thumbnail from banner: ${title}`);
            } else {
              // 기존 이미지 경로 유지
              coverImage = bannerLocalPath;
              thumbnailImage = thumbLocalPath;
              console.log(`Skipped (unchanged): ${title}`);
            }
          } catch (error) {
            console.error(`Failed to process cover image for ${page.id}:`, error.message);
            // 다운로드 실패 시 기존 이미지 유지
            coverImage = existingPost?.coverImage || null;
            thumbnailImage = existingPost?.thumbnailImage || null;
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
            page.created_time ||
            new Date().toISOString(),
          updatedAt: currentUpdatedAt,
          category:
            properties.category?.select?.name || "",
          tags: properties.tag?.multi_select?.map((tag) => tag.name) || [],
          series:
            properties.series?.select?.name ||
            properties.series?.rich_text?.[0]?.plain_text ||
            null,
          coverImage,
          thumbnailImage,
          description:
            properties.description?.rich_text?.[0]?.plain_text || null,
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
