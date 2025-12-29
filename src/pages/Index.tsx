/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import { Card } from "@/components/ui/card";
import projects from "@/data/projects.json";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const isDev = import.meta.env.DEV;

// TODO: 광고 임시 비활성화
const AdCard = () => {
  return null;

  /*
  const cardRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !shineRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    const shineX = (x / rect.width) * 100;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    shineRef.current.style.background = `linear-gradient(120deg, transparent 0%, hsl(0 0% 100% / 0.15) ${shineX}%, transparent 100%)`;
    shineRef.current.style.opacity = "1";
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || !shineRef.current) return;
    cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    shineRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="project-card-wrapper"
    >
      <Card className="group relative overflow-hidden bg-card border-border hover:border-primary/50 transition-colors duration-300 hover:shadow-lg hover:shadow-primary/10 h-full">
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 relative">
          <div className="absolute inset-6 flex items-center justify-center bg-white rounded-lg">
            <img
              src="/images/google_ads_logo_icon.png"
              alt="AD"
              className="h-12 object-contain opacity-50"
            />
          </div>
          {!isDev && (
            <ins
              ref={adRef}
              className="adsbygoogle relative z-10"
              style={{ display: "block" }}
              data-ad-client="ca-pub-4277713048680567"
              data-ad-slot="7937230497"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div
          ref={shineRef}
          className="absolute inset-0 pointer-events-none opacity-0"
        />
      </Card>
    </div>
  );
  */
};

const Index = () => {
  useEffect(() => {
    document.title = "Dunde's Portfolio | Projects";
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-16 animate-fade-in">
          <h1
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-[hsl(var(--hero-gradient-to))] bg-clip-text text-transparent"
            style={{ lineHeight: 1.5 }}
          >
            Featured Projects
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl break-keep">
            개인 연구 및 학습용 예제부터 실무 감각을 익힌 팀 프로젝트와 배포 결과물까지,
            다채로운 경험으로 구성된 프로젝트 아카이브입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              description={project.description}
              tags={project.tags}
              link={project.link}
            />
          ))}
          <AdCard />
        </div>
      </main>
    </div>
  );
};

export default Index;
