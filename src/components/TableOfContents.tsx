import { useEffect, useState } from "react";
import { List, X } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

const TableOfContents = ({ content }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 마크다운에서 헤딩 추출
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
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

  if (headings.length === 0) return null;

  const TocList = () => (
    <div className="border-l-2 border-border pl-4">
      <p className="text-sm font-semibold text-foreground mb-3">목차</p>
      <ul className="space-y-2">
        {headings.map(({ id, text, level }) => (
          <li key={id} style={{ paddingLeft: `${(level - 1) * 12}px` }}>
            <button
              onClick={() => handleClick(id)}
              className={`text-left text-sm transition-colors hover:text-primary ${
                activeId === id
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      {/* 1900px 이상: 우측 고정 */}
      <nav className="hidden min-[1900px]:block fixed right-8 top-1/2 -translate-y-1/2 w-64 max-h-[60vh] overflow-y-auto">
        <TocList />
      </nav>

      {/* 1900px 미만: 햄버거 버튼 */}
      <div className="min-[1900px]:hidden fixed right-6 top-24 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-full bg-card border border-border hover:border-primary/50 transition-colors"
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
              className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <nav className="absolute right-0 top-12 w-64 max-h-[60vh] overflow-y-auto bg-card border border-border rounded-lg p-4 shadow-lg z-50">
              <TocList />
            </nav>
          </>
        )}
      </div>
    </>
  );
};

export default TableOfContents;
