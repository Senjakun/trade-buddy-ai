import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VPSNode {
  id: string;
  label: string;
  persona: string;
  model: string;
  ip: string;
  port: string;
  status: "online" | "offline" | "degraded";
}

export const useVPSNodes = () => {
  return useQuery({
    queryKey: ["vps-nodes"],
    queryFn: async (): Promise<VPSNode[]> => {
      const { data, error } = await supabase
        .from("vps_nodes")
        .select("id, label, persona, model, ip, port, status");

      if (error) throw error;
      return (data || []) as VPSNode[];
    },
  });
};

export const useUpdateVPSNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<VPSNode>;
    }) => {
      // Since we have public read-only RLS, updates go through the edge function
      // For now, update locally via context. The admin manages via backend panel.
      // We'll update optimistically in the query cache.
      return { id, updates };
    },
    onSuccess: (_, { id, updates }) => {
      queryClient.setQueryData<VPSNode[]>(["vps-nodes"], (old) =>
        old?.map((n) => (n.id === id ? { ...n, ...updates } : n))
      );
    },
  });
};
