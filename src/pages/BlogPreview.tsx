import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Monitor, FileText } from "lucide-react";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import Navbar from "@/components/Navbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import QuizList from "@/components/QuizList";
import AdPlaceholder from "@/components/AdPlaceholder";
import ImageWithLoader from "@/components/ImageWithLoader";

const MIN_WIDTH = 1500;

const BlogPreview = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const proseRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<"editor" | "preview" | null>(null);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialFromRef = useRef<string | null>(null);
  const isFirstUpdateRef = useRef(true);

  // 줄 번호 배열 생성
  const lines = useMemo(() => content.split("\n"), [content]);

  // URL 파라미터에서 초기값 로드
  useEffect(() => {
    initialFromRef.current = searchParams.get("from");
    const dataParam = searchParams.get("d");
    if (dataParam) {
      try {
        const decompressed = decompressFromEncodedURIComponent(dataParam);
        if (decompressed) {
          const data = JSON.parse(decompressed);
          if (data.t) setTitle(data.t);
          if (data.c) setContent(data.c);
        }
      } catch {
        // 파싱 실패시 무시
      }
    }
    setIsInitialized(true);
  }, []);

  // 제목/내용 변경시 URL 업데이트 (debounce)
  useEffect(() => {
    if (!isInitialized) return;

    // 초기 로드 후 첫 번째 업데이트는 스킵 (URL에서 읽은 값으로 인한 불필요한 재작성 방지)
    if (isFirstUpdateRef.current) {
      isFirstUpdateRef.current = false;
      return;
    }

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      const fromParam = initialFromRef.current;
      if (title || content) {
        const data = JSON.stringify({ t: title, c: content });
        const compressed = compressToEncodedURIComponent(data);
        const newParams: Record<string, string> = { d: compressed };
        if (fromParam) newParams.from = fromParam;
        setSearchParams(newParams, { replace: true });
      } else {
        const newParams: Record<string, string> = {};
        if (fromParam) newParams.from = fromParam;
        setSearchParams(newParams, { replace: true });
      }
    }, 500);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [title, content, isInitialized, setSearchParams]);

  useEffect(() => {
    document.title = "글쓰기 프리뷰 | Blog";

    const checkWidth = () => {
      setIsSupported(window.innerWidth >= MIN_WIDTH);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // 스크롤 동기화 핸들러
  const syncScroll = useCallback((source: "editor" | "preview") => {
    if (isScrollingRef.current && isScrollingRef.current !== source) return;

    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    isScrollingRef.current = source;

    const sourceEl = source === "editor" ? editor : preview;
    const targetEl = source === "editor" ? preview : editor;

    const scrollRatio = sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight || 1);
    const targetScrollTop = scrollRatio * (targetEl.scrollHeight - targetEl.clientHeight);

    targetEl.scrollTop = targetScrollTop;

    // 스크롤 잠금 해제 (debounce)
    setTimeout(() => {
      isScrollingRef.current = null;
    }, 50);
  }, []);

  // 에디터 스크롤시 줄 번호 동기화
  const handleEditorScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.style.transform = `translateY(-${scrollTop}px)`;
    }
    syncScroll("editor");
  }, [syncScroll]);

  // 마크다운 콘텐츠 파싱 (광고, 퀴즈 등)
  const parseContent = (text: string) => {
    const parts: { type: string; content: string }[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      // 광고 마커 찾기
      const adIndex = remaining.indexOf("🅰️");
      // 퀴즈 마커 찾기
      const quizMatch = remaining.match(/❔(\{[\s\S]*?\}|\[[\s\S]*?\])❔/);
      const quizIndex = quizMatch ? remaining.indexOf(quizMatch[0]) : -1;

      const nextMarkerIndex = [adIndex, quizIndex]
        .filter((i) => i !== -1)
        .sort((a, b) => a - b)[0];

      if (nextMarkerIndex === undefined) {
        if (remaining.trim()) {
          parts.push({ type: "markdown", content: remaining });
        }
        break;
      }

      // 마커 이전 콘텐츠
      if (nextMarkerIndex > 0) {
        const before = remaining.slice(0, nextMarkerIndex).replace(/\n+$/, "");
        if (before.trim()) {
          parts.push({ type: "markdown", content: before });
        }
      }

      // 마커 처리
      if (nextMarkerIndex === adIndex) {
        parts.push({ type: "ad", content: "" });
        // 🅰️는 이모지(🅰) + 결합문자(️)로 구성되어 실제 길이가 다름
        const adMarkerLength = "🅰️".length;
        remaining = remaining.slice(adIndex + adMarkerLength).replace(/^\n+/, "").replace(/^️/, "");
      } else if (quizMatch) {
        parts.push({ type: "quiz", content: quizMatch[1] });
        remaining = remaining.slice(quizIndex + quizMatch[0].length).replace(/^\n+/, "");
      }
    }

    return parts;
  };

  // 퀴즈 JSON 파싱
  const parseQuizJson = (jsonStr: string) => {
    try {
      const normalized = jsonStr
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");
      return JSON.parse(normalized);
    } catch {
      return null;
    }
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="flex flex-col items-center justify-center min-h-[80vh] px-6">
          <Monitor className="w-24 h-24 text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            더 큰 화면이 필요합니다
          </h1>
          <p className="text-muted-foreground text-center mb-2">
            글쓰기 프리뷰는 {MIN_WIDTH}px 이상의 화면에서 지원됩니다.
          </p>
          <p className="text-muted-foreground text-center mb-8">
            현재 화면 너비가 너무 작습니다. 브라우저 창을 넓히거나 더 큰 모니터에서 접속해주세요.
          </p>
          <Link
            to="/blog"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card-hover transition-all text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            블로그로 돌아가기
          </Link>
        </main>
      </div>
    );
  }

  const parsedContent = parseContent(content);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-6 px-6 h-screen flex flex-col">
        <div className="flex gap-8 max-w-[1800px] w-full mx-auto flex-1 min-h-0">
          {/* 에디터 영역 */}
          <div className="w-1/2 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              {initialFromRef.current ? (
                <Link
                  to={`/blog/${initialFromRef.current}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  글로 돌아가기
                </Link>
              ) : (
                <Link
                  to="/blog"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  블로그로 돌아가기
                </Link>
              )}
              <h2 className="text-lg font-semibold text-foreground">에디터</h2>
            </div>

            <input
              id="preview-title"
              name="preview-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full px-4 py-3 mb-4 rounded-lg border border-border bg-card text-foreground text-xl font-semibold placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />

            <div className="flex-1 flex rounded-lg border border-border bg-card overflow-hidden min-h-[600px] focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              {/* 줄 번호 영역 */}
              <div
                className="flex-shrink-0 bg-muted/30 border-r border-border select-none overflow-hidden"
                style={{ width: `${Math.max(2, String(lines.length).length) * 0.6 + 0.5}rem` }}
              >
                <div
                  ref={lineNumbersRef}
                  className="pt-3 pb-3 font-mono text-xs text-right px-2"
                >
                  {lines.map((_, index) => (
                    <div
                      key={index}
                      className={`${index % 2 === 0 ? 'text-muted-foreground/60' : 'text-muted-foreground/40'}`}
                      style={{ height: '24px', lineHeight: '24px' }}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>
              {/* 텍스트 에디터 영역 */}
              <div className="flex-1 relative">
                <textarea
                  ref={editorRef}
                  id="preview-content"
                  name="preview-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onScroll={handleEditorScroll}
                  placeholder="마크다운으로 내용을 작성하세요..."
                  className="absolute inset-0 w-full h-full px-4 py-3 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none font-mono text-sm leading-[24px] custom-scrollbar-blue whitespace-pre overflow-x-auto"
                />
              </div>
            </div>
          </div>

          {/* 프리뷰 영역 */}
          <div className="w-1/2 flex flex-col min-h-0">
            <div className="flex items-center justify-end mb-4">
              <h2 className="text-lg font-semibold text-foreground">프리뷰</h2>
            </div>

            <div
              ref={previewRef}
              onScroll={() => syncScroll("preview")}
              className="flex-1 px-6 py-6 rounded-lg border border-border bg-card/30 overflow-y-auto overflow-x-hidden custom-scrollbar-cyan"
            >
              {title ? (
                <>
                  <h1 className="text-4xl font-bold text-foreground mb-8">
                    {title}
                  </h1>
                  <hr className="border-border mb-10" />
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold text-foreground/50 mb-8">
                    제목을 입력하세요
                  </h1>
                  <hr className="border-border mb-10" />
                </>
              )}

              <div ref={proseRef} className="prose prose-invert prose-lg max-w-none break-keep">
                {parsedContent.map((part, index) => {
                  if (part.type === "ad") {
                    return (
                      <div key={index} className="my-8">
                        <AdPlaceholder type="horizontal" preview />
                      </div>
                    );
                  }

                  if (part.type === "quiz") {
                    const quizData = parseQuizJson(part.content);
                    if (!quizData) return null;

                    if (Array.isArray(quizData)) {
                      return <QuizList key={index} items={quizData} />;
                    }
                    if (quizData.items && Array.isArray(quizData.items)) {
                      return <QuizList key={index} items={quizData.items} />;
                    }
                    return (
                      <Quiz
                        key={index}
                        question={quizData.question}
                        options={quizData.options}
                        answer={quizData.answer}
                        explanation={quizData.explanation}
                      />
                    );
                  }

                  return (
                    <ReactMarkdown
                      key={index}
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-3xl font-bold mt-12 mb-4 text-foreground">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xl font-semibold mt-8 mb-3 text-foreground">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-muted-foreground leading-relaxed mb-4">
                            {children}
                          </p>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {children}
                          </a>
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
                        code: ({ className, children }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          const codeString = String(children).replace(/\n$/, "");
                          // 언어가 지정되었거나, 여러 줄이면 코드 블록으로 처리
                          const isBlock = match || codeString.includes("\n");
                          const language = match ? match[1] : "text";

                          if (isBlock) {
                            return (
                              <CodeBlock language={language}>
                                {codeString}
                              </CodeBlock>
                            );
                          }

                          return (
                            <code className="px-1.5 py-0.5 rounded bg-muted text-primary text-sm">
                              {children}
                            </code>
                          );
                        },
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
                          const tagMatch = alt?.match(/^\[([sml])([lcr])?\]/i);
                          const sizeTag = tagMatch ? tagMatch[1].toLowerCase() : null;
                          const posTag = tagMatch ? (tagMatch[2]?.toLowerCase() || "c") : "c";
                          const cleanAlt = alt?.replace(/^\[[sml][lcr]?\]\s*/i, "") || "";

                          const sizeClass = sizeTag === "s"
                            ? "w-1/3"
                            : sizeTag === "m"
                            ? "w-1/2"
                            : sizeTag === "l"
                            ? "w-full"
                            : "max-w-full";

                          const alignClass = posTag === "l"
                            ? "justify-start"
                            : posTag === "r"
                            ? "justify-end"
                            : "justify-center";

                          return (
                            <figure className="my-6">
                              <div className={`flex ${alignClass}`}>
                                <ImageWithLoader
                                  src={src || ""}
                                  alt={cleanAlt}
                                  className="rounded-lg"
                                  containerClassName={sizeClass}
                                />
                              </div>
                              {cleanAlt && cleanAlt !== "image" && (
                                <figcaption className="text-center text-sm text-muted-foreground mt-2">
                                  {cleanAlt}
                                </figcaption>
                              )}
                            </figure>
                          );
                        },
                      }}
                    >
                      {part.content}
                    </ReactMarkdown>
                  );
                })}
              </div>

              {!content && (
                <p className="text-muted-foreground/50 leading-relaxed">
                  마크다운으로 내용을 작성하세요...
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogPreview;
