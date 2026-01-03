import { useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AdPlaceholder from "@/components/AdPlaceholder";
import ImageWithLoader from "@/components/ImageWithLoader";
import CodeBlock from "@/components/CodeBlock";
import TableOfContents from "@/components/TableOfContents";
import Giscus from "@/components/Giscus";
import Quiz from "@/components/Quiz";
import QuizList from "@/components/QuizList";
import posts from "@/data/posts.json";
import type { BlogPost as BlogPostType } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { ChevronLeft, ChevronRight, Edit3 } from "lucide-react";
import LZString from "lz-string";

// 노션 특수 따옴표를 표준 따옴표로 변환
const normalizeQuotes = (str: string) =>
  str
    .replace(/[""]/g, '"') // 특수 쌍따옴표 → 표준 쌍따옴표
    .replace(/['']/g, "'"); // 특수 홑따옴표 → 표준 홑따옴표

// 퀴즈 JSON 파싱 함수
const parseQuizData = (quizString: string) => {
  try {
    const normalized = normalizeQuotes(quizString.trim());
    const data = JSON.parse(normalized);

    // 리스트형 퀴즈: 배열이거나 items 배열이 있는 경우
    const items = Array.isArray(data) ? data : data.items;
    if (Array.isArray(items) && items.length > 0) {
      // 각 아이템이 유효한 퀴즈인지 확인
      const validItems = items.every(
        (item: { question?: string; answer?: unknown }) =>
          item.question && item.answer !== undefined
      );
      if (validItems) {
        return { type: "list", items };
      }
      return null;
    }

    // 단일 퀴즈: question + answer
    if (data.question && data.answer !== undefined) {
      // 객관식인 경우 options 배열과 number answer 확인
      if (Array.isArray(data.options) && data.options.length > 0) {
        if (typeof data.answer === "number") {
          return { type: "single", data };
        }
        return null;
      }
      // 주관식인 경우 (options 없음)
      return { type: "single", data };
    }
    return null;
  } catch {
    return null;
  }
};

// 콘텐츠를 마크다운과 특수 요소로 분리
const parseContent = (content: string) => {
  // 🅰️ (광고)와 ❔...❔ (퀴즈) 패턴으로 분리
  const parts: { type: "markdown" | "ad" | "quiz"; content: string }[] = [];

  // 먼저 광고와 퀴즈를 찾아서 분리
  const regex = /(🅰️|❔[\s\S]*?❔)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // 이전 마크다운 부분
    if (match.index > lastIndex) {
      parts.push({
        type: "markdown",
        content: content.slice(lastIndex, match.index),
      });
    }

    // 매칭된 특수 요소
    if (match[0] === "🅰️") {
      parts.push({ type: "ad", content: "" });
    } else if (match[0].startsWith("❔")) {
      // ❔...❔ 사이의 JSON 추출
      const quizContent = match[0].slice(1, -1).trim();
      parts.push({ type: "quiz", content: quizContent });
    }

    lastIndex = regex.lastIndex;
  }

  // 마지막 마크다운 부분
  if (lastIndex < content.length) {
    parts.push({
      type: "markdown",
      content: content.slice(lastIndex),
    });
  }

  return parts;
};

const generateId = (text: string) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, "")
    .replace(/\s+/g, "-");

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const typedPosts = posts as BlogPostType[];
  const post = typedPosts.find((p) => p.slug === slug);

  // 같은 시리즈의 이전/다음 포스트 찾기
  const seriesNavigation = useMemo(() => {
    if (!post?.series) return null;

    const seriesPosts = typedPosts
      .filter((p) => p.series === post.series)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const currentIndex = seriesPosts.findIndex((p) => p.slug === slug);
    if (currentIndex === -1) return null;

    return {
      seriesName: post.series,
      totalCount: seriesPosts.length,
      currentIndex: currentIndex + 1,
      prev: currentIndex > 0 ? seriesPosts[currentIndex - 1] : null,
      next: currentIndex < seriesPosts.length - 1 ? seriesPosts[currentIndex + 1] : null,
    };
  }, [post, typedPosts, slug]);

  // 전체 글 순서로 이전/다음 포스트 찾기 (createdAt 내림차순 기준)
  const postNavigation = useMemo(() => {
    if (!post) return null;

    // posts.json은 이미 createdAt 내림차순으로 정렬되어 있음
    const currentIndex = typedPosts.findIndex((p) => p.slug === slug);
    if (currentIndex === -1) return null;

    return {
      // 내림차순이므로 prev는 인덱스가 더 큰 것(더 오래된 글), next는 인덱스가 더 작은 것(더 최신 글)
      prev: currentIndex < typedPosts.length - 1 ? typedPosts[currentIndex + 1] : null,
      next: currentIndex > 0 ? typedPosts[currentIndex - 1] : null,
    };
  }, [post, typedPosts, slug]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Dunde's Blog`;
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              포스트를 찾을 수 없습니다
            </h1>
            <button
              onClick={() => navigate("/blog")}
              className="text-primary hover:underline"
            >
              블로그 목록으로 돌아가기
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* 좌측 세로 광고 - 1900px 이상에서 목차 대칭 위치 */}
      <div className="hidden min-[1900px]:block fixed left-[calc(32px+256px+24px)] top-1/2 -translate-y-1/2">
        <AdPlaceholder type="vertical" />
      </div>

      {/* 우측 세로 광고 - 1900px 이상에서 목차와 글 사이 */}
      <div className="hidden min-[1900px]:block fixed right-[calc(32px+256px+24px)] top-1/2 -translate-y-1/2">
        <AdPlaceholder type="vertical" />
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <article className="animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/blog")}
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <span>←</span>
              <span>목록으로</span>
            </button>
            <Link
              to={`/blog/preview?d=${LZString.compressToEncodedURIComponent(JSON.stringify({ t: post.title, c: post.content }))}&from=${encodeURIComponent(post.slug)}`}
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>글쓰기 프리뷰</span>
            </Link>
          </div>

          {post.coverImage && (
            <div className="mb-8 rainbow-border">
              <div className="overflow-hidden">
                <ImageWithLoader
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover"
                  containerClassName="w-full h-64 md:h-96"
                  block
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {post.series && (
              <Link
                to={`/blog?q=!${encodeURIComponent(post.series)}`}
                className="px-3 py-1 text-sm rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 hover:shadow-[0_0_8px_rgba(244,63,94,0.4)] transition-all"
              >
                {post.series}
              </Link>
            )}
            {post.category && (
              <Link
                to={`/blog?q=@${encodeURIComponent(post.category)}`}
                className="px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-[0_0_8px_rgba(148,163,184,0.4)] transition-all"
              >
                {post.category}
              </Link>
            )}
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog?q=%23${encodeURIComponent(tag)}`}
                className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-[0_0_8px_rgba(var(--primary),0.4)] transition-all"
              >
                {tag}
              </Link>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground break-keep">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <time>
              {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
            {post.updatedAt !== post.createdAt && (
              <span>
                (수정:{" "}
                {new Date(post.updatedAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                )
              </span>
            )}
          </div>

          <hr className="border-border my-10" />

          {/* 헤더와 콘텐츠 사이 가로 광고 */}
          <AdPlaceholder type="horizontal" />

          <div className="prose prose-invert prose-lg max-w-none break-keep">
            {parseContent(post.content).map((part, index) => {
              if (part.type === "ad") {
                return (
                  <div key={index} className="my-8">
                    <AdPlaceholder type="horizontal" />
                  </div>
                );
              }

              if (part.type === "quiz") {
                const quizResult = parseQuizData(part.content);
                if (quizResult) {
                  if (quizResult.type === "list") {
                    return (
                      <QuizList
                        key={`${slug}-quiz-${index}`}
                        items={quizResult.items}
                      />
                    );
                  }
                  return (
                    <Quiz
                      key={`${slug}-quiz-${index}`}
                      question={quizResult.data.question}
                      options={quizResult.data.options}
                      answer={quizResult.data.answer}
                      explanation={quizResult.data.explanation}
                    />
                  );
                }
                return null;
              }

              return (
                <ReactMarkdown
                  key={index}
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeRaw, rehypeKatex]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeString = String(children).replace(/\n$/, "");
                      // 언어가 지정되었거나, 여러 줄이면 코드 블록으로 처리
                      const isBlock = match || codeString.includes("\n");
                      const language = match ? match[1] : "text";

                      return isBlock ? (
                        <CodeBlock language={language}>
                          {codeString}
                        </CodeBlock>
                      ) : (
                        <code
                          className="bg-muted px-1.5 py-0.5 rounded text-sm"
                          style={{ fontFamily: "'D2Coding', monospace" }}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    h1: ({ children }) => (
                      <h1
                        id={generateId(String(children))}
                        className="text-3xl font-bold mt-12 mb-4 text-foreground"
                      >
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2
                        id={generateId(String(children))}
                        className="text-2xl font-bold mt-10 mb-4 text-foreground"
                      >
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3
                        id={generateId(String(children))}
                        className="text-xl font-semibold mt-8 mb-3 text-foreground"
                      >
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc text-muted-foreground mb-4 pl-6 [&_ul]:mt-0 [&_ul]:mb-0">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal text-muted-foreground mb-4 pl-6 [&_ol]:mt-0 [&_ol]:mb-0">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="my-1 [&>p]:mb-1">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6">
                        {children}
                      </blockquote>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    hr: () => <hr className="border-border my-8" />,
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6">
                        <table className="min-w-full border-collapse border border-border">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-primary/40 border-b-2 border-primary/50 [&_tr]:hover:bg-transparent">
                        {children}
                      </thead>
                    ),
                    th: ({ children }) => (
                      <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">
                        {children}
                      </th>
                    ),
                    tr: ({ children }) => (
                      <tr className="group/row hover:bg-white/30 transition-colors">
                        {children}
                      </tr>
                    ),
                    td: ({ children }) => (
                      <td className="border border-border px-4 py-2 text-muted-foreground group-hover/row:text-white">
                        {children}
                      </td>
                    ),
                    img: ({ src, alt }) => {
                      // 캡션에서 크기+위치 태그 파싱 ([sl], [mc], [lr] 등)
                      // 첫 글자: 크기 (s=1/3, m=1/2, l=full)
                      // 두 번째 글자: 위치 (l=left, c=center, r=right)
                      const tagMatch = alt?.match(/^\[([sml])([lcr])?\]/i);
                      const sizeTag = tagMatch ? tagMatch[1].toLowerCase() : null;
                      const posTag = tagMatch ? (tagMatch[2]?.toLowerCase() || "c") : "c";
                      const cleanAlt = alt?.replace(/^\[[sml][lcr]?\]\s*/i, "") || "";

                      // 크기에 따른 너비 클래스
                      const sizeClass = sizeTag === "s"
                        ? "w-1/3"
                        : sizeTag === "m"
                        ? "w-1/2"
                        : sizeTag === "l"
                        ? "w-full"
                        : "max-w-full";

                      // 위치에 따른 정렬 클래스
                      const alignClass = posTag === "l"
                        ? "justify-start"
                        : posTag === "r"
                        ? "justify-end"
                        : "justify-center";

                      return (
                        <span className="block my-6">
                          <span className={`flex ${alignClass}`}>
                            <ImageWithLoader
                              src={src || ""}
                              alt={cleanAlt}
                              className="rounded-lg"
                              containerClassName={sizeClass}
                            />
                          </span>
                          {cleanAlt && cleanAlt !== "image" && (
                            <span className="block text-center text-sm text-muted-foreground mt-2">
                              {cleanAlt}
                            </span>
                          )}
                        </span>
                      );
                    },
                  }}
                >
                  {part.content}
                </ReactMarkdown>
              );
            })}
          </div>

          {/* 전체 글 순서 네비게이션 */}
          <div className="mt-16 pt-8 border-t border-border">
            <div className="flex gap-4">
              {postNavigation?.prev ? (
                <Link
                  to={`/blog/${postNavigation.prev.slug}`}
                  className="w-1/2 min-w-0 p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card-hover transition-all group"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                    <span>이전 글</span>
                  </div>
                  <p className="text-foreground group-hover:text-primary transition-colors truncate">
                    {postNavigation.prev.title}
                  </p>
                </Link>
              ) : (
                <div className="w-1/2 min-w-0 p-4 rounded-lg border border-border/50 bg-card/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground/50 mb-1">
                    <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                    <span>이전 글</span>
                  </div>
                  <p className="text-muted-foreground/50 truncate">
                    이전 글이 없습니다.
                  </p>
                </div>
              )}

              {postNavigation?.next ? (
                <Link
                  to={`/blog/${postNavigation.next.slug}`}
                  className="w-1/2 min-w-0 p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card-hover transition-all group text-right"
                >
                  <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-1">
                    <span>다음 글</span>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  </div>
                  <p className="text-foreground group-hover:text-primary transition-colors truncate">
                    {postNavigation.next.title}
                  </p>
                </Link>
              ) : (
                <div className="w-1/2 min-w-0 p-4 rounded-lg border border-border/50 bg-card/50 text-right">
                  <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground/50 mb-1">
                    <span>다음 글</span>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  </div>
                  <p className="text-muted-foreground/50 truncate">
                    다음 글이 없습니다.
                  </p>
                </div>
              )}
            </div>

            {/* 목록으로 돌아가기 */}
            <div className="mt-6 text-center">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <span>목록으로 돌아가기</span>
              </Link>
            </div>
          </div>

          {/* 네비게이션과 댓글 사이 가로 광고 */}
          <div className="mt-12">
            <AdPlaceholder type="horizontal" />
          </div>

          {/* 댓글 */}
          <Giscus slug={post.slug} />

          {/* 댓글 하단 가로 광고 */}
          <div className="mt-12">
            <AdPlaceholder type="horizontal" />
          </div>
        </article>
      </main>

      <TableOfContents content={post.content} seriesNavigation={seriesNavigation} />
    </div>
  );
};

export default BlogPost;
