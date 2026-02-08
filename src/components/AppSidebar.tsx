import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  ShieldAlert,
  Crosshair,
  Wifi,
  WifiOff,
  AlertTriangle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Server,
} from "lucide-react";
import { useOllama } from "@/contexts/OllamaContext";
import { useBranding } from "@/contexts/BrandingContext";
import SettingsPanel from "@/components/SettingsPanel";

const personaConfig = {
  analyst: { icon: Brain, label: "Analyst", textOn: "text-analyst", dotOn: "bg-analyst" },
  risk: { icon: ShieldAlert, label: "Risk Mgr", textOn: "text-risk", dotOn: "bg-risk" },
  strategist: { icon: Crosshair, label: "Strategist", textOn: "text-strategist", dotOn: "bg-strategist" },
} as const;

type PersonaKey = keyof typeof personaConfig;

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { nodes, isLoading } = useOllama();
  const { branding } = useBranding();

  const displayNodes = nodes.length > 0 ? nodes : [
    { id: "1", label: "VPS-1", persona: "analyst", model: "deepseek-r1", ip: "—", port: "11434", status: "offline" as const },
    { id: "2", label: "VPS-2", persona: "risk", model: "deepseek-r1", ip: "—", port: "11434", status: "offline" as const },
    { id: "3", label: "VPS-3", persona: "strategist", model: "deepseek-r1", ip: "—", port: "11434", status: "offline" as const },
  ];

  const onlineCount = displayNodes.filter((n) => n.status === "online").length;

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 48 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative flex h-full flex-col border-r border-border/20 bg-card/30 overflow-hidden shrink-0"
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 border-b border-border/20 px-3 py-3">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.siteName} className="h-6 w-6 shrink-0 object-contain" />
          ) : (
            <div className="shrink-0 rounded-lg bg-primary/10 p-1">
              <Brain className="h-4 w-4 text-primary" />
            </div>
          )}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-display text-sm font-bold text-foreground truncate"
              >
                {branding.siteName}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Neural Cluster Section */}
        <div className="px-3 py-3">
          {!collapsed && (
            <div className="mb-2 flex items-center gap-1.5">
              <Server className="h-3 w-3 text-muted-foreground/50" />
              <span className="font-mono text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                Neural Cluster
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            {isLoading
              ? [0, 1, 2].map((i) => (
                  <div key={i} className="h-7 animate-pulse rounded bg-muted/10" />
                ))
              : displayNodes.map((node) => {
                  const pKey = (node.persona in personaConfig ? node.persona : "analyst") as PersonaKey;
                  const p = personaConfig[pKey];
                  const PIcon = p.icon;
                  const isOnline = node.status === "online";
                  const isDegraded = node.status === "degraded";

                  return (
                    <div
                      key={node.id}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/10"
                      title={`${node.label} — ${node.status}`}
                    >
                      <div className="relative shrink-0">
                        <PIcon
                          className={`h-3.5 w-3.5 ${
                            isOnline ? p.textOn : isDegraded ? "text-hold/70" : "text-muted-foreground/30"
                          }`}
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full border border-card/50 ${
                            isOnline ? "bg-buy" : isDegraded ? "bg-hold" : "bg-muted-foreground/20"
                          }`}
                        />
                      </div>
                      {!collapsed && (
                        <div className="flex flex-1 items-center justify-between min-w-0">
                          <span className="font-mono text-[10px] font-medium text-foreground/70 truncate">
                            {node.label}
                          </span>
                          <div className="flex items-center gap-1">
                            {isOnline ? (
                              <Wifi className="h-2.5 w-2.5 text-buy/50" />
                            ) : isDegraded ? (
                              <AlertTriangle className="h-2.5 w-2.5 text-hold/50" />
                            ) : (
                              <WifiOff className="h-2.5 w-2.5 text-muted-foreground/20" />
                            )}
                            <span
                              className={`font-mono text-[8px] font-bold ${
                                isOnline ? "text-buy/70" : isDegraded ? "text-hold/70" : "text-muted-foreground/25"
                              }`}
                            >
                              {node.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
          </div>

          {/* Cluster summary */}
          {!collapsed && (
            <div className="mt-2 flex items-center gap-1.5 px-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  onlineCount === displayNodes.length
                    ? "bg-buy animate-pulse"
                    : onlineCount > 0
                    ? "bg-hold animate-pulse"
                    : "bg-muted-foreground/20"
                }`}
              />
              <span className="font-mono text-[9px] text-muted-foreground/50">
                {onlineCount}/{displayNodes.length} online
              </span>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom actions */}
        <div className="border-t border-border/20 p-2 space-y-1">
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-muted-foreground transition-colors hover:bg-muted/10 hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span className="text-xs">Settings</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-3 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border/30 bg-card text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/20"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </motion.aside>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default AppSidebar;
