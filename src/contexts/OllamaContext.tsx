import { createContext, useContext, useState, ReactNode } from "react";

export interface VPSNode {
  id: string;
  label: string;
  persona: string;
  model: string;
  ip: string;
  port: string;
  status: "online" | "offline" | "degraded";
}

interface OllamaContextType {
  nodes: VPSNode[];
  updateNode: (id: string, updates: Partial<VPSNode>) => void;
}

const defaultNodes: VPSNode[] = [
  {
    id: "vps1",
    label: "VPS 1 — Analyst",
    persona: "analyst",
    model: "deepseek-r1",
    ip: "",
    port: "11434",
    status: "offline",
  },
  {
    id: "vps2",
    label: "VPS 2 — Risk Manager",
    persona: "risk",
    model: "llama3",
    ip: "",
    port: "11434",
    status: "offline",
  },
  {
    id: "vps3",
    label: "VPS 3 — Strategist",
    persona: "strategist",
    model: "mistral",
    ip: "",
    port: "11434",
    status: "offline",
  },
];

const OllamaContext = createContext<OllamaContextType | undefined>(undefined);

export const OllamaProvider = ({ children }: { children: ReactNode }) => {
  const [nodes, setNodes] = useState<VPSNode[]>(() => {
    const stored = localStorage.getItem("ollama_nodes");
    return stored ? JSON.parse(stored) : defaultNodes;
  });

  const updateNode = (id: string, updates: Partial<VPSNode>) => {
    setNodes((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, ...updates } : n));
      localStorage.setItem("ollama_nodes", JSON.stringify(next));
      return next;
    });
  };

  return (
    <OllamaContext.Provider value={{ nodes, updateNode }}>
      {children}
    </OllamaContext.Provider>
  );
};

export const useOllama = () => {
  const ctx = useContext(OllamaContext);
  if (!ctx) throw new Error("useOllama must be used within OllamaProvider");
  return ctx;
};
