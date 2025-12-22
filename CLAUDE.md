# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev             # Start dev server on localhost:8080
yarn build           # Production build to dist/
yarn lint            # Run ESLint
yarn preview         # Preview production build
yarn deploy          # Deploy to GitHub Pages (runs predeploy automatically)

# Notion & SEO
yarn fetch:notion    # Fetch blog posts from Notion API → src/data/posts.json
yarn generate:seo    # Generate RSS feed and sitemap → public/
```

## Architecture

React + TypeScript portfolio site with Notion-powered blog, deployed to GitHub Pages.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Notion API

**Key Directories:**
- `src/pages/` - Route components (Index, About, Blog, BlogPost, NotFound)
- `src/components/` - Custom components (Navbar, ProjectCard, BlogPostCard, NavLink)
- `src/components/ui/` - shadcn/ui components
- `src/data/` - Static JSON data (projects.json, posts.json)
- `src/types/` - TypeScript type definitions
- `src/lib/` - Utilities (notion.ts for blog data access)
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

## Styling

- Dark theme by default (CSS variables in `src/index.css`)
- Colors use HSL format
- Custom animations: `fade-in`, `slide-up`, `scale-in` (tailwind.config.ts)

## Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```
