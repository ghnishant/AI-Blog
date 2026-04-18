import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Search, MessageSquare, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogCard, BlogCardData } from "@/components/BlogCard";
import { apiFetch } from "@/lib/api";

const features = [
  { icon: Wand2, title: "AI draft generator", desc: "Turn a topic into a polished draft in seconds." },
  { icon: CheckCircle2, title: "Grammar perfected", desc: "Catch every typo, awkward phrase, and slip." },
  { icon: MessageSquare, title: "Tone shifting", desc: "Casual, formal, witty — rewrite in one click." },
  { icon: Search, title: "SEO that ranks", desc: "Keywords + meta descriptions that pull traffic." },
  { icon: FileText, title: "Smart summaries", desc: "Auto TL;DRs that hook readers fast." },
  { icon: Sparkles, title: "Glassy editor", desc: "A writing surface that feels premium." },
];

const Index = () => {
  const [blogs, setBlogs] = useState<BlogCardData[]>([]);

  useEffect(() => {
    document.title = "Quill — AI Blog Studio";
    apiFetch("/blogs")
      .then(({ data }) => setBlogs((data.slice(0, 6) as BlogCardData[]) ?? []))
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 h-80 w-80 rounded-full bg-secondary/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="container relative py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
              <span className="text-muted-foreground">Powered by AI · No setup</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tighter">
              Write blogs that
              <br />
              <span className="text-gradient">people actually read.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Quill is your AI co-writer. Generate drafts, fix grammar, shift tone, optimize for SEO,
              and ship in minutes — not hours.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/auth?mode=signup">
                  Start writing free <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link to="/explore">Explore blogs</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <span>✨ AI generation</span>
              <span>🎯 SEO optimizer</span>
              <span>📝 Markdown editor</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-4"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Everything you need to <span className="text-gradient">publish brilliantly</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            One studio. One workflow. From blank page to published post.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-6 space-y-4 transition-all hover:border-primary/40 hover:shadow-glow"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-xl">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured blogs */}
      {blogs.length > 0 && (
        <section className="container py-16">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-display text-4xl font-bold tracking-tight">Featured stories</h2>
              <p className="text-muted-foreground mt-2">Fresh from the community.</p>
            </div>
            <Button asChild variant="ghost">
              <Link to="/explore">View all <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((b, i) => <BlogCard key={b._id} blog={b} index={i} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl glass p-12 md:p-16 text-center"
        >
          <div className="absolute inset-0 bg-gradient-primary opacity-20" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative space-y-6">
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              Your next post is <span className="text-gradient">one click away.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Join writers shipping faster with AI in their corner.
            </p>
            <Button asChild variant="hero" size="xl">
              <Link to="/auth?mode=signup">
                Start writing free <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
