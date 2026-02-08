import { Server } from "lucide-react";
import { useOllama } from "@/contexts/OllamaContext";

const NodeStatus = () => {
  const { nodes } = useOllama();
  const onlineCount = nodes.filter((n) => n.status === "online").length;
  const isDegraded = onlineCount > 0 && onlineCount < 3;
  const isOffline = onlineCount === 0;

  return (
    <div className="flex items-center gap-3">
      {nodes.map((node) => (
        <div
          key={node.id}
          className="flex items-center gap-1.5"
          title={`${node.label}: ${node.status}`}
        >
          <Server className="h-3 w-3 text-muted-foreground" />
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              node.status === "online"
                ? "bg-buy"
                : node.status === "degraded"
                ? "bg-hold"
                : "bg-muted-foreground/30"
            }`}
          />
        </div>
      ))}
      {isDegraded && (
        <span className="rounded-sm bg-hold/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-hold uppercase">
          Degraded
        </span>
      )}
      {isOffline && !isDegraded && (
        <span className="rounded-sm bg-muted/30 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-muted-foreground uppercase">
          Demo Mode
        </span>
      )}
    </div>
  );
};

export default NodeStatus;
