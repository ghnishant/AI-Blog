import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PenSquare, FileText, Eye, Edit3, Trash2, Globe, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface Blog {
  _id: string;
  title: string;
  excerpt: string | null;
  published: boolean;
  views: number;
  tags: string[] | null;
  updatedAt: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Dashboard — Quill"; }, []);

  const load = async () => {
    if (!user) return;
    try {
      const { data } = await apiFetch('/blogs/me');
      setBlogs(data ?? []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const remove = async (id: string) => {
    if (!confirm("Delete this blog forever?")) return;
    try {
      await apiFetch(`/blogs/${id}`, { method: 'DELETE' });
      toast.success("Deleted");
      setBlogs(blogs.filter((b) => b._id !== id));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const togglePublish = async (b: Blog) => {
    try {
      await apiFetch(`/blogs/${b._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ published: !b.published })
      });
      toast.success(!b.published ? "Published" : "Unpublished");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const stats = {
    total: blogs.length,
    published: blogs.filter((b) => b.published).length,
    views: blogs.reduce((s, b) => s + b.views, 0),
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-12 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Your studio</h1>
            <p className="text-muted-foreground mt-1">Manage drafts, published posts, and stats.</p>
          </div>
          <Button variant="hero" size="lg" onClick={() => navigate("/blog/new")}>
            <PenSquare className="h-4 w-4" /> New blog
          </Button>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Total posts", value: stats.total, icon: FileText },
            { label: "Published", value: stats.published, icon: Globe },
            { label: "Total views", value: stats.views, icon: Eye },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl p-6 flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="font-display text-3xl font-bold mt-1">{s.value}</p>
              </div>
              <div className="h-11 w-11 rounded-lg bg-primary/15 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary-glow" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-2xl font-semibold">All posts</h2>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : blogs.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No posts yet. Start your first one!</p>
              <Button variant="hero" onClick={() => navigate("/blog/new")}>Create your first blog</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {blogs.map((b, i) => (
                <motion.div
                  key={b._id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4 hover:border-primary/40 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant={b.published ? "default" : "secondary"} className={b.published ? "bg-secondary/20 text-secondary border-secondary/30" : "bg-muted text-muted-foreground"}>
                        {b.published ? "Published" : "Draft"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{b.views} views</span>
                    </div>
                    <Link to={`/blog/${b._id}`} className="font-display font-semibold text-lg hover:text-gradient transition-all line-clamp-1">
                      {b.title || "Untitled"}
                    </Link>
                    {b.excerpt && <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{b.excerpt}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => togglePublish(b)}>
                      {b.published ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/blog/${b._id}/edit`)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(b._id)} className="hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
