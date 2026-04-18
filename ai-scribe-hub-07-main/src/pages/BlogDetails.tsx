import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Calendar, Eye, ArrowLeft, Share2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await apiFetch(`/blogs/${id}`);
        setBlog(data);
        
        if (data && data.author_id) {
          const { data: prof } = await apiFetch(`/profiles/${data.author_id}`);
          setProfile(prof);
        }
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  useEffect(() => {
    if (blog?.title) document.title = `${blog.title} — Quill`;
  }, [blog]);

  if (loading) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container max-w-3xl py-24 text-center space-y-4">
        <h1 className="text-2xl font-bold">Blog not found</h1>
        <p className="text-muted-foreground">It might have been deleted or unpublished.</p>
        <Button variant="outline" asChild><Link to="/explore">Back to Explore</Link></Button>
      </div>
    </div>
  );

  const share = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="container max-w-3xl py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <Link to="/explore" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>

          <header className="space-y-6 text-center">
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {blog.tags.map((t: string) => <Badge key={t} variant="secondary">{t}</Badge>)}
              </div>
            )}
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {blog.title}
            </h1>
            {blog.excerpt && <p className="text-xl text-muted-foreground leading-relaxed">{blog.excerpt}</p>}
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border/50">
              {profile && (
                <div className="flex items-center text-foreground font-medium">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs text-primary-foreground font-bold mr-2">
                    {profile.display_name?.slice(0, 2).toUpperCase() || "U"}
                  </div>
                  {profile.display_name || "Anonymous"}
                </div>
              )}
              <div className="flex items-center"><Calendar className="h-4 w-4 mr-1.5" />{new Date(blog.createdAt).toLocaleDateString()}</div>
              <div className="flex items-center"><Eye className="h-4 w-4 mr-1.5" />{blog.views}</div>
            </div>
          </header>

          <div className="prose prose-lg dark:prose-invert max-w-none pt-4">
            <ReactMarkdown>{blog.content || ""}</ReactMarkdown>
          </div>

          <div className="pt-10 border-t border-border/50 flex justify-center">
            <Button variant="outline" onClick={share}><Share2 className="h-4 w-4 mr-2" /> Share article</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogDetails;
