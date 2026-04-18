import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Save } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const schema = z.object({
  display_name: z.string().trim().min(1, "Required").max(50),
  bio: z.string().trim().max(500).optional(),
  avatar_url: z.string().trim().max(500).optional().or(z.literal("")),
});

const Profile = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = "Profile — Quill"; }, []);

  useEffect(() => {
    if (!user) return;
    apiFetch(`/profiles/${user.id}`)
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name ?? "");
          setBio(data.bio ?? "");
          setAvatarUrl(data.avatar_url ?? "");
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setAvatarUrl(data.url);
      toast.success("Avatar uploaded", { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const save = async () => {
    const parsed = schema.safeParse({ display_name: displayName, bio, avatar_url: avatarUrl });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    if (!user) return;
    setSaving(true);
    try {
      await apiFetch('/profiles/me', {
        method: 'PATCH',
        body: JSON.stringify({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        }),
      });
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background"><Navbar />
      <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></div>;
  }

  const initials = (displayName || user?.email || "QL").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <h1 className="font-display text-4xl font-bold tracking-tight">Your profile</h1>

          <div className="glass rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-2xl shadow-glow">
                {initials}
              </div>
              <div>
                <p className="font-medium">{user?.email}</p>
                <p className="text-sm text-muted-foreground">Member since {new Date(user?.created_at ?? Date.now()).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dn">Display name</Label>
              <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} placeholder="Tell readers about yourself..." className="min-h-[100px]" />
              <p className="text-xs text-muted-foreground text-right">{bio.length} / 500</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar Image URL</Label>
              <div className="flex gap-2">
                <Input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://... or upload" maxLength={500} />
                <Label className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium inline-flex items-center justify-center rounded-md px-4 shadow-sm">
                  Upload file
                  <Input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </Label>
              </div>
              {avatarUrl && <img src={avatarUrl} alt="Avatar preview" className="h-16 w-16 object-cover rounded-xl mt-2 border border-border" />}
            </div>

            <Button variant="hero" onClick={save} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
