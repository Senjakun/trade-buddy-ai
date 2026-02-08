import { Brain } from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";

const Footer = () => {
  const { branding } = useBranding();

  return (
    <footer className="border-t border-border/30 bg-card/20">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.siteName} className="h-5 w-5 object-contain" />
            ) : (
              <div className="rounded-lg bg-primary/10 p-1">
                <Brain className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <span className="font-display text-sm font-bold text-foreground">
              {branding.siteName}
            </span>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">Terms</a>
            <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
            <a href="#" className="transition-colors hover:text-foreground">Docs</a>
          </div>
          <p className="text-[10px] text-muted-foreground">
            © 2026 {branding.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
