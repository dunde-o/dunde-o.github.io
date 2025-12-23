import { Card } from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

const ProjectCard = ({ title, description, tags, link }: ProjectCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

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
      <Card className="group relative overflow-hidden bg-card border-border hover:border-primary/50 transition-colors duration-300 hover:shadow-lg hover:shadow-primary/10">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            {link && (
              <NavLink to={link}>
                <ArrowUpRight className="w-5 h-5 p-2 box-content rounded-full text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 hover:bg-primary/10 transition-all" />
              </NavLink>
            )}
          </div>

          <p className="text-muted-foreground mb-6 leading-relaxed break-keep">
            {description}
          </p>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium bg-secondary text-foreground rounded-full border border-border"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 기존 그라데이션 효과 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* 반사광 효과 - 일자 광원 */}
        <div
          ref={shineRef}
          className="absolute inset-0 pointer-events-none opacity-0"
        />
      </Card>
    </div>
  );
};

export default ProjectCard;
