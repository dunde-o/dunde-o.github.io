import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";

const projects = [
  {
    title: "Project Alpha",
    description: "A cutting-edge web application built with modern technologies. Features real-time updates and seamless user experience.",
    tags: ["React", "TypeScript", "Tailwind CSS"],
  },
  {
    title: "Project Beta",
    description: "An innovative solution for complex data visualization. Transforms raw data into beautiful, interactive charts.",
    tags: ["D3.js", "Next.js", "PostgreSQL"],
  },
  {
    title: "Project Gamma",
    description: "Mobile-first e-commerce platform with advanced filtering and search capabilities. Optimized for performance.",
    tags: ["React Native", "Node.js", "MongoDB"],
  },
  {
    title: "Project Delta",
    description: "AI-powered recommendation engine that learns from user behavior. Delivers personalized content experiences.",
    tags: ["Python", "TensorFlow", "AWS"],
  },
  {
    title: "Project Epsilon",
    description: "Real-time collaboration tool for distributed teams. Features video chat, screen sharing, and document editing.",
    tags: ["WebRTC", "Socket.io", "Redis"],
  },
  {
    title: "Project Zeta",
    description: "Open-source component library with accessibility-first design. Used by thousands of developers worldwide.",
    tags: ["React", "Storybook", "Jest"],
  },
];

const Index = () => {
  useEffect(() => {
    document.title = "Dunde's Portfolio | Projects";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-[hsl(var(--hero-gradient-to))] bg-clip-text text-transparent">
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
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
