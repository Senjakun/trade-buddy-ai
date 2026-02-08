import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate admin key
  const adminKey = req.headers.get("x-admin-key");
  const expectedKey = Deno.env.get("ADMIN_KEY");
  if (!adminKey || adminKey !== expectedKey) {
    return unauthorized();
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { action, nodeId, updates } = await req.json();

    // ACTION: list — return all nodes
    if (action === "list") {
      const { data, error } = await supabase.from("vps_nodes").select("*");
      if (error) throw error;
      return new Response(JSON.stringify({ nodes: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: update — update node IP/port/model
    if (action === "update" && nodeId) {
      const allowedFields: Record<string, boolean> = {
        ip: true,
        port: true,
        model: true,
        label: true,
        status: true,
      };
      const safeUpdates: Record<string, string> = {};
      for (const [key, value] of Object.entries(updates || {})) {
        if (allowedFields[key] && typeof value === "string") {
          safeUpdates[key] = value;
        }
      }

      const { error } = await supabase
        .from("vps_nodes")
        .update(safeUpdates)
        .eq("id", nodeId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: ping — test connectivity to a node's Ollama instance
    if (action === "ping" && nodeId) {
      const { data: node, error: fetchErr } = await supabase
        .from("vps_nodes")
        .select("ip, port, label")
        .eq("id", nodeId)
        .single();

      if (fetchErr || !node) {
        return new Response(
          JSON.stringify({ error: "Node not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!node.ip || node.ip.trim() === "") {
        return new Response(
          JSON.stringify({ reachable: false, error: "No IP configured", latency: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const start = Date.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const resp = await fetch(`http://${node.ip}:${node.port}/api/tags`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const latency = Date.now() - start;

        if (resp.ok) {
          const body = await resp.json();
          const models = (body.models || []).map((m: { name: string }) => m.name);

          // Update status to online
          await supabase
            .from("vps_nodes")
            .update({ status: "online" })
            .eq("id", nodeId);

          return new Response(
            JSON.stringify({ reachable: true, latency, models }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          await supabase
            .from("vps_nodes")
            .update({ status: "degraded" })
            .eq("id", nodeId);

          return new Response(
            JSON.stringify({ reachable: false, error: `HTTP ${resp.status}`, latency }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (pingErr) {
        const latency = Date.now() - start;
        await supabase
          .from("vps_nodes")
          .update({ status: "offline" })
          .eq("id", nodeId);

        return new Response(
          JSON.stringify({
            reachable: false,
            error: pingErr instanceof Error ? pingErr.message : "Connection failed",
            latency,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: list, update, ping" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error", detail: err instanceof Error ? err.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
