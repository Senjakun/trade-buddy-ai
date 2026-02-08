import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VPSNode {
  id: string;
  label: string;
  persona: string;
  model: string;
  ip: string;
  port: string;
  status: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  analyst: `You are a senior crypto technical analyst. Your role is to analyze trading pairs using RSI, MACD, Fibonacci retracements, and Japanese candlestick patterns. Provide precise technical analysis with specific values and levels. Format your response with clear sections using markdown bold (**) and emoji indicators. Always include specific numbers for indicators and price levels.`,
  risk: `You are a professional risk manager for crypto trading. Your role is to calculate Stop-Loss, Take-Profit levels, position sizing, and assess volatility risk. Focus on protecting margin against liquidation and volatility. Format your response with clear risk parameters using markdown bold (**) and emoji indicators. Provide specific dollar amounts and percentages.`,
  strategist: `You are a trading strategist and market commander. Your role is to synthesize technical analysis and risk data to make a final Go/No-Go trading decision. Evaluate market sentiment, on-chain data, funding rates, and social metrics. End with a clear FINAL DECISION: either "GO — LONG", "NO GO — SHORT", or "HOLD — WAIT" with a confidence percentage.`,
};

async function queryOllamaNode(
  node: VPSNode,
  userQuery: string,
  signal: AbortSignal
): Promise<{ persona: string; content: string; thinking: string; error?: string }> {
  const url = `http://${node.ip}:${node.port}/api/chat`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: node.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[node.persona] || "" },
        { role: "user", content: userQuery },
      ],
      stream: false,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Ollama returned ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const fullContent = data.message?.content || "";

  // Extract thinking section if present (DeepSeek-R1 format)
  let thinking = "";
  let content = fullContent;
  const thinkMatch = fullContent.match(/<think>([\s\S]*?)<\/think>/);
  if (thinkMatch) {
    thinking = thinkMatch[1].trim();
    content = fullContent.replace(/<think>[\s\S]*?<\/think>/, "").trim();
  }

  return { persona: node.persona, content, thinking };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'query' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch VPS nodes from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: nodes, error: dbError } = await supabase
      .from("vps_nodes")
      .select("*");

    if (dbError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch node configs", detail: dbError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter to nodes that have an IP configured
    const activeNodes = (nodes as VPSNode[]).filter((n) => n.ip && n.ip.trim() !== "");

    if (activeNodes.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No active nodes",
          detail: "No VPS nodes have IP addresses configured. Go to Settings to add your Ollama server IPs.",
          responses: [],
          degraded: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Race-to-Decision: 15 second timeout per node
    const TIMEOUT_MS = 15000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Query all active nodes in parallel
    const results = await Promise.allSettled(
      activeNodes.map((node) => queryOllamaNode(node, query, controller.signal))
    );

    clearTimeout(timeout);

    const responses: Array<{
      persona: string;
      content: string;
      thinking: string;
      error?: string;
    }> = [];
    const errors: Array<{ persona: string; error: string }> = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const node = activeNodes[i];
      if (result.status === "fulfilled") {
        responses.push(result.value);
      } else {
        const errMsg =
          result.reason?.name === "AbortError"
            ? "Timeout: Node did not respond within 15 seconds"
            : result.reason?.message || "Unknown error";
        errors.push({ persona: node.persona, error: errMsg });
      }
    }

    // Determine degraded mode
    const totalConfigured = activeNodes.length;
    const successCount = responses.length;
    const degraded = successCount < totalConfigured;

    // Generate unified signal from strategist response if available
    let unifiedSignal = null;
    const strategistResponse = responses.find((r) => r.persona === "strategist");
    if (strategistResponse) {
      const content = strategistResponse.content.toUpperCase();
      let action: "BUY" | "SELL" | "HOLD" = "HOLD";
      if (content.includes("GO — LONG") || content.includes("GO —LONG") || content.includes("GO - LONG")) {
        action = "BUY";
      } else if (content.includes("NO GO") || content.includes("SHORT")) {
        action = "SELL";
      }

      // Try to extract confidence
      const confMatch = strategistResponse.content.match(/(\d{1,3})%/);
      const confidence = confMatch ? parseInt(confMatch[1]) : 50;

      unifiedSignal = {
        action,
        confidence,
        summary: `Based on ${successCount}/${totalConfigured} node responses.`,
      };
    }

    return new Response(
      JSON.stringify({
        responses,
        errors,
        degraded,
        unifiedSignal,
        nodesQueried: totalConfigured,
        nodesResponded: successCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", detail: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
