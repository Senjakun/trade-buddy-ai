import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BrandingConfig {
  id: string;
  site_name: string;
  logo_url: string;
  tagline: string;
}

export const useBrandingConfig = () => {
  return useQuery({
    queryKey: ["branding-config"],
    queryFn: async (): Promise<BrandingConfig> => {
      const { data, error } = await supabase
        .from("branding_config")
        .select("id, site_name, logo_url, tagline")
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      return (data as BrandingConfig) || {
        id: "",
        site_name: "Sovereign AI",
        logo_url: "",
        tagline: "AI-Powered Trading Intelligence",
      };
    },
  });
};
