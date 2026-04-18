import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogCard, BlogCardData } from "@/components/BlogCard";
import { apiFetch } from "@/lib/api";

const Explore = () => {
  const [blogs, setBlogs] = useState<BlogCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.title = "Explore — Quill";
    apiFetch("/blogs")
      .then(({ data }) => { setBlogs((data as BlogCardData[]) ?? []); setLoading(false); })
      .catch((e) => { console.error(e); setLoading(false); });
  }, []);

  const filtered = blogs.filter((b) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return b.title.toLowerCase().includes(q) ||
           (b.excerpt ?? "").toLowerCase().includes(q) ||
           (b.tags ?? []).some((t) => t.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-12 space-y-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center max-w-2xl mx-auto">
          <h1 className="font-display text-5xl font-bold tracking-tight">
            Explore <span className="text-gradient">stories</span>
          </h1>
          <p className="text-muted-foreground text-lg">Discover what writers are publishing with Quill.</p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, tag, or topic..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 bg-muted/40 border-border/60"
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">No blogs match your search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((b, i) => <BlogCard key={b._id} blog={b} index={i} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Explore;
