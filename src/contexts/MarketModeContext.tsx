import { createContext, useContext, useState, ReactNode } from "react";

export type MarketMode = "forex" | "futures";

interface MarketModeContextType {
  mode: MarketMode;
  setMode: (mode: MarketMode) => void;
}

const MarketModeContext = createContext<MarketModeContextType | undefined>(undefined);

export const MarketModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<MarketMode>("forex");

  return (
    <MarketModeContext.Provider value={{ mode, setMode }}>
      {children}
    </MarketModeContext.Provider>
  );
};

export const useMarketMode = () => {
  const ctx = useContext(MarketModeContext);
  if (!ctx) throw new Error("useMarketMode must be used within MarketModeProvider");
  return ctx;
};
