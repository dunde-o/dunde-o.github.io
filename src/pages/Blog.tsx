import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BlogPostCard from "@/components/BlogPostCard";
import AdPlaceholder from "@/components/AdPlaceholder";
import posts from "@/data/posts.json";
import type { BlogPost } from "@/types";
import { searchPosts } from "@/lib/searchParser";
import { Search, X, HelpCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const POSTS_PER_PAGE = 6;

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const currentPage = Math.max(1, parseInt(searchParams.get("p") || "1", 10));
  const [inputValue, setInputValue] = useState(searchQuery);

  useEffect(() => {
    document.title = "Dunde's Portfolio | Blog";
  }, []);

  // URL의 검색어가 변경되면 inputValue도 동기화
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const typedPosts = posts as BlogPost[];

  const filteredPosts = useMemo(() => {
    return searchPosts(typedPosts, searchQuery);
  }, [typedPosts, searchQuery]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const validPage = Math.min(currentPage, Math.max(1, totalPages));

  const paginatedPosts = useMemo(() => {
    const start = (validPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, validPage]);

  // 페이지 변경 함수
  const setPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (page === 1) {
      newParams.delete("p");
    } else {
      newParams.set("p", String(page));
    }
    setSearchParams(newParams);
  };

  // 표시할 페이지 번호 계산 (최대 5개)
  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, validPage - 2);
    let end = Math.min(totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const handleSearch = () => {
    // 검색 시 페이지를 1로 초기화
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

      {/* 좌측 세로 광고 */}
      <div className="hidden min-[1400px]:block fixed left-8 top-1/2 -translate-y-1/2">
        <AdPlaceholder type="vertical" />
      </div>

      {/* 우측 세로 광고 */}
      <div className="hidden min-[1400px]:block fixed right-8 top-1/2 -translate-y-1/2">
        <AdPlaceholder type="vertical" />
      </div>

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

          {/* 가로 광고 */}
          <AdPlaceholder type="horizontal" />

          {filteredPosts.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              {searchQuery ? "검색 결과가 없습니다." : "아직 작성된 글이 없습니다."}
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {paginatedPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-12">
                  {/* 첫 페이지로 */}
                  <button
                    onClick={() => setPage(1)}
                    disabled={validPage === 1}
                    className="p-2 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-card"
                  >
                    <ChevronsLeft className="w-5 h-5" />
                  </button>

                  {/* 이전 페이지 */}
                  <button
                    onClick={() => setPage(validPage - 1)}
                    disabled={validPage === 1}
                    className="p-2 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-card"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* 페이지 번호들 */}
                  <div className="flex items-center gap-1 mx-2">
                    {getVisiblePages().map((page) => (
                      <button
                        key={page}
                        onClick={() => setPage(page)}
                        disabled={page === validPage}
                        className={`w-10 h-10 rounded-lg border transition-all ${
                          page === validPage
                            ? "border-primary bg-primary/20 text-primary font-semibold cursor-default"
                            : "border-border bg-card hover:border-primary/50 hover:bg-card-hover"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* 다음 페이지 */}
                  <button
                    onClick={() => setPage(validPage + 1)}
                    disabled={validPage === totalPages}
                    className="p-2 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-card"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* 마지막 페이지로 */}
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={validPage === totalPages}
                    className="p-2 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-card"
                  >
                    <ChevronsRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* 하단 가로 광고 */}
              <div className="mt-12">
                <AdPlaceholder type="horizontal" />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Blog;
