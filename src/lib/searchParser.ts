import type { BlogPost } from "@/types";

type FilterType = "text" | "series" | "category" | "tag";

interface SearchToken {
  type: FilterType;
  value: string;
}

interface SearchNode {
  type: "token" | "and" | "or";
  token?: SearchToken;
  left?: SearchNode;
  right?: SearchNode;
}

// 토큰 파싱: !시리즈, @카테고리, #태그, 일반텍스트
function parseToken(term: string): SearchToken {
  const trimmed = term.trim();
  if (trimmed.startsWith("!")) {
    return { type: "series", value: trimmed.slice(1).toLowerCase() };
  }
  if (trimmed.startsWith("@")) {
    return { type: "category", value: trimmed.slice(1).toLowerCase() };
  }
  if (trimmed.startsWith("#")) {
    return { type: "tag", value: trimmed.slice(1).toLowerCase() };
  }
  return { type: "text", value: trimmed.toLowerCase() };
}

// 토큰이 포스트와 매칭되는지 확인
function matchToken(token: SearchToken, post: BlogPost): boolean {
  switch (token.type) {
    case "series":
      return post.series?.toLowerCase().includes(token.value) ?? false;
    case "category":
      return post.category.toLowerCase().includes(token.value);
    case "tag":
      return post.tags.some((tag) => tag.toLowerCase().includes(token.value));
    case "text":
      return (
        post.title.toLowerCase().includes(token.value) ||
        post.content.toLowerCase().includes(token.value)
      );
  }
}

// 검색 노드를 평가
function evaluateNode(node: SearchNode, post: BlogPost): boolean {
  if (node.type === "token" && node.token) {
    return matchToken(node.token, post);
  }
  if (node.type === "and" && node.left && node.right) {
    return evaluateNode(node.left, post) && evaluateNode(node.right, post);
  }
  if (node.type === "or" && node.left && node.right) {
    return evaluateNode(node.left, post) || evaluateNode(node.right, post);
  }
  return true;
}

// 괄호 내용 찾기
function findMatchingParen(query: string, start: number): number {
  let depth = 1;
  for (let i = start + 1; i < query.length; i++) {
    if (query[i] === "(") depth++;
    if (query[i] === ")") depth--;
    if (depth === 0) return i;
  }
  return query.length;
}

// 쿼리 파싱 (재귀적)
function parseQuery(query: string): SearchNode | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  // OR 연산자로 먼저 분할 (가장 낮은 우선순위)
  // 괄호 밖의 | 찾기
  let depth = 0;
  let orIndex = -1;
  for (let i = trimmed.length - 1; i >= 0; i--) {
    if (trimmed[i] === ")") depth++;
    if (trimmed[i] === "(") depth--;
    if (depth === 0 && trimmed[i] === "|") {
      orIndex = i;
      break;
    }
  }

  if (orIndex !== -1) {
    const left = parseQuery(trimmed.slice(0, orIndex));
    const right = parseQuery(trimmed.slice(orIndex + 1));
    if (left && right) {
      return { type: "or", left, right };
    }
    return left || right;
  }

  // AND 연산자로 분할
  depth = 0;
  let andIndex = -1;
  for (let i = trimmed.length - 1; i >= 0; i--) {
    if (trimmed[i] === ")") depth++;
    if (trimmed[i] === "(") depth--;
    if (depth === 0 && trimmed[i] === "&") {
      andIndex = i;
      break;
    }
  }

  if (andIndex !== -1) {
    const left = parseQuery(trimmed.slice(0, andIndex));
    const right = parseQuery(trimmed.slice(andIndex + 1));
    if (left && right) {
      return { type: "and", left, right };
    }
    return left || right;
  }

  // 괄호 처리
  if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
    const inner = trimmed.slice(1, -1);
    // 전체가 괄호로 감싸진 경우만 처리
    let checkDepth = 0;
    let isFullyWrapped = true;
    for (let i = 0; i < inner.length; i++) {
      if (inner[i] === "(") checkDepth++;
      if (inner[i] === ")") checkDepth--;
      if (checkDepth < 0) {
        isFullyWrapped = false;
        break;
      }
    }
    if (isFullyWrapped && checkDepth === 0) {
      return parseQuery(inner);
    }
  }

  // 단일 토큰
  const token = parseToken(trimmed);
  if (token.value) {
    return { type: "token", token };
  }

  return null;
}

// 메인 검색 함수
export function searchPosts(posts: BlogPost[], query: string): BlogPost[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return posts;

  const searchTree = parseQuery(trimmedQuery);
  if (!searchTree) return posts;

  return posts.filter((post) => evaluateNode(searchTree, post));
}

// 검색 도움말 텍스트
export const searchHelp = {
  text: "제목/내용 검색",
  series: "!시리즈명",
  category: "@카테고리명",
  tag: "#태그명",
  and: "& (AND)",
  or: "| (OR)",
  group: "() (그룹)",
};
