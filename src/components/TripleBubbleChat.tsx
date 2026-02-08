import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Brain,
  ShieldAlert,
  Crosshair,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PersonaResponse {
  persona: "analyst" | "risk" | "strategist";
  thinking: string;
  content: string;
  isStreaming: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  query?: string;
  responses?: PersonaResponse[];
  unifiedSignal?: {
    action: "BUY" | "SELL" | "HOLD";
    confidence: number;
    summary: string;
  };
  timestamp: Date;
}

const personaConfig = {
  analyst: {
    label: "Analyst",
    icon: Brain,
    colorClass: "text-analyst",
    bgClass: "bg-analyst/10",
    borderClass: "border-analyst/30",
    model: "DeepSeek-R1",
  },
  risk: {
    label: "Risk Manager",
    icon: ShieldAlert,
    colorClass: "text-risk",
    bgClass: "bg-risk/10",
    borderClass: "border-risk/30",
    model: "Llama 3",
  },
  strategist: {
    label: "Strategist",
    icon: Crosshair,
    colorClass: "text-strategist",
    bgClass: "bg-strategist/10",
    borderClass: "border-strategist/30",
    model: "Mistral",
  },
};

// Mock streaming data
const mockResponses: Record<string, PersonaResponse> = {
  analyst: {
    persona: "analyst",
    thinking:
      "Analyzing SOL/USDT on 4H timeframe... RSI at 42.3 showing oversold conditions. MACD histogram showing bullish divergence. Fibonacci 0.618 retracement level at $168.50 acting as strong support. Japanese candlestick pattern: Bullish engulfing forming at key support.",
    content:
      "**Technical Analysis — SOL/USDT**\n\n📊 **RSI (4H):** 42.3 — Approaching oversold territory\n📈 **MACD:** Bullish divergence confirmed on histogram\n📐 **Fibonacci:** Price holding 0.618 retracement ($168.50)\n🕯️ **Candlestick:** Bullish engulfing at key support zone\n\n**Verdict:** Technical indicators favor a long entry. Support at $168.50 is strong with multiple confluence factors.",
    isStreaming: false,
  },
  risk: {
    persona: "risk",
    thinking:
      "Evaluating risk parameters... Current volatility is moderate. ATR(14) at $8.20. Position sizing based on 2% account risk. Calculating optimal stop-loss and take-profit levels based on recent swing structure.",
    content:
      "**Risk Assessment — SOL/USDT**\n\n🛡️ **Stop-Loss:** $164.20 (below swing low, -2.8%)\n🎯 **Take-Profit 1:** $178.50 (+5.7%, R:R 2.0)\n🎯 **Take-Profit 2:** $185.00 (+9.5%, R:R 3.4)\n💰 **Position Size:** 3.2% of portfolio (moderate)\n⚡ **Volatility:** ATR(14) $8.20 — Moderate\n\n**Risk Score:** 6.5/10 — Acceptable for swing trade. Keep position size conservative due to broader market uncertainty.",
    isStreaming: false,
  },
  strategist: {
    persona: "strategist",
    thinking:
      "Cross-referencing technical and risk data... Market sentiment is cautiously bullish. BTC dominance declining which favors altcoins. SOL ecosystem showing strong developer activity. Funding rates neutral. Social sentiment turning positive.",
    content:
      '**Strategic Decision — SOL/USDT**\n\n🌐 **Market Sentiment:** Cautiously Bullish\n📉 **BTC Dominance:** Declining — altcoin-favorable\n🔗 **On-chain:** DEX volume up 23% on Solana\n💬 **Social Score:** 7.2/10 — Positive momentum\n\n**🟢 FINAL DECISION: GO — LONG**\n\nConfidence: **84%**\nEntry Zone: $168.50 – $170.00\nTimeframe: 2-5 days swing\n\n_"The confluence of technical support, manageable risk, and positive sentiment creates a favorable risk-reward setup."_',
    isStreaming: false,
  },
};

const ThinkingSection = ({
  thinking,
  persona,
}: {
  thinking: string;
  persona: "analyst" | "risk" | "strategist";
}) => {
  const [expanded, setExpanded] = useState(false);
  const config = personaConfig[persona];

  return (
    <div className="mb-3 rounded-md border border-border/30 bg-muted/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Sparkles className={`h-3 w-3 ${config.colorClass}`} />
        <span className="font-mono">Thinking Process</span>
        {expanded ? (
          <ChevronUp className="ml-auto h-3 w-3" />
        ) : (
          <ChevronDown className="ml-auto h-3 w-3" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="px-3 pb-3 font-mono text-xs leading-relaxed text-muted-foreground/80 italic">
              {thinking}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PersonaBubble = ({ response }: { response: PersonaResponse }) => {
  const config = personaConfig[response.persona];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`void-card rounded-lg p-4 persona-${response.persona}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className={`rounded-md ${config.bgClass} p-1.5`}>
          <Icon className={`h-4 w-4 ${config.colorClass}`} />
        </div>
        <div>
          <span className={`text-sm font-semibold ${config.colorClass}`}>
            {config.label}
          </span>
          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
            {config.model}
          </span>
        </div>
      </div>

      {response.thinking && (
        <ThinkingSection thinking={response.thinking} persona={response.persona} />
      )}

      <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-foreground/90">
        {response.content.split("\n").map((line, i) => (
          <p key={i} className={`mb-1 ${line.startsWith("**") ? "font-semibold" : ""}`}>
            {line}
          </p>
        ))}
        {response.isStreaming && (
          <span className="inline-block h-4 w-1 animate-typing bg-foreground/60 ml-0.5" />
        )}
      </div>
    </motion.div>
  );
};

const SignalBadge = ({
  signal,
}: {
  signal: { action: string; confidence: number; summary: string };
}) => {
  const isGo = signal.action === "BUY";
  const isSell = signal.action === "SELL";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mx-auto mt-4 max-w-md rounded-xl border p-4 text-center ${
        isGo
          ? "border-buy/40 bg-buy/5 glow-buy"
          : isSell
          ? "border-sell/40 bg-sell/5 glow-sell"
          : "border-hold/40 bg-hold/5"
      }`}
    >
      <div className="mb-1 text-xs font-mono text-muted-foreground uppercase tracking-wider">
        Unified AI Decision
      </div>
      <div
        className={`text-2xl font-black font-display ${
          isGo ? "text-buy" : isSell ? "text-sell" : "text-hold"
        }`}
      >
        {signal.action === "BUY" ? "🟢 GO — LONG" : signal.action === "SELL" ? "🔴 NO GO — SHORT" : "🟡 HOLD — WAIT"}
      </div>
      <div className="mt-1 font-mono text-sm text-foreground/70">
        Confidence: <span className="font-bold text-foreground">{signal.confidence}%</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{signal.summary}</p>
    </motion.div>
  );
};

const TripleBubbleChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAnalyze = async () => {
    if (!input.trim() || isAnalyzing) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      query: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsAnalyzing(true);

    // Simulate streaming with delays
    await new Promise((r) => setTimeout(r, 1500));

    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "ai",
      responses: [
        mockResponses.analyst,
        mockResponses.risk,
        mockResponses.strategist,
      ],
      unifiedSignal: {
        action: "BUY",
        confidence: 84,
        summary:
          "Technical support + manageable risk + positive sentiment = favorable long setup on SOL/USDT.",
      },
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-void p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground">
                AI Trading Analysis
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Enter a trading pair (e.g. SOL/USDT) to receive multi-persona
                analysis from our AI nodes.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["SOL/USDT", "BTC/USDT", "ETH/USDT"].map((pair) => (
                  <button
                    key={pair}
                    onClick={() => setInput(`Analyze ${pair} for a swing trade entry`)}
                    className="rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    {pair}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === "user" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <div className="max-w-md rounded-2xl rounded-br-sm bg-primary/15 border border-primary/20 px-4 py-3">
                  <p className="text-sm text-foreground">{msg.query}</p>
                </div>
              </motion.div>
            )}

            {msg.role === "ai" && msg.responses && (
              <div className="space-y-4">
                <Tabs defaultValue="analyst" className="w-full">
                  <TabsList className="w-full bg-muted/30 border border-border/30">
                    <TabsTrigger
                      value="analyst"
                      className="flex-1 data-[state=active]:bg-analyst/10 data-[state=active]:text-analyst"
                    >
                      <Brain className="mr-1.5 h-3.5 w-3.5" />
                      Analyst
                    </TabsTrigger>
                    <TabsTrigger
                      value="risk"
                      className="flex-1 data-[state=active]:bg-risk/10 data-[state=active]:text-risk"
                    >
                      <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                      Risk
                    </TabsTrigger>
                    <TabsTrigger
                      value="strategist"
                      className="flex-1 data-[state=active]:bg-strategist/10 data-[state=active]:text-strategist"
                    >
                      <Crosshair className="mr-1.5 h-3.5 w-3.5" />
                      Strategist
                    </TabsTrigger>
                  </TabsList>
                  {msg.responses.map((resp) => (
                    <TabsContent key={resp.persona} value={resp.persona}>
                      <PersonaBubble response={resp} />
                    </TabsContent>
                  ))}
                </Tabs>

                {msg.unifiedSignal && <SignalBadge signal={msg.unifiedSignal} />}
              </div>
            )}
          </div>
        ))}

        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 rounded-lg void-card p-4"
          >
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Querying AI Nodes...
              </p>
              <p className="text-xs text-muted-foreground">
                Fetching analysis from Analyst, Risk Manager, and Strategist
              </p>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/30 bg-card/30 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="Analyze SOL/USDT for swing trade entry..."
            className="flex-1 rounded-lg border border-border/50 bg-muted/20 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
            disabled={isAnalyzing}
          />
          <Button
            onClick={handleAnalyze}
            disabled={!input.trim() || isAnalyzing}
            variant="hero"
            size="icon"
            className="h-12 w-12 shrink-0"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TripleBubbleChat;
