import { useEffect, useRef } from "react";

interface GiscusProps {
  slug: string;
}

const Giscus = ({ slug }: GiscusProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // 기존 스크립트 제거
    const existingScript = ref.current.querySelector("script");
    if (existingScript) {
      existingScript.remove();
    }

    // 기존 iframe 제거 (페이지 이동 시)
    const existingIframe = ref.current.querySelector("iframe");
    if (existingIframe) {
      existingIframe.remove();
    }

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "dunde-o/dunde-o.github.io");
    script.setAttribute("data-repo-id", "R_kgDOQoYCjA");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDOQoYCjM4C0KpX");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "dark");
    script.setAttribute("data-lang", "ko");
    script.crossOrigin = "anonymous";
    script.async = true;

    ref.current.appendChild(script);

    return () => {
      // 클린업
      if (ref.current) {
        const scriptToRemove = ref.current.querySelector("script");
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      }
    };
  }, [slug]);

  return <div ref={ref} className="giscus mt-16 pt-8 border-t border-border" />;
};

export default Giscus;
