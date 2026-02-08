import { Brain, ShieldAlert, Crosshair, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { useOllama } from "@/contexts/OllamaContext";

const personaConfig = {
  analyst: { icon: Brain, label: "Analyst", dotOn: "bg-analyst", textOn: "text-analyst" },
  risk: { icon: ShieldAlert, label: "Risk Mgr", dotOn: "bg-risk", textOn: "text-risk" },
  strategist: { icon: Crosshair, label: "Strategist", dotOn: "bg-strategist", textOn: "text-strategist" },
} as const;

type PersonaKey = keyof typeof personaConfig;

const NeuralStatusBar = () => {
  const { nodes, isLoading } = useOllama();

  const displayNodes = nodes.length > 0 ? nodes : [
    { id: "1", label: "VPS-1", persona: "analyst", model: "deepseek-r1", ip: "—", port: "11434", status: "offline" as const },
    { id: "2", label: "VPS-2", persona: "risk", model: "deepseek-r1", ip: "—", port: "11434", status: "offline" as const },
    { id: "3", label: "VPS-3", persona: "strategist", model: "deepseek-r1", ip: "—", port: "11434", status: "offline" as const },
  ];

  const onlineCount = displayNodes.filter((n) => n.status === "online").length;

  if (isLoading) {
    return (
      <div className="border-b border-border/20 bg-card/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <div className="h-3 w-20 animate-pulse rounded bg-muted/20" />
          <div className="flex gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-3 w-16 animate-pulse rounded bg-muted/20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border/20 bg-card/10 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
        {/* Left: cluster label */}
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
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
            Neural Cluster
          </span>
          <span className="font-mono text-[9px] text-muted-foreground/50 ml-0.5">
            {onlineCount}/{displayNodes.length}
          </span>
        </div>

        {/* Right: individual node statuses */}
        <div className="flex items-center gap-4">
          {displayNodes.map((node) => {
            const pKey = (node.persona in personaConfig ? node.persona : "analyst") as PersonaKey;
            const p = personaConfig[pKey];
            const PIcon = p.icon;
            const isOnline = node.status === "online";
            const isDegraded = node.status === "degraded";

            return (
              <div key={node.id} className="flex items-center gap-1.5" title={`${node.label} — ${node.status}`}>
                <PIcon className={`h-3 w-3 ${isOnline ? p.textOn : isDegraded ? "text-hold/70" : "text-muted-foreground/30"}`} />
                <span className={`font-mono text-[9px] font-medium ${isOnline ? "text-foreground/70" : "text-muted-foreground/30"}`}>
                  {node.label}
                </span>
                {isOnline ? (
                  <Wifi className="h-2.5 w-2.5 text-buy/60" />
                ) : isDegraded ? (
                  <AlertTriangle className="h-2.5 w-2.5 text-hold/60" />
                ) : (
                  <WifiOff className="h-2.5 w-2.5 text-muted-foreground/20" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NeuralStatusBar;
