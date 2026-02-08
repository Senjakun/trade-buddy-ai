import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Menu, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/contexts/BrandingContext";
import SettingsPanel from "@/components/SettingsPanel";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { branding } = useBranding();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.siteName}
                className="h-7 w-7 object-contain"
              />
            ) : (
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Brain className="h-5 w-5 text-primary" />
              </div>
            )}
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              {branding.siteName}
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            <a
              href="#chat"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              AI Analysis
            </a>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="hero" size="sm">
              Connect Wallet
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-border/30 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-3 px-4 py-4">
              <a href="#chat" className="text-sm text-muted-foreground">
                AI Analysis
              </a>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSettingsOpen(true);
                    setIsOpen(false);
                  }}
                >
                  <Settings className="mr-1.5 h-3.5 w-3.5" />
                  Settings
                </Button>
                <Button variant="hero" size="sm" className="flex-1">
                  Connect Wallet
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default Navbar;
