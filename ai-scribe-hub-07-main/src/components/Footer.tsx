import { Sparkles } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border/40 mt-32">
    <div className="container py-12 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-md bg-gradient-primary flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-display font-semibold">Quill</span>
        <span className="text-sm text-muted-foreground ml-2">© 2026 — Built with AI</span>
      </div>
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
        <a href="#" className="hover:text-foreground transition-colors">Terms</a>
        <a href="#" className="hover:text-foreground transition-colors">Contact</a>
      </div>
    </div>
  </footer>
);
