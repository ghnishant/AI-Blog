import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Save, Globe, ArrowLeft, Loader2, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { AIAssistPanel } from "@/components/AIAssistPanel";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().trim().min(3, "Title too short").max(200),
  content: z.string().trim().min(10, "Content too short").max(50000),
  excerpt: z.string().trim().max(300).optional(),
});

const BlogEditor = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => { document.title = isEdit ? "Edit blog — Quill" : "New blog — Quill"; }, [isEdit]);

  useEffect(() => {
    if (!isEdit || !user) return;
    apiFetch(`/blogs/${id}`)
      .then(({ data }) => {
        if (!data) { toast.error("Blog not found"); navigate("/dashboard"); return; }
        if (data.author_id !== user.id) { toast.error("Not authorized"); navigate("/dashboard"); return; }
        setTitle(data.title); setContent(data.content); setExcerpt(data.excerpt ?? "");
        setTags(data.tags ?? []); setCoverUrl(data.cover_image_url ?? "");
        setLoading(false);
      })
      .catch((e) => {
        toast.error(e.message || "Blog not found");
        navigate("/dashboard");
      });
  }, [id, user, isEdit, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File is too large (max 5MB)"); return; }
    
    const toastId = toast.loading("Uploading image...");
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      
      // Full URL mapping for local dev if necessary, but we proxy /uploads through Vite anyway? 
      // Actually Vite doesn't proxy /uploads. I should add it to vite config or just use full URL.
      // Wait, Vite config only proxies /api. We can't fetch it locally on React unless Vite proxies /uploads or Express is accessed via port 5000 directly. 
      // Better to use http://localhost:5000/uploads/... for now OR add /uploads proxy. We'll add proxy later.
      setCoverUrl(data.url);
      toast.success("Image uploaded", { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const addTag = () => {
    const t = tagsInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 6) setTags([...tags, t]);
    setTagsInput("");
  };

  const save = async (publish: boolean) => {
    const parsed = schema.safeParse({ title, content, excerpt });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    if (!user) return;

    setSaving(true);
    const payload = {
      title: title.trim(),
      content,
      excerpt: excerpt.trim() || content.slice(0, 200),
      tags,
      cover_image_url: coverUrl.trim() || null,
      published: publish,
    };
    try {
      if (isEdit) {
        await apiFetch(`/blogs/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        const { data } = await apiFetch(`/blogs`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        navigate(`/blog/${data._id}/edit`, { replace: true });
      }
      toast.success(publish ? "Published!" : "Saved");
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex gap-2">
            <Button variant="glass" onClick={() => save(false)} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save draft
            </Button>
            <Button variant="hero" onClick={() => save(true)} disabled={saving}>
              <Globe className="h-4 w-4" /> Publish
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your captivating title..."
              maxLength={200}
              className="!text-3xl md:!text-4xl font-display font-bold border-0 bg-transparent px-0 focus-visible:ring-0 h-auto py-2"
            />

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Cover image (optional)</Label>
              <div className="flex gap-2">
                <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://... or upload below" className="bg-muted/30" />
                <Label className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium inline-flex items-center justify-center rounded-md px-4 shadow-sm">
                  Upload file
                  <Input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </Label>
              </div>
              {coverUrl && <img src={coverUrl} alt="Cover preview" className="w-full h-32 object-cover rounded-xl mt-2 border border-border" />}
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="bg-primary/15 text-primary-glow border-primary/30 gap-1">
                    {t}
                    <button onClick={() => setTags(tags.filter((x) => x !== t))}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder={tags.length < 6 ? "Add tag + Enter" : "Max 6 tags"}
                  disabled={tags.length >= 6}
                  className="bg-muted/30 max-w-[180px] h-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Excerpt (optional)</Label>
              <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={300}
                placeholder="A short hook to draw readers in..." className="bg-muted/30 min-h-[70px]" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Content (Markdown supported)</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing... or use the AI panel to generate a draft →"
                maxLength={50000}
                className="min-h-[500px] bg-muted/30 font-sans text-base leading-relaxed"
              />
              <p className="text-xs text-muted-foreground text-right">{content.length} / 50,000</p>
            </div>
          </motion.div>

          <div className="lg:block">
            <AIAssistPanel
              currentText={content}
              onInsert={(t) => setContent(content + (content ? "\n\n" : "") + t)}
              onReplace={(t) => setContent(t)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
