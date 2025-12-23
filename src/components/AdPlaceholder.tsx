import { useEffect, useRef } from "react";

interface AdPlaceholderProps {
  type: "horizontal" | "vertical";
}

// 광고 사이즈
// horizontal: 728px x 90px (Leaderboard)
// vertical: 160px x 600px (Wide Skyscraper)

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
      <div className="w-full max-w-[728px] h-[90px] mx-auto mb-8 flex items-center justify-center relative">
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
            style={{ display: "inline-block", width: "728px", height: "90px" }}
            data-ad-client="ca-pub-4277713048680567"
            data-ad-slot="1958963743"
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-[160px] h-[600px] flex items-center justify-center relative">
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
          style={{ display: "inline-block", width: "160px", height: "600px" }}
          data-ad-client="ca-pub-4277713048680567"
          data-ad-slot="3272045414"
        />
      )}
    </div>
  );
};

export default AdPlaceholder;
