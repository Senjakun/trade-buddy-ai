import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Server,
  Brain,
  ShieldAlert,
  Crosshair,
  Wifi,
  WifiOff,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Trash2,
} from "lucide-react";
import { useOllama } from "@/contexts/OllamaContext";
import { useBranding } from "@/contexts/BrandingContext";
import { useMarketMode, MarketMode } from "@/contexts/MarketModeContext";
import SettingsPanel from "@/components/SettingsPanel";

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

const personaConfig = {
  analyst: { icon: Brain, label: "Analyst", color: "text-analyst", dot: "bg-analyst" },
  risk: { icon: ShieldAlert, label: "Risk", color: "text-risk", dot: "bg-risk" },
  strategist: { icon: Crosshair, label: "Strat", color: "text-strategist", dot: "bg-strategist" },
} as const;

const modeConfig: Record<MarketMode, { icon: typeof TrendingUp; label: string }> = {
  forex: { icon: TrendingUp, label: "Forex" },
  futures: { icon: BarChart3, label: "Futures" },
};

const ChatSidebar = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: ChatSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { nodes, isLoading } = useOllama();
  const { branding } = useBranding();
  const { mode, setMode } = useMarketMode();

  const displayNodes = nodes.length > 0 ? nodes : [
    { id: "1", label: "VPS-1", persona: "analyst", model: "deepseek-r1", ip: "—", port: "11434", status: "offline" as const },
    { id: "2", label: "VPS-2", persona: "risk", model: "deepseek-r1", ip: "—", port: "11434", status: "offline" as const },
    { id: "3", label: "VPS-3", persona: "strategist", model: "deepseek-r1", ip: "—", port: "11434", status: "offline" as const },
  ];

  const onlineCount = displayNodes.filter((n) => n.status === "online").length;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCollapsed(true)}
            className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Collapsed toggle button (mobile) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="fixed left-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors md:hidden"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: collapsed ? 0 : 280,
          opacity: collapsed ? 0 : 1,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`relative flex h-full flex-col bg-sidebar border-r border-sidebar-border overflow-hidden shrink-0 z-40 ${
          collapsed ? "md:w-0" : "md:w-[280px]"
        } ${!collapsed ? "fixed md:relative inset-y-0 left-0 w-[280px]" : ""}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2 min-w-0">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.siteName} className="h-7 w-7 shrink-0 object-contain rounded-lg" />
            ) : (
              <div className="shrink-0 rounded-lg bg-primary/15 p-1.5">
                <Brain className="h-4 w-4 text-primary" />
              </div>
            )}
            <span className="font-display text-sm font-bold text-foreground truncate">
              {branding.siteName}
            </span>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-accent/50 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-sidebar-accent"
          >
            <Plus className="h-4 w-4" />
            New Analysis
          </button>
        </div>

        {/* Market Mode Toggle */}
        <div className="px-3 pb-3">
          <div className="flex rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-0.5">
            {(["forex", "futures"] as MarketMode[]).map((m) => {
              const cfg = modeConfig[m];
              const MIcon = cfg.icon;
              const isActive = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-sidebar-foreground hover:text-foreground"
                  }`}
                >
                  <MIcon className="h-3.5 w-3.5" />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto scrollbar-chat px-2">
          <div className="px-1 py-2">
            <span className="text-[11px] font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Recent Chats
            </span>
          </div>
          {sessions.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-sidebar-foreground/20 mb-2" />
              <p className="text-xs text-sidebar-foreground/40">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                    activeSessionId === session.id
                      ? "bg-sidebar-accent text-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  }`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 opacity-50" />
                  <span className="flex-1 truncate text-sm">{session.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded text-sidebar-foreground/50 hover:text-sell transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Neural Cluster Status (compact) */}
        <div className="border-t border-sidebar-border px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-2">
            <Server className="h-3 w-3 text-sidebar-foreground/50" />
            <span className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Cluster
            </span>
            <span className={`ml-auto flex items-center gap-1 text-[10px] font-mono ${
              onlineCount === displayNodes.length ? "text-buy" : onlineCount > 0 ? "text-hold" : "text-sidebar-foreground/30"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                onlineCount === displayNodes.length ? "bg-buy animate-pulse" : onlineCount > 0 ? "bg-hold animate-pulse" : "bg-sidebar-foreground/20"
              }`} />
              {onlineCount}/{displayNodes.length}
            </span>
          </div>
          <div className="flex gap-1">
            {displayNodes.map((node) => {
              const pKey = (node.persona in personaConfig ? node.persona : "analyst") as keyof typeof personaConfig;
              const p = personaConfig[pKey];
              const PIcon = p.icon;
              const isOnline = node.status === "online";
              const isDegraded = node.status === "degraded";
              return (
                <div
                  key={node.id}
                  className="flex-1 flex items-center gap-1 rounded-md bg-sidebar-accent/30 px-2 py-1"
                  title={`${node.label} — ${node.status}`}
                >
                  <PIcon className={`h-3 w-3 ${isOnline ? p.color : isDegraded ? "text-hold/70" : "text-sidebar-foreground/25"}`} />
                  <span className={`text-[9px] font-mono ${isOnline ? "text-buy/80" : isDegraded ? "text-hold/80" : "text-sidebar-foreground/25"}`}>
                    {isOnline ? "ON" : isDegraded ? "DEG" : "OFF"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Settings */}
        <div className="border-t border-sidebar-border p-2">
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </motion.aside>

      {/* Desktop collapsed toggle */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden md:flex fixed left-3 top-3 z-40 h-10 w-10 items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      )}

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default ChatSidebar;
