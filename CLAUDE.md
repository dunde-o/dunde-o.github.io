# CLAUDE.md

## Commands
```bash
yarn dev          # dev :8080
yarn build        # SSG → dist/
yarn deploy       # GitHub Pages
yarn fetch:notion # Notion→posts.json
yarn generate:seo # RSS+sitemap
```

## Structure
- `src/pages/` - routes (Index, About, Blog, BlogPost, BlogPreview, NotFound)
- `src/components/` - Quiz, QuizList, MermaidChart, TableOfContents, etc.
- `src/components/ui/` - shadcn/ui
- `src/data/` - posts.json, projects.json
- `src/routes.tsx` - routing
- `scripts/` - fetch-notion.js, generate-rss.js, generate-sitemap.js

## Blog
Notion→build time→posts.json→React import. Env: `VITE_NOTION_API_KEY`, `VITE_NOTION_DATABASE_ID`

## Markers
| Marker | Use |
|--------|-----|
| `🅰️` | Ad |
| `❔{...}❔` | Quiz(single) |
| `❔[...]❔` | Quiz(list) |

Quiz JSON: `{"question":"...", "options":[...], "answer":1, "explanation":"..."}` (1-based)

## Image Caption
`[{size}{position}]` - size: s/m/l, position: l/c/r (e.g. `[mc]`=medium+center)

## Reference
| Task | File |
|------|------|
| Blog writing (md, math, diagram, quiz) | `BLOG_POST_GUIDE.md` |
| Mermaid theme/color | `src/components/MermaidChart.tsx` |
| Blog rendering | `src/pages/BlogPost.tsx`, `src/pages/BlogPreview.tsx` |
| Styling | `src/index.css`, `tailwind.config.ts` |
| Notion fetch | `scripts/fetch-notion.js` |
| Types | `src/types/index.ts` |

## shadcn/ui
```bash
npx shadcn@latest add <component>
```
