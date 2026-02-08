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

const FOREX_PROMPTS: Record<string, string> = {
  analyst: `You are a senior Forex technical analyst specializing in currency pairs and precious metals. Analyze using RSI, MACD, Fibonacci retracements, Bollinger Bands, and candlestick patterns. Consider session timing (London, New York, Tokyo, Sydney). Provide precise pip-level analysis with specific support/resistance zones. Format with markdown bold (**) and emoji indicators. Always include specific values for indicators and price levels.`,
  risk: `You are a professional Forex risk manager. Calculate Stop-Loss and Take-Profit in pips, position sizing based on account risk percentage, and assess volatility via ATR. Consider spread costs, swap rates, and margin requirements for the specific pair. Format with clear risk parameters using markdown bold (**) and emoji indicators. Provide specific pip values and lot sizing.`,
  strategist: `You are a Forex trading strategist and market commander. Synthesize technical analysis and risk data with macroeconomic factors (interest rate differentials, central bank policy, economic calendar events, geopolitical risk). End with a clear FINAL DECISION: either "GO — LONG", "NO GO — SHORT", or "HOLD — WAIT" with a confidence percentage.`,
};

const FUTURES_PROMPTS: Record<string, string> = {
  analyst: `You are a senior Futures technical analyst specializing in commodities, indices, and derivatives. Analyze using RSI, MACD, Fibonacci, Volume Profile, and Open Interest. Consider contract expiration, contango/backwardation, and settlement cycles. Provide precise point/tick-level analysis with specific levels. Format with markdown bold (**) and emoji indicators.`,
  risk: `You are a professional Futures risk manager. Calculate Stop-Loss and Take-Profit in ticks/points, position sizing based on margin requirements, and assess volatility via ATR and historical vol. Consider initial margin, maintenance margin, and daily settlement risk. Format with clear risk parameters using markdown bold (**) and emoji. Provide specific tick values and contract sizing.`,
  strategist: `You are a Futures trading strategist and market commander. Synthesize technical analysis and risk data with macro factors (COT reports, basis trades, term structure, seasonal patterns). End with a clear FINAL DECISION: either "GO — LONG", "NO GO — SHORT", or "HOLD — WAIT" with a confidence percentage.`,
};

async function queryOllamaNode(
  node: VPSNode,
  userQuery: string,
  marketMode: string,
  signal: AbortSignal
): Promise<{ persona: string; content: string; thinking: string; error?: string }> {
  const url = `http://${node.ip}:${node.port}/api/chat`;
  const prompts = marketMode === "futures" ? FUTURES_PROMPTS : FOREX_PROMPTS;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: node.model,
      messages: [
        { role: "system", content: prompts[node.persona] || "" },
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
    const { query, marketMode = "forex" } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'query' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    const TIMEOUT_MS = 15000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const results = await Promise.allSettled(
      activeNodes.map((node) => queryOllamaNode(node, query, marketMode, controller.signal))
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

    const totalConfigured = activeNodes.length;
    const successCount = responses.length;
    const degraded = successCount < totalConfigured;

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

      const confMatch = strategistResponse.content.match(/(\d{1,3})%/);
      const confidence = confMatch ? parseInt(confMatch[1]) : 50;

      unifiedSignal = {
        action,
        confidence,
        summary: `Based on ${successCount}/${totalConfigured} node responses. Mode: ${marketMode.toUpperCase()}`,
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
