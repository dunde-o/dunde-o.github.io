import { useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ImageWithLoader from "@/components/ImageWithLoader";
import CodeBlock from "@/components/CodeBlock";
import TableOfContents from "@/components/TableOfContents";
import posts from "@/data/posts.json";
import type { BlogPost as BlogPostType } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <article className="animate-fade-in">
          <button
            onClick={() => navigate("/blog")}
            className="text-muted-foreground hover:text-primary transition-colors mb-8 flex items-center gap-2"
          >
            <span>←</span>
            <span>목록으로</span>
          </button>

          {post.coverImage && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <ImageWithLoader
                src={post.coverImage}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover"
                containerClassName="h-64 md:h-96"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {post.series && (
              <span className="px-3 py-1 text-sm rounded-full bg-rose-500/20 text-rose-400">
                {post.series}
              </span>
            )}
            {post.category && (
              <span className="px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground">
                {post.category}
              </span>
            )}
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
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

          <div className="prose prose-invert prose-lg max-w-none break-keep">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match;
                  return isInline ? (
                    <code
                      className="bg-muted px-1.5 py-0.5 rounded text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <CodeBlock language={match[1]}>
                      {String(children).replace(/\n$/, "")}
                    </CodeBlock>
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
                img: ({ src, alt }) => (
                  <div className="flex justify-center my-6">
                    <ImageWithLoader
                      src={src || ""}
                      alt={alt || ""}
                      className="rounded-lg max-w-full"
                    />
                  </div>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
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
        </article>
      </main>

      <TableOfContents content={post.content} seriesNavigation={seriesNavigation} />
    </div>
  );
};

export default BlogPost;
