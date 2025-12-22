import { NavLink } from "@/components/NavLink";
import type { BlogPost } from "@/lib/notion";

interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard = ({ post }: BlogPostCardProps) => {
  return (
    <NavLink to={`/blog/${post.slug}`} className="block group">
      <article className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        <div className="flex flex-wrap gap-2 mb-3">
          {post.category && (
            <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
              {post.category}
            </span>
          )}
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
            >
              {tag}
            </span>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
          {post.title}
        </h2>

        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
          {post.content.slice(0, 150).replace(/[#*`>\-]/g, "").trim()}
          {post.content.length > 150 && "..."}
        </p>

        <time className="text-xs text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </article>
    </NavLink>
  );
};

export default BlogPostCard;
