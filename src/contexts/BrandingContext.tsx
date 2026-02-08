import { createContext, useContext, ReactNode, useMemo } from "react";
import { useBrandingConfig, BrandingConfig } from "@/hooks/useBrandingConfig";

interface BrandingContextValue {
  branding: {
    siteName: string;
    logoUrl: string;
    tagline: string;
  };
  isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading } = useBrandingConfig();

  const branding = useMemo(
    () => ({
      siteName: data?.site_name || "Sovereign AI",
      logoUrl: data?.logo_url || "",
      tagline: data?.tagline || "AI-Powered Trading Intelligence",
    }),
    [data]
  );

  return (
    <BrandingContext.Provider value={{ branding, isLoading }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error("useBranding must be used within BrandingProvider");
  return ctx;
};
