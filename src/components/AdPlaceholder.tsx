import { useEffect, useRef } from "react";

interface AdPlaceholderProps {
  type: "horizontal" | "vertical";
}

// 반응형 광고
// horizontal: gp-Leaderboard
// vertical: gp-Wide-Skyscraper

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const isDev = import.meta.env.DEV;

const AdPlaceholder = ({ type }: AdPlaceholderProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    if (isDev) return;

    if (adRef.current && !isAdLoaded.current) {
      const timer = setTimeout(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isAdLoaded.current = true;
        } catch (e) {
          console.error("AdSense error:", e);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  if (type === "horizontal") {
    return (
      <div className="w-full mx-auto mb-8 flex items-center justify-center relative min-h-[90px]">
        {/* 배경 플레이스홀더 - 항상 표시 */}
        <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg">
          <img
            src="/images/google_ads_logo_icon.png"
            alt="AD"
            className="h-12 object-contain opacity-50"
          />
        </div>
        {/* 광고 - 로드되면 플레이스홀더 위에 표시 */}
        {!isDev && (
          <ins
            ref={adRef}
            className="adsbygoogle relative z-10"
            style={{ display: "block" }}
            data-ad-client="ca-pub-4277713048680567"
            data-ad-slot="1958963743"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center relative min-h-[250px]">
      {/* 배경 플레이스홀더 - 항상 표시 */}
      <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg">
        <img
          src="/images/google_ads_logo_icon.png"
          alt="AD"
          className="h-12 object-contain opacity-50"
        />
      </div>
      {/* 광고 - 로드되면 플레이스홀더 위에 표시 */}
      {!isDev && (
        <ins
          ref={adRef}
          className="adsbygoogle relative z-10"
          style={{ display: "block" }}
          data-ad-client="ca-pub-4277713048680567"
          data-ad-slot="3272045414"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
};

export default AdPlaceholder;
