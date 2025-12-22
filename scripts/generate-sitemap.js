import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_URL = "https://www.dunde.kr";

function generateSitemap() {
  console.log("Generating sitemap...");

  try {
    const postsPath = join(__dirname, "../src/data/posts.json");
    const posts = JSON.parse(readFileSync(postsPath, "utf-8"));

    // 정적 페이지
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "weekly" },
      { url: "/about", priority: "0.8", changefreq: "monthly" },
      { url: "/blog", priority: "0.9", changefreq: "daily" },
    ];

    const staticUrls = staticPages
      .map(
        (page) => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
      )
      .join("\n");

    // 블로그 포스트 페이지
    const postUrls = posts
      .map((post) => {
        const lastmod = post.updatedAt || post.createdAt;
        return `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      })
      .join("\n");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${postUrls}
</urlset>`;

    const outputPath = join(__dirname, "../public/sitemap.xml");
    writeFileSync(outputPath, sitemap, "utf-8");
    console.log(`Sitemap generated: ${outputPath}`);
  } catch (error) {
    console.error("Error generating sitemap:", error.message);
  }
}

generateSitemap();
