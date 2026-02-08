import { motion } from "framer-motion";
import { Server, Brain, ShieldAlert, Crosshair, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { useOllama } from "@/contexts/OllamaContext";

const personaConfig = {
  analyst: {
    icon: Brain,
    label: "Technical Analyst",
    textColor: "text-analyst",
    bgIcon: "bg-analyst/10",
    bgIconOff: "bg-muted/20",
    textOff: "text-muted-foreground/50",
    textSub: "text-analyst/70",
    borderOn: "border-analyst/30 hover:border-analyst/50",
    glowLine: "bg-gradient-to-r from-transparent via-analyst/40 to-transparent",
  },
  risk: {
    icon: ShieldAlert,
    label: "Risk Manager",
    textColor: "text-risk",
    bgIcon: "bg-risk/10",
    bgIconOff: "bg-muted/20",
    textOff: "text-muted-foreground/50",
    textSub: "text-risk/70",
    borderOn: "border-risk/30 hover:border-risk/50",
    glowLine: "bg-gradient-to-r from-transparent via-risk/40 to-transparent",
  },
  strategist: {
    icon: Crosshair,
    label: "Strategist",
    textColor: "text-strategist",
    bgIcon: "bg-strategist/10",
    bgIconOff: "bg-muted/20",
    textOff: "text-muted-foreground/50",
    textSub: "text-strategist/70",
    borderOn: "border-strategist/30 hover:border-strategist/50",
    glowLine: "bg-gradient-to-r from-transparent via-strategist/40 to-transparent",
  },
} as const;

type PersonaKey = keyof typeof personaConfig;

const NeuralNodeCards = () => {
  const { nodes, isLoading } = useOllama();

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="void-card rounded-xl p-4 animate-pulse">
            <div className="h-4 w-24 rounded bg-muted/30 mb-3" />
            <div className="h-3 w-16 rounded bg-muted/20" />
          </div>
        ))}
      </div>
    );
  }

  const displayNodes = nodes.length > 0 ? nodes : [
    { id: "1", label: "VPS-1", persona: "analyst", model: "deepseek-r1", ip: "—", port: "11434", status: "offline" as const },
    { id: "2", label: "VPS-2", persona: "risk", model: "deepseek-r1", ip: "—", port: "11434", status: "offline" as const },
    { id: "3", label: "VPS-3", persona: "strategist", model: "deepseek-r1", ip: "—", port: "11434", status: "offline" as const },
  ];

  const onlineCount = displayNodes.filter((n) => n.status === "online").length;

  return (
    <div className="space-y-3">
      {/* System status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Neural Cluster
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              onlineCount === displayNodes.length
                ? "bg-buy animate-pulse"
                : onlineCount > 0
                ? "bg-hold animate-pulse"
                : "bg-muted-foreground/30"
            }`}
          />
          <span className="font-mono text-[10px] text-muted-foreground">
            {onlineCount}/{displayNodes.length} ONLINE
          </span>
        </div>
      </div>

      {/* Node cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {displayNodes.map((node, idx) => {
          const pKey = (node.persona in personaConfig ? node.persona : "analyst") as PersonaKey;
          const persona = personaConfig[pKey];
          const PIcon = persona.icon;
          const isOnline = node.status === "online";
          const isDegraded = node.status === "degraded";

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className={`void-card rounded-xl p-4 border transition-all duration-300 ${
                isOnline
                  ? persona.borderOn
                  : isDegraded
                  ? "border-hold/30"
                  : "border-border/20"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`rounded-lg p-1.5 ${isOnline ? persona.bgIcon : persona.bgIconOff}`}>
                    <PIcon className={`h-3.5 w-3.5 ${isOnline ? persona.textColor : persona.textOff}`} />
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold text-foreground">
                      {node.label}
                    </div>
                    <div className={`font-mono text-[9px] ${isOnline ? persona.textSub : "text-muted-foreground/50"}`}>
                      {persona.label}
                    </div>
                  </div>
                </div>
                {isOnline ? (
                  <Wifi className="h-3 w-3 text-buy/70" />
                ) : isDegraded ? (
                  <AlertTriangle className="h-3 w-3 text-hold/70" />
                ) : (
                  <WifiOff className="h-3 w-3 text-muted-foreground/30" />
                )}
              </div>

              {/* Status + Model */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Status</span>
                  <span className={`font-mono text-[10px] font-bold ${
                    isOnline ? "text-buy" : isDegraded ? "text-hold" : "text-muted-foreground/40"
                  }`}>
                    {node.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Model</span>
                  <span className="font-mono text-[10px] text-foreground/60">
                    {node.model}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Endpoint</span>
                  <span className="font-mono text-[10px] text-foreground/40">
                    {node.ip === "—" ? "Not configured" : `${node.ip}:${node.port}`}
                  </span>
                </div>
              </div>

              {/* Bottom glow line */}
              <div className={`mt-3 h-px w-full rounded-full ${
                isOnline ? persona.glowLine : "bg-border/20"
              }`} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default NeuralNodeCards;
