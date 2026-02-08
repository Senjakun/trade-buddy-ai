import { createContext, useContext, useState, ReactNode } from "react";

interface BrandingConfig {
  siteName: string;
  logoUrl: string;
  tagline: string;
}

interface BrandingContextType {
  branding: BrandingConfig;
  updateBranding: (config: Partial<BrandingConfig>) => void;
}

const defaultBranding: BrandingConfig = {
  siteName: "Sovereign AI",
  logoUrl: "",
  tagline: "AI-Powered Trading Intelligence",
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const [branding, setBranding] = useState<BrandingConfig>(() => {
    const stored = localStorage.getItem("branding_config");
    return stored ? { ...defaultBranding, ...JSON.parse(stored) } : defaultBranding;
  });

  const updateBranding = (config: Partial<BrandingConfig>) => {
    setBranding((prev) => {
      const next = { ...prev, ...config };
      localStorage.setItem("branding_config", JSON.stringify(next));
      return next;
    });
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error("useBranding must be used within BrandingProvider");
  return ctx;
};
