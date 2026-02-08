import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MarketMode } from "@/contexts/MarketModeContext";

export interface PersonaResponse {
  persona: "analyst" | "risk" | "strategist";
  thinking: string;
  content: string;
  error?: string;
}

export interface AnalysisResult {
  responses: PersonaResponse[];
  errors: Array<{ persona: string; error: string }>;
  degraded: boolean;
  unifiedSignal: {
    action: "BUY" | "SELL" | "HOLD";
    confidence: number;
    summary: string;
  } | null;
  nodesQueried: number;
  nodesResponded: number;
}

export const useOllamaAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const analyze = async (query: string, marketMode: MarketMode = "forex"): Promise<AnalysisResult | null> => {
    setIsAnalyzing(true);
    setLastError(null);

    try {
      const { data, error } = await supabase.functions.invoke("ollama-analyze", {
        body: { query, marketMode },
      });

      if (error) {
        setLastError(error.message);
        return null;
      }

      if (data.error && data.responses?.length === 0) {
        setLastError(data.detail || data.error);
        return null;
      }

      return data as AnalysisResult;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect to analysis backend";
      setLastError(message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyze, isAnalyzing, lastError };
};
