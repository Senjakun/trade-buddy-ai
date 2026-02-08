import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Server,
  Palette,
  X,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOllama, VPSNode } from "@/contexts/OllamaContext";
import { useBranding } from "@/contexts/BrandingContext";

const SettingsPanel = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { nodes, updateNode } = useOllama();
  const { branding, updateBranding } = useBranding();
  const [activeTab, setActiveTab] = useState<"nodes" | "branding">("nodes");
  const [testingNode, setTestingNode] = useState<string | null>(null);

  const testConnection = async (node: VPSNode) => {
    if (!node.ip) return;
    setTestingNode(node.id);
    // Simulate test
    await new Promise((r) => setTimeout(r, 1500));
    updateNode(node.id, { status: Math.random() > 0.3 ? "online" : "offline" });
    setTestingNode(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border/30 bg-card overflow-y-auto scrollbar-void"
          >
            <div className="flex items-center justify-between border-b border-border/30 p-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-bold text-foreground">
                  Settings
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/30">
              <button
                onClick={() => setActiveTab("nodes")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "nodes"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Server className="inline-block mr-1.5 h-3.5 w-3.5" />
                AI Nodes
              </button>
              <button
                onClick={() => setActiveTab("branding")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "branding"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Palette className="inline-block mr-1.5 h-3.5 w-3.5" />
                Branding
              </button>
            </div>

            <div className="p-4 space-y-6">
              {activeTab === "nodes" && (
                <>
                  <p className="text-xs text-muted-foreground">
                    Configure your Ollama VPS endpoints. Each node runs a
                    specialized AI model for trading analysis.
                  </p>

                  {nodes.map((node) => (
                    <div
                      key={node.id}
                      className="void-card rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">
                            {node.label}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold ${
                            node.status === "online"
                              ? "bg-buy/10 text-buy"
                              : node.status === "degraded"
                              ? "bg-hold/10 text-hold"
                              : "bg-sell/10 text-sell"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              node.status === "online"
                                ? "bg-buy"
                                : node.status === "degraded"
                                ? "bg-hold"
                                : "bg-sell"
                            }`}
                          />
                          {node.status.toUpperCase()}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                            IP Address
                          </label>
                          <input
                            type="text"
                            value={node.ip}
                            onChange={(e) =>
                              updateNode(node.id, { ip: e.target.value })
                            }
                            placeholder="192.168.1.100"
                            className="w-full rounded-md border border-border/50 bg-muted/20 px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                            Port
                          </label>
                          <input
                            type="text"
                            value={node.port}
                            onChange={(e) =>
                              updateNode(node.id, { port: e.target.value })
                            }
                            className="w-full rounded-md border border-border/50 bg-muted/20 px-3 py-2 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                          Model
                        </label>
                        <input
                          type="text"
                          value={node.model}
                          onChange={(e) =>
                            updateNode(node.id, { model: e.target.value })
                          }
                          className="w-full rounded-md border border-border/50 bg-muted/20 px-3 py-2 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full font-mono text-xs"
                        onClick={() => testConnection(node)}
                        disabled={!node.ip || testingNode === node.id}
                      >
                        {testingNode === node.id ? (
                          <>
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Check className="mr-1.5 h-3 w-3" />
                            Test Connection
                          </>
                        )}
                      </Button>
                    </div>
                  ))}

                  <div className="flex items-start gap-2 rounded-lg border border-border/30 bg-muted/10 p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-hold" />
                    <p className="text-xs text-muted-foreground">
                      Ensure your Ollama instances are running with{" "}
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-foreground">
                        OLLAMA_HOST=0.0.0.0
                      </code>{" "}
                      and port 11434 is accessible.
                    </p>
                  </div>
                </>
              )}

              {activeTab === "branding" && (
                <>
                  <p className="text-xs text-muted-foreground">
                    Customize the portal's branding. Changes apply immediately
                    across all UI elements.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={branding.siteName}
                        onChange={(e) =>
                          updateBranding({ siteName: e.target.value })
                        }
                        placeholder="Sovereign AI"
                        className="w-full rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                        Logo URL
                      </label>
                      <input
                        type="text"
                        value={branding.logoUrl}
                        onChange={(e) =>
                          updateBranding({ logoUrl: e.target.value })
                        }
                        placeholder="https://example.com/logo.svg"
                        className="w-full rounded-md border border-border/50 bg-muted/20 px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
                      />
                      {branding.logoUrl && (
                        <div className="mt-2 flex items-center gap-2 rounded-md border border-border/30 bg-muted/10 p-2">
                          <img
                            src={branding.logoUrl}
                            alt="Logo preview"
                            className="h-8 w-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          <span className="text-xs text-muted-foreground">
                            Preview
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={branding.tagline}
                        onChange={(e) =>
                          updateBranding({ tagline: e.target.value })
                        }
                        placeholder="AI-Powered Trading Intelligence"
                        className="w-full rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
