import { createContext, useContext, ReactNode } from "react";
import { useVPSNodes, useUpdateVPSNode, VPSNode } from "@/hooks/useVPSNodes";

export type { VPSNode };

interface OllamaContextType {
  nodes: VPSNode[];
  isLoading: boolean;
  updateNode: (id: string, updates: Partial<VPSNode>) => void;
}

const OllamaContext = createContext<OllamaContextType | undefined>(undefined);

export const OllamaProvider = ({ children }: { children: ReactNode }) => {
  const { data: nodes = [], isLoading } = useVPSNodes();
  const updateMutation = useUpdateVPSNode();

  const updateNode = (id: string, updates: Partial<VPSNode>) => {
    updateMutation.mutate({ id, updates });
  };

  return (
    <OllamaContext.Provider value={{ nodes, isLoading, updateNode }}>
      {children}
    </OllamaContext.Provider>
  );
};

export const useOllama = () => {
  const ctx = useContext(OllamaContext);
  if (!ctx) throw new Error("useOllama must be used within OllamaProvider");
  return ctx;
};
