import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BlogPostCard from "@/components/BlogPostCard";
import posts from "@/data/posts.json";
import type { BlogPost } from "@/types";
import { searchPosts } from "@/lib/searchParser";
import { Search, X, HelpCircle } from "lucide-react";

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(searchQuery);

  useEffect(() => {
    document.title = "Dunde's Portfolio | Blog";
  }, []);

  const typedPosts = posts as BlogPost[];

  const filteredPosts = useMemo(() => {
    return searchPosts(typedPosts, searchQuery);
  }, [typedPosts, searchQuery]);

  const handleSearch = () => {
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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

          <p className="text-muted-foreground leading-relaxed text-lg mb-8">
            개발 여정에서 배운 것들과 생각을 기록합니다.
          </p>

          {/* 검색 영역 */}
          <div className="mb-8">
            <div className="relative">
              <button
                onClick={handleSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="검색어를 입력하세요..."
                className="w-full pl-12 pr-20 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {inputValue && (
                  <button
                    onClick={() => {
                      setInputValue("");
                      setSearchParams({});
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                {/* 검색 도움말 버튼 */}
                <div className="relative group/help">
                  <HelpCircle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-help peer" />
                  <div className="absolute right-0 top-8 w-72 p-4 rounded-xl border border-primary/30 bg-card/95 backdrop-blur-sm text-sm opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-150 z-50 shadow-[0_0_20px_hsl(var(--primary)/0.2)] pointer-events-none">
                    <p className="text-muted-foreground mb-2">검색 문법:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                        텍스트 → 제목/내용
                      </span>
                      <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400">
                        !시리즈
                      </span>
                      <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground">
                        @카테고리
                      </span>
                      <span className="px-2 py-1 rounded bg-primary/20 text-primary">
                        #태그
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="mr-4">&amp; = AND</span>
                      <span className="mr-4">| = OR</span>
                      <span>() = 그룹</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground/70">
                      예: #React &amp; @개발 | !시리즈명
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 검색 결과 카운트 */}
            {searchQuery && (
              <p className="mt-3 text-sm text-muted-foreground">
                {filteredPosts.length}개의 글을 찾았습니다.
              </p>
            )}
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              {searchQuery ? "검색 결과가 없습니다." : "아직 작성된 글이 없습니다."}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredPosts.map((post) => (
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
