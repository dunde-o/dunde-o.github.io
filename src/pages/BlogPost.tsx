import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import ImageWithLoader from "@/components/ImageWithLoader";
import CodeBlock from "@/components/CodeBlock";
import TableOfContents from "@/components/TableOfContents";
import { getBlogPostBySlug } from "@/lib/notion";
import ReactMarkdown from "react-markdown";

const generateId = (text: string) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, "")
    .replace(/\s+/g, "-");

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blogPost", slug],
    queryFn: () => getBlogPostBySlug(slug || ""),
    enabled: !!slug,
  });

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Dunde's Blog`;
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
          <div className="text-center text-muted-foreground">로딩 중...</div>
        </main>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-background">
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
    <div className="min-h-screen bg-background">
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
              })}
            </time>
            {post.updatedAt !== post.createdAt && (
              <span>
                (수정:{" "}
                {new Date(post.updatedAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                )
              </span>
            )}
          </div>

          <hr className="border-border my-10" />

          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown
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
                  <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-muted-foreground mb-4 space-y-2">
                    {children}
                  </ol>
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
        </article>
      </main>

      <TableOfContents content={post.content} />
    </div>
  );
};

export default BlogPost;
