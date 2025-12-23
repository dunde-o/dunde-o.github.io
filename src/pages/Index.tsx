import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import projects from "@/data/projects.json";

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
        </div>
      </main>
    </div>
  );
};

export default Index;
