import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Loader2 } from "lucide-react";
import type { BlogPost } from "@/lib/notion";

interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard = ({ post }: BlogPostCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  const handleTagClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(path);
  };

  return (
    <NavLink to={`/blog/${post.slug}`} className="block group">
      <article className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-1">
        <div className="flex gap-6">
          {/* 컨텐츠 영역 */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-3">
              {post.series && (
                <span
                  onClick={(e) => handleTagClick(e, `/blog?q=!${encodeURIComponent(post.series!)}`)}
                  className="px-2 py-1 text-xs rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 hover:shadow-[0_0_8px_rgba(244,63,94,0.4)] transition-all cursor-pointer"
                >
                  {post.series}
                </span>
              )}
              {post.category && (
                <span
                  onClick={(e) => handleTagClick(e, `/blog?q=@${encodeURIComponent(post.category!)}`)}
                  className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-[0_0_8px_rgba(148,163,184,0.4)] transition-all cursor-pointer"
                >
                  {post.category}
                </span>
              )}
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  onClick={(e) => handleTagClick(e, `/blog?q=%23${encodeURIComponent(tag)}`)}
                  className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-[0_0_8px_rgba(var(--primary),0.4)] transition-all cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2 break-keep">
              {post.title}
            </h2>

            <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2 break-keep">
              {post.description || (
                <>
                  {post.content.slice(0, 150).replace(/[#*`>\-]/g, "").trim()}
                  {post.content.length > 150 && "..."}
                </>
              )}
            </p>

            <time className="text-xs text-muted-foreground">
              {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>

          {/* 커버 이미지 영역 */}
          {post.coverImage && (
            <div className="flex-shrink-0 hidden sm:flex items-center">
              <div className="relative w-40 h-40">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                )}
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className={`w-40 h-40 object-cover rounded-lg transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            </div>
          )}
        </div>
      </article>
    </NavLink>
  );
};

export default BlogPostCard;
