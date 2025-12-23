import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import BlogPostCard from "@/components/BlogPostCard";
import posts from "@/data/posts.json";
import type { BlogPost } from "@/types";

const Blog = () => {
  useEffect(() => {
    document.title = "Dunde's Portfolio | Blog";
  }, []);

  const typedPosts = posts as BlogPost[];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="animate-fade-in">
          <h1
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-[hsl(var(--hero-gradient-to))] bg-clip-text text-transparent"
            style={{ lineHeight: 1.5 }}
          >
            Blog
          </h1>

          <p className="text-muted-foreground leading-relaxed text-lg mb-12">
            개발 여정에서 배운 것들과 생각을 기록합니다.
          </p>

          {typedPosts.length === 0 ? (
            <div className="text-center text-muted-foreground">
              아직 작성된 글이 없습니다.
            </div>
          ) : (
            <div className="grid gap-6">
              {typedPosts.map((post) => (
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
