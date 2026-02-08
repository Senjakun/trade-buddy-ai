import { createContext, useContext, ReactNode, useMemo, useEffect } from "react";
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

  // Dynamic document title
  useEffect(() => {
    document.title = branding.siteName
      ? `${branding.siteName} — ${branding.tagline}`
      : "Sovereign AI — AI-Powered Trading Intelligence";
  }, [branding.siteName, branding.tagline]);

  // Dynamic favicon from logo
  useEffect(() => {
    if (branding.logoUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = branding.logoUrl;
    }
  }, [branding.logoUrl]);

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
