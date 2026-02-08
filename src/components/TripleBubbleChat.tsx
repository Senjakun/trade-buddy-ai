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
import PersonaBubble from "@/components/chat/PersonaBubble";
import FinalDecision from "@/components/chat/FinalDecision";

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

    const result = await analyze(query);

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
                analysis from your Ollama AI nodes.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["SOL/USDT", "BTC/USDT", "ETH/USDT"].map((pair) => (
                  <button
                    key={pair}
                    onClick={() =>
                      setInput(`Analyze ${pair} for a swing trade entry`)
                    }
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
                {msg.degraded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 rounded-lg border border-hold/30 bg-hold/5 px-3 py-2"
                  >
                    <AlertTriangle className="h-4 w-4 text-hold" />
                    <span className="font-mono text-xs text-hold">
                      DEGRADED MODE — Some nodes failed to respond
                    </span>
                  </motion.div>
                )}

                <Tabs
                  defaultValue={msg.responses[0]?.persona || "analyst"}
                  className="w-full"
                >
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

                  {/* Show successful responses */}
                  {msg.responses.map((resp) => (
                    <TabsContent key={resp.persona} value={resp.persona}>
                      <PersonaBubble response={resp} />
                    </TabsContent>
                  ))}

                  {/* Show error tabs for failed nodes */}
                  {msg.errors?.map((err) => (
                    <TabsContent key={err.persona} value={err.persona}>
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
                Fetching analysis from Analyst, Risk Manager, and Strategist via
                Ollama
              </p>
            </div>
          </motion.div>
        )}

        {lastError && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 rounded-lg border border-sell/30 bg-sell/5 p-4"
          >
            <AlertTriangle className="h-5 w-5 text-sell" />
            <div>
              <p className="text-sm font-medium text-sell">Analysis Failed</p>
              <p className="text-xs text-sell/70">{lastError}</p>
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
