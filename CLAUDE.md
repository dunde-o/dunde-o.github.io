# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev             # Start dev server on localhost:8080
yarn build           # Production build to dist/ (uses vite-react-ssg for SSG)
yarn lint            # Run ESLint
yarn preview         # Preview production build
yarn deploy          # Deploy to GitHub Pages (runs predeploy automatically)

# Notion & SEO
yarn fetch:notion    # Fetch blog posts from Notion API → src/data/posts.json
yarn generate:seo    # Generate RSS feed and sitemap → public/
```

## Architecture

React + TypeScript portfolio site with Notion-powered blog, deployed to GitHub Pages.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Notion API, vite-react-ssg (Static Site Generation)

**Key Directories:**
- `src/pages/` - Route components (Index, About, Blog, BlogPost, NotFound)
- `src/components/` - Custom components (Navbar, ProjectCard, BlogPostCard, Quiz, QuizList, TableOfContents, etc.)
- `src/components/ui/` - shadcn/ui components
- `src/data/` - Static JSON data (projects.json, posts.json)
- `src/types/` - TypeScript type definitions
- `src/lib/` - Utilities (notion.ts for blog data access, search.ts for blog search)
- `scripts/` - Build-time scripts (fetch-notion.js, generate-rss.js, generate-sitemap.js)

**Routing:** Configured in `src/App.tsx`. Routes: `/`, `/about`, `/blog`, `/blog/:slug`, `*` (404)

**Path Alias:** `@/` maps to `src/`

## Blog System

Blog posts are fetched from Notion at build time (not runtime) due to GitHub Pages limitations.

**Flow:**
1. `fetch:notion` - Fetches pages from Notion database, converts blocks to markdown, saves to `src/data/posts.json`
2. `generate:seo` - Generates `public/rss.xml` and `public/sitemap.xml` from posts.json
3. React app imports posts.json directly

**Environment:** Requires `.env` with `VITE_NOTION_API_KEY` and `VITE_NOTION_DATABASE_ID`

## Blog Content Markers

Special markers in blog markdown content are parsed and rendered as interactive components:

- `🅰️` - Renders AdPlaceholder component (horizontal ad)
- `❔{...}❔` - Renders Quiz component (single question, objective or subjective)
- `❔[{...}]❔` or `❔{"items":[...]}❔` - Renders QuizList component (multiple questions with batch grading)

**Quiz JSON Format:**
- Objective: `{"question":"...", "options":["A","B","C"], "answer":0, "explanation":"..."}`
- Subjective: `{"question":"...", "answer":"text", "explanation":"..."}`
- List: `[{...quiz1}, {...quiz2}]` or `{"items":[...]}`

**Note:** Notion's special quotes (`""''`) are automatically normalized to standard quotes before JSON parsing.

## Image Caption Syntax

Images in blog posts support size and position control via caption prefix tags:

**Format:** `[{size}{position}] caption text`

**Size (required when using tag):**
- `s` - Small (1/3 width)
- `m` - Medium (1/2 width)
- `l` - Large (full width)

**Position (optional, defaults to center):**
- `l` - Left align
- `c` - Center align
- `r` - Right align

**Examples:**
- `[mc]` - Medium size, centered (default position)
- `[sl]` - Small size, left aligned
- `[mr]` - Medium size, right aligned
- `[l]` - Large/full size, centered (position omitted = center)
- No tag - Full size, centered

**Image Caching:**
- Content images are saved to `public/images/blog/{postId}/`
- Images are only re-downloaded when the post's `updatedAt` changes
- External URLs (non-Notion) are used as-is without downloading

## Styling

- Dark theme by default (CSS variables in `src/index.css`)
- Colors use HSL format
- Custom animations: `fade-in`, `slide-up`, `scale-in` (tailwind.config.ts)

## Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```
