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

## Blog Content Markers (치환자)

노션에서 블로그 포스트 작성 시 특수 마커를 사용하여 동적 콘텐츠를 삽입할 수 있습니다.

### 광고 삽입 (🅰️)

마크다운 중간에 `🅰️` 이모지를 넣으면 해당 위치에 가로 광고가 표시됩니다.

```markdown
여기는 일반 마크다운 텍스트입니다.

🅰️

여기부터 다시 마크다운 텍스트가 이어집니다.
```

### 퀴즈 삽입 (❔...❔)

`❔`와 `❔` 사이에 JSON 형식으로 퀴즈 데이터를 넣으면 퀴즈가 표시됩니다.

#### 객관식 퀴즈

**형식:**
```markdown
❔{"question":"질문 내용","options":["보기1","보기2","보기3","보기4"],"answer":1,"explanation":"해설 (선택)"}❔
```

**필드 설명:**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `question` | string | O | 문제 내용 |
| `options` | string[] | O | 보기 배열 (2~4개) |
| `answer` | number | O | 정답 인덱스 (0부터 시작) |
| `explanation` | string | X | 정답/오답 시 표시되는 해설 |

**예시:**
```markdown
❔{"question":"React에서 컴포넌트의 상태를 관리하는 훅은?","options":["useEffect","useState","useRef","useMemo"],"answer":1,"explanation":"useState는 함수형 컴포넌트에서 상태를 선언하고 업데이트할 수 있게 해주는 훅입니다."}❔
```

**동작:**
- 보기 순서는 페이지 로드 시 랜덤으로 섞임 (정답도 자동 조정)
- 사용자가 보기를 클릭하면 정답/오답 여부가 표시됨
- 정답: 초록색 하이라이트 + 체크 아이콘
- 오답: 빨간색 하이라이트 + X 아이콘 + 정답 표시
- 해설이 있으면 결과 아래에 표시됨

#### 주관식 퀴즈 (단답형)

`options`를 생략하면 단답형 주관식 퀴즈로 표시됩니다.

**형식:**
```markdown
❔{"question":"질문 내용","answer":"정답 텍스트","explanation":"해설 (선택)"}❔
```

**필드 설명:**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `question` | string | O | 문제 내용 |
| `answer` | string | O | 정답 텍스트 (대소문자 구분 안함) |
| `explanation` | string | X | 정답/오답 시 표시되는 해설 |

**예시:**
```markdown
❔{"question":"JavaScript에서 변수를 선언할 때 사용하는 키워드 중 블록 스코프를 가지는 것은?","answer":"let","explanation":"let과 const는 블록 스코프를 가지며, var는 함수 스코프를 가집니다."}❔
```

**동작:**
- 텍스트 입력 필드와 확인 버튼이 표시됨
- Enter 키 또는 확인 버튼으로 제출
- 대소문자 구분 없이 정답 체크
- 오답 시 정답 텍스트가 표시됨

#### 리스트형 퀴즈 (일괄 채점)

여러 문제를 한 번에 풀고 마지막에 일괄 채점하는 형식입니다. 객관식과 주관식을 섞어서 사용할 수 있습니다.

**형식 (두 가지 모두 지원):**
```markdown
// 배열 형식 (간결)
❔[{"question":"문제1","options":["보기1","보기2"],"answer":0},{"question":"문제2","answer":"정답"}]❔

// items 객체 형식
❔{"items":[{"question":"문제1","options":["보기1","보기2"],"answer":0},{"question":"문제2","answer":"정답"}]}❔
```

**필드 설명:**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| 배열 또는 `items` | array | O | 퀴즈 문제 배열 |
| `[].question` | string | O | 문제 내용 |
| `[].options` | string[] | X | 보기 배열 (객관식일 때) |
| `[].answer` | number\|string | O | 정답 (객관식: 인덱스, 주관식: 텍스트) |

**예시:**
```markdown
❔[{"question":"React의 상태 관리 훅은?","options":["useEffect","useState","useRef"],"answer":1},{"question":"JavaScript의 패키지 관리자는?","answer":"npm"},{"question":"CSS 전처리기가 아닌 것은?","options":["SASS","LESS","TypeScript","Stylus"],"answer":2}]❔
```

**동작:**
- 모든 문제에 답변해야 "정답 확인하기" 버튼이 활성화됨
- 객관식 보기 순서는 각각 랜덤으로 섞임
- 채점 시 각 문제별로 정답/오답 표시
- 총점 표시 (예: "3문제 중 2문제 정답!")
- 모든 문제를 맞추면 축하 이모지 표시
