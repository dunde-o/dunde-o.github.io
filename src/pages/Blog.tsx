import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import BlogPostCard from "@/components/BlogPostCard";
import { getBlogPosts } from "@/lib/notion";

const Blog = () => {
  const {
    data: posts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blogPosts"],
    queryFn: getBlogPosts,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });

  useEffect(() => {
    document.title = "Dunde's Portfolio | Blog";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-[hsl(var(--hero-gradient-to))] bg-clip-text text-transparent">
            Blog
          </h1>

          <p className="text-muted-foreground leading-relaxed text-lg mb-12">
            개발 여정에서 배운 것들과 생각을 기록합니다.
          </p>

          {isLoading ? (
            <div className="text-center text-muted-foreground">
              로딩 중...
            </div>
          ) : isError ? (
            <div className="text-center text-red-500">
              포스트를 불러오는 중 오류가 발생했습니다.
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-muted-foreground">
              아직 작성된 글이 없습니다.
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Blog;
