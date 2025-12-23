import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { List, X, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import type { BlogPost } from "@/types";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface SeriesNavigation {
  seriesName: string;
  totalCount: number;
  currentIndex: number;
  prev: BlogPost | null;
  next: BlogPost | null;
}

interface TableOfContentsProps {
  content: string;
  seriesNavigation?: SeriesNavigation | null;
}

const TableOfContents = ({ content, seriesNavigation }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 코드 블록 내용을 제거한 후 헤딩 추출
    // ```...``` 코드 블록을 빈 문자열로 대체
    const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, "");

    // 마크다운에서 헤딩 추출
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(contentWithoutCodeBlocks)) !== null) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`]/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s]/g, "")
        .replace(/\s+/g, "-");
      items.push({ id, text, level });
    }

    setHeadings(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  // 화면 크기가 1900px 이상이 되면 햄버거 메뉴 닫기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1900) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      setIsOpen(false);
    }
  };

  const hasToc = headings.length > 0;
  const hasSeries = !!seriesNavigation;

  // 목차도 없고 시리즈도 없으면 렌더링하지 않음
  if (!hasToc && !hasSeries) return null;

  const TocHeader = () => (
    <div className="border-l-2 border-border pl-4 pb-3">
      <p className="text-sm font-semibold text-foreground">목차</p>
    </div>
  );

  const TocList = () => (
    <div className="border-l-2 border-border pl-4">
      <ul className="space-y-2">
        {headings.map(({ id, text, level }) => (
          <li key={id} style={{ paddingLeft: `${(level - 1) * 12}px` }}>
            <button
              onClick={() => handleClick(id)}
              className={`block w-full text-left text-sm transition-colors hover:text-primary truncate ${
                activeId === id
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }`}
              title={text}
            >
              {text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const SeriesNav = () => (
    <>
      {/* 시리즈 네비게이션 */}
      {seriesNavigation && (
        <div className={hasToc ? "mt-6 pt-4 border-t border-border" : ""}>
          <p className="text-xs text-muted-foreground mb-1">시리즈</p>
          <p className="text-sm font-semibold text-primary mb-1 truncate" title={seriesNavigation.seriesName}>
            {seriesNavigation.seriesName}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {seriesNavigation.currentIndex} / {seriesNavigation.totalCount}
          </p>

          <div className="space-y-2">
            {seriesNavigation.prev && (
              <Link
                to={`/blog/${seriesNavigation.prev.slug}`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                <span className="truncate" title={seriesNavigation.prev.title}>
                  {seriesNavigation.prev.title}
                </span>
              </Link>
            )}
            {seriesNavigation.next && (
              <Link
                to={`/blog/${seriesNavigation.next.slug}`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
                <span className="truncate" title={seriesNavigation.next.title}>
                  {seriesNavigation.next.title}
                </span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 목록으로 돌아가기 */}
      <div className={`${hasToc || hasSeries ? "mt-6 pt-4 border-t border-border" : ""}`}>
        <Link
          to="/blog"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>목록으로</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* 1900px 이상: 우측 고정 */}
      <nav className="hidden min-[1900px]:flex flex-col fixed right-8 top-1/2 -translate-y-1/2 w-64 max-h-[60vh]">
        {hasToc && (
          <>
            <div className="flex-shrink-0">
              <TocHeader />
            </div>
            <div className="flex-1 overflow-y-auto toc-scrollbar min-h-0">
              <TocList />
            </div>
          </>
        )}
        <div className="flex-shrink-0">
          <SeriesNav />
        </div>
      </nav>

      {/* 1900px 미만: 햄버거 버튼 */}
      <div className="min-[1900px]:hidden fixed right-6 top-24 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-full bg-card border border-border hover:border-primary/50 transition-colors shadow-lg shadow-background/50"
          aria-label="목차 열기/닫기"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <List className="w-6 h-6 text-foreground" />
          )}
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <nav className="absolute right-0 top-14 w-72 max-h-[60vh] flex flex-col bg-card/95 backdrop-blur-md border border-border/50 rounded-xl p-5 shadow-xl shadow-primary/5 z-50">
              {hasToc && (
                <>
                  <div className="flex-shrink-0">
                    <TocHeader />
                  </div>
                  <div className="flex-1 overflow-y-auto toc-scrollbar min-h-0">
                    <TocList />
                  </div>
                </>
              )}
              <div className="flex-shrink-0">
                <SeriesNav />
              </div>
            </nav>
          </>
        )}
      </div>
    </>
  );
};

export default TableOfContents;
