import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface BlogCardData {
  _id: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  views: number;
  createdAt: string;
  author_name?: string;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const gradients = [
  "from-primary/40 via-primary/20 to-secondary/30",
  "from-secondary/40 via-primary/20 to-primary/30",
  "from-primary/50 via-fuchsia-500/20 to-secondary/30",
  "from-secondary/40 via-cyan-500/20 to-primary/40",
];

export const BlogCard = ({ blog, index = 0 }: { blog: BlogCardData; index?: number }) => {
  const gradient = gradients[index % gradients.length];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06 }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link to={`/blog/${blog._id}`} className="block">
        <div className="glass rounded-2xl overflow-hidden h-full shadow-card transition-all duration-300 group-hover:shadow-glow group-hover:border-primary/40">
          <div className={`relative h-44 bg-gradient-to-br ${gradient} overflow-hidden`}>
            {blog.cover_image_url ? (
              <img src={blog.cover_image_url} alt={blog.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 grid-pattern opacity-30" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          </div>
          <div className="p-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              {(blog.tags ?? []).slice(0, 2).map((t) => (
                <Badge key={t} variant="secondary" className="bg-primary/10 text-primary-glow border-primary/20 hover:bg-primary/20">
                  {t}
                </Badge>
              ))}
            </div>
            <h3 className="font-display font-semibold text-lg leading-snug line-clamp-2 group-hover:text-gradient transition-all">
              {blog.title}
            </h3>
            {blog.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{blog.excerpt}</p>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {formatDate(blog.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3 w-3" />
                {blog.views}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};
