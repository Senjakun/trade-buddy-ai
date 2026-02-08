import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Brain,
  ShieldAlert,
  Crosshair,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useOllamaAnalysis, PersonaResponse } from "@/hooks/useOllamaAnalysis";
import { useMarketMode } from "@/contexts/MarketModeContext";
import PersonaBubble from "@/components/chat/PersonaBubble";
import FinalDecision from "@/components/chat/FinalDecision";

const QUICK_PICKS = {
  forex: [
    { label: "EUR/USD", query: "Analyze EUR/USD for a swing trade entry" },
    { label: "XAU/USD", query: "Analyze XAU/USD (Gold) for intraday scalping" },
    { label: "GBP/JPY", query: "Analyze GBP/JPY for trend continuation" },
    { label: "USD/JPY", query: "Analyze USD/JPY for a breakout setup" },
  ],
  futures: [
    { label: "ES (S&P 500)", query: "Analyze ES futures for a day trade setup" },
    { label: "NQ (Nasdaq)", query: "Analyze NQ futures for a momentum entry" },
    { label: "CL (Crude Oil)", query: "Analyze CL crude oil futures for a swing trade" },
    { label: "GC (Gold)", query: "Analyze GC gold futures for trend continuation" },
  ],
};

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  query?: string;
  responses?: PersonaResponse[];
  errors?: Array<{ persona: string; error: string }>;
  degraded?: boolean;
  unifiedSignal?: {
    action: "BUY" | "SELL" | "HOLD";
    confidence: number;
    summary: string;
  } | null;
  timestamp: Date;
}

const TripleBubbleChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { analyze, isAnalyzing, lastError } = useOllamaAnalysis();
  const { mode } = useMarketMode();

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
    const query = input;
    setInput("");

    const result = await analyze(query, mode);

    if (result) {
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "ai",
        responses: result.responses.map((r) => ({
          ...r,
          persona: r.persona as "analyst" | "risk" | "strategist",
        })),
        errors: result.errors,
        degraded: result.degraded,
        unifiedSignal: result.unifiedSignal,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }
  };

  const picks = QUICK_PICKS[mode];
  const placeholderText = mode === "forex"
    ? "Analyze EUR/USD for swing trade entry..."
    : "Analyze ES futures for day trade setup...";

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-void">
        <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
          {messages.length === 0 && (
            <div className="flex min-h-[50vh] items-center justify-center">
              <div className="text-center max-w-lg">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10">
                  <Brain className="h-8 w-8 text-primary/60" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground">
                  Omni-Asset AI Analysis
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Enter any {mode === "forex" ? "Forex pair or metal" : "futures contract"} to
                  receive multi-persona analysis from your neural cluster.
                  Each query activates three specialized AI agents.
                </p>

                {/* Mode indicator */}
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="font-mono text-[10px] font-semibold text-primary uppercase">
                    {mode} Mode
                  </span>
                </div>

                {/* Quick picks */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {picks.map((pick) => (
                    <button
                      key={pick.label}
                      onClick={() => setInput(pick.query)}
                      className="rounded-full border border-border/40 bg-muted/20 px-4 py-2 font-mono text-xs text-muted-foreground transition-all hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                    >
                      {pick.label}
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <div className="max-w-lg rounded-2xl rounded-br-sm bg-primary/10 border border-primary/15 px-5 py-3">
                    <p className="text-sm text-foreground leading-relaxed">{msg.query}</p>
                  </div>
                </motion.div>
              )}

              {msg.role === "ai" && msg.responses && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  {msg.degraded && (
                    <div className="flex items-center gap-2 rounded-lg border border-hold/20 bg-hold/5 px-3 py-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-hold" />
                      <span className="font-mono text-[11px] text-hold">
                        DEGRADED — Some nodes failed to respond
                      </span>
                    </div>
                  )}

                  <Tabs
                    defaultValue={msg.responses[0]?.persona || "analyst"}
                    className="w-full"
                  >
                    <TabsList className="w-full bg-muted/20 border border-border/20 rounded-xl p-1">
                      <TabsTrigger
                        value="analyst"
                        className="flex-1 rounded-lg data-[state=active]:bg-analyst/10 data-[state=active]:text-analyst"
                      >
                        <Brain className="mr-1.5 h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Analyst</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="risk"
                        className="flex-1 rounded-lg data-[state=active]:bg-risk/10 data-[state=active]:text-risk"
                      >
                        <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Risk</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="strategist"
                        className="flex-1 rounded-lg data-[state=active]:bg-strategist/10 data-[state=active]:text-strategist"
                      >
                        <Crosshair className="mr-1.5 h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Strategist</span>
                      </TabsTrigger>
                    </TabsList>

                    {msg.responses.map((resp) => (
                      <TabsContent key={resp.persona} value={resp.persona} className="mt-3">
                        <PersonaBubble response={resp} />
                      </TabsContent>
                    ))}

                    {msg.errors?.map((err) => (
                      <TabsContent key={err.persona} value={err.persona} className="mt-3">
                        <PersonaBubble
                          response={{
                            persona: err.persona as "analyst" | "risk" | "strategist",
                            content: "",
                            thinking: "",
                            error: err.error,
                          }}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>

                  {msg.unifiedSignal && (
                    <FinalDecision
                      signal={msg.unifiedSignal}
                      responses={msg.responses || []}
                    />
                  )}
                </motion.div>
              )}
            </div>
          ))}

          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 rounded-xl border border-border/20 bg-muted/5 p-4"
            >
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Querying Neural Cluster...
                </p>
                <p className="text-xs text-muted-foreground">
                  Analyst · Risk Manager · Strategist — {mode.toUpperCase()} mode
                </p>
              </div>
            </motion.div>
          )}

          {lastError && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 rounded-xl border border-sell/20 bg-sell/5 p-4"
            >
              <AlertTriangle className="h-5 w-5 text-sell" />
              <div>
                <p className="text-sm font-medium text-sell">Analysis Failed</p>
                <p className="text-xs text-sell/60">{lastError}</p>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed bottom input */}
      <div className="border-t border-border/15 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex gap-3 rounded-2xl border border-border/30 bg-card/40 p-2 transition-colors focus-within:border-primary/30">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder={placeholderText}
              className="flex-1 bg-transparent px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              disabled={isAnalyzing}
            />
            <Button
              onClick={handleAnalyze}
              disabled={!input.trim() || isAnalyzing}
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl bg-primary/15 text-primary hover:bg-primary/25 border-0"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-center font-mono text-[9px] text-muted-foreground/30">
            DeepSeek-R1 · Multi-Persona Consensus · {mode === "forex" ? "Forex & Metals" : "Futures & Commodities"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TripleBubbleChat;
