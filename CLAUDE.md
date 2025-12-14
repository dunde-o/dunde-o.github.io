# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on localhost:8080
npm run build    # Production build to dist/
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

This is a React + TypeScript portfolio site built with Vite and styled using Tailwind CSS with shadcn/ui components.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix UI), React Router, TanStack Query

**Key Directories:**
- `src/pages/` - Route components (Index, About, NotFound)
- `src/components/` - Custom components (Navbar, ProjectCard, NavLink)
- `src/components/ui/` - shadcn/ui components
- `src/hooks/` - Custom hooks (use-mobile, use-toast)
- `src/lib/utils.ts` - Utility functions (cn helper)

**Routing:** Configured in `src/App.tsx` using React Router. Routes: `/`, `/about`, `*` (404)

**Path Alias:** `@/` maps to `src/` (configured in vite.config.ts and tsconfig)

## Styling

- Dark theme by default (defined in `src/index.css` using CSS variables)
- All colors use HSL format via CSS custom properties
- Custom animations: `fade-in`, `slide-up`, `scale-in` (defined in tailwind.config.ts)
- shadcn/ui uses `components.json` for configuration

## Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

Components install to `src/components/ui/`.
