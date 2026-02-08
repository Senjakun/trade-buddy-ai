import { Brain } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground">
              AI<span className="text-primary">Trade</span>
            </span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">Terms</a>
            <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
            <a href="#" className="transition-colors hover:text-foreground">Docs</a>
            <a href="#" className="transition-colors hover:text-foreground">Support</a>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 AITrade. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
