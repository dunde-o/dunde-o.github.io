# Dunde's Portfolio

프론트엔드 개발과 생성형 AI를 결합하여 새로운 가치를 창출하는 개발자 Dunde의 포트폴리오입니다.

**URL**: https://www.dunde.kr/

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (Radix UI)
- React Router
- TanStack Query

## Getting Started

```sh
# Install dependencies
yarn install

# Start development server (localhost:8080)
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

## Deployment

main 브랜치에 push하면 husky pre-push 훅을 통해 자동으로 GitHub Pages에 배포됩니다.

```sh
# Manual deploy
yarn deploy
```

## Project Structure

```
src/
├── components/     # 컴포넌트
│   ├── ui/        # shadcn/ui 컴포넌트
│   ├── Navbar.tsx
│   ├── NavLink.tsx
│   └── ProjectCard.tsx
├── hooks/         # 커스텀 훅
├── lib/           # 유틸리티
├── pages/         # 페이지 컴포넌트
│   ├── Index.tsx  # 프로젝트 목록 (/)
│   ├── About.tsx  # 소개 (/about)
│   └── NotFound.tsx
├── App.tsx        # 라우팅 설정
└── main.tsx       # 엔트리 포인트
```
