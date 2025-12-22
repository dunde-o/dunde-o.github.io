import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_URL = "https://www.dunde.kr";
const SITE_TITLE = "Dunde's Blog";
const SITE_DESCRIPTION = "개발 여정에서 배운 것들과 생각을 기록합니다.";

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripMarkdown(content) {
  return content
    .replace(/```[\s\S]*?```/g, "") // 코드 블록 제거
    .replace(/`[^`]*`/g, "") // 인라인 코드 제거
    .replace(/#{1,6}\s/g, "") // 헤딩 제거
    .replace(/[*_~]/g, "") // 볼드, 이탤릭, 취소선 제거
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 링크 텍스트만 남기기
    .replace(/!\[.*?\]\(.*?\)/g, "") // 이미지 제거
    .replace(/>\s/g, "") // 인용 제거
    .replace(/-\s/g, "") // 리스트 제거
    .replace(/\n{2,}/g, " ") // 여러 줄바꿈 정리
    .trim()
    .slice(0, 300);
}

function generateRss() {
  console.log("Generating RSS feed...");

  try {
    const postsPath = join(__dirname, "../src/data/posts.json");
    const posts = JSON.parse(readFileSync(postsPath, "utf-8"));

    const rssItems = posts
      .map((post) => {
        const pubDate = new Date(post.createdAt).toUTCString();
        const description = stripMarkdown(post.content);

        return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ""}
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`;
      })
      .join("\n");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>`;

    const outputPath = join(__dirname, "../public/rss.xml");
    writeFileSync(outputPath, rss, "utf-8");
    console.log(`RSS feed generated: ${outputPath}`);
  } catch (error) {
    console.error("Error generating RSS:", error.message);
  }
}

generateRss();
