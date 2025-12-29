/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef } from "react";

interface AdPlaceholderProps {
  type: "horizontal" | "vertical";
  preview?: boolean;
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

const AdPlaceholder = (_props: AdPlaceholderProps) => {
  // TODO: 광고 임시 비활성화
  return null;

  /*
  const { type, preview = false } = _props;
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
      <div className="w-[728px] h-[90px] mx-auto mb-8 flex items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg">
          <img
            src="/images/google_ads_logo_icon.png"
            alt="AD"
            className="h-12 object-contain opacity-50"
          />
        </div>
        {!isDev && !preview && (
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
    <div className="w-[160px] h-[600px] flex items-center justify-center relative">
      <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg">
        <img
          src="/images/google_ads_logo_icon.png"
          alt="AD"
          className="h-12 object-contain opacity-50"
        />
      </div>
      {!isDev && !preview && (
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
  */
};

export default AdPlaceholder;
