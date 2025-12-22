import "dotenv/config";
import { Client } from "@notionhq/client";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const notion = new Client({
  auth: process.env.VITE_NOTION_API_KEY,
});

const databaseId = process.env.VITE_NOTION_DATABASE_ID;

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

        // 페이지 본문 가져오기
        const content = await getPageContent(page.id);

        return {
          id: page.id,
          title: titleProp?.title?.[0]?.plain_text || "Untitled",
          slug:
            properties.slug?.rich_text?.[0]?.plain_text ||
            page.id.replace(/-/g, ""),
          createdAt:
            properties.createAt?.date?.start ||
            page.created_time?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          updatedAt:
            properties.updateAt?.date?.start ||
            page.last_edited_time?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          category:
            properties.category?.select?.name || "",
          tags: properties.tag?.multi_select?.map((tag) => tag.name) || [],
          coverImage:
            page.cover?.external?.url || page.cover?.file?.url || null,
          content,
        };
      })
    );

    // createdAt 기준 내림차순 정렬
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const outputPath = join(__dirname, "../src/data/posts.json");
    writeFileSync(outputPath, JSON.stringify(posts, null, 2), "utf-8");

    console.log(`Successfully fetched ${posts.length} posts`);
    console.log(`Saved to: ${outputPath}`);
  } catch (error) {
    console.error("Error fetching from Notion:", error.message);

    // 에러 시 빈 배열로 저장 (빌드 실패 방지)
    const outputPath = join(__dirname, "../src/data/posts.json");
    writeFileSync(outputPath, JSON.stringify([], null, 2), "utf-8");
    console.log("Created empty posts.json as fallback");
  }
}

fetchBlogPosts();
