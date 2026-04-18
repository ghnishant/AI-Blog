import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, CheckCircle2, MessageSquare, Search, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type Action = "generate" | "grammar" | "tone" | "seo" | "summary";

interface Props {
  currentText: string;
  onInsert: (text: string) => void;
  onReplace: (text: string) => void;
}

const actions: { id: Action; label: string; icon: typeof Sparkles; desc: string }[] = [
  { id: "generate", label: "Generate", icon: Wand2, desc: "Write a draft from a topic" },
  { id: "grammar", label: "Grammar", icon: CheckCircle2, desc: "Fix grammar & spelling" },
  { id: "tone", label: "Tone", icon: MessageSquare, desc: "Rewrite in a new tone" },
  { id: "seo", label: "SEO", icon: Search, desc: "Keywords & meta description" },
  { id: "summary", label: "Summary", icon: FileText, desc: "Generate a TL;DR" },
];

export const AIAssistPanel = ({ currentText, onInsert, onReplace }: Props) => {
  const [active, setActive] = useState<Action>("generate");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<"formal" | "casual" | "professional" | "friendly" | "witty">("professional");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setOutput("");
    try {
      const payload: any = { action: active };
      if (active === "generate") payload.topic = topic;
      else payload.text = currentText;
      if (active === "tone") payload.tone = tone;

      const { data } = await apiFetch("/ai-assist", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setOutput(data?.result ?? "");
    } catch (e: any) {
      toast.error(e.message ?? "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  const canRun = active === "generate" ? topic.trim().length > 2 : currentText.trim().length > 5;

  return (
    <div className="glass rounded-2xl p-5 space-y-4 shadow-card sticky top-24">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-gradient-primary flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <h3 className="font-display font-semibold">AI Assistant</h3>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={() => { setActive(a.id); setOutput(""); }}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
              active === a.id
                ? "bg-primary/20 text-primary-glow border border-primary/40"
                : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
            }`}
          >
            <a.icon className="h-4 w-4" />
            <span className="text-[10px]">{a.label}</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{actions.find((a) => a.id === active)?.desc}</p>

      {active === "generate" && (
        <Input
          placeholder="e.g. The future of remote work..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="bg-muted/50"
        />
      )}

      {active === "tone" && (
        <Select value={tone} onValueChange={(v: any) => setTone(v)}>
          <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="formal">Formal</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="friendly">Friendly</SelectItem>
            <SelectItem value="witty">Witty</SelectItem>
          </SelectContent>
        </Select>
      )}

      <Button onClick={run} disabled={!canRun || loading} variant="hero" className="w-full">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</> : <><Sparkles className="h-4 w-4" /> Run AI</>}
      </Button>

      {output && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <Textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            className="min-h-[200px] bg-muted/50 text-sm leading-relaxed"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="glass" onClick={() => onInsert(output)} className="flex-1">
              Insert below
            </Button>
            {(active === "grammar" || active === "tone") && (
              <Button size="sm" variant="hero" onClick={() => onReplace(output)} className="flex-1">
                Replace
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
