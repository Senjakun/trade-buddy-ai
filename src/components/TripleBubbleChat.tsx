import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Brain,
  ShieldAlert,
  Crosshair,
  Loader2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
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

export interface ChatMessage {
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

interface TripleBubbleChatProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onFirstMessage?: (query: string) => void;
}

const TripleBubbleChat = ({ messages, setMessages, onFirstMessage }: TripleBubbleChatProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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

    if (messages.length === 0 && onFirstMessage) {
      onFirstMessage(query);
    }

    // Auto-resize textarea back
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
  };

  const picks = QUICK_PICKS[mode];
  const placeholderText = mode === "forex"
    ? "Ask about any Forex pair or metal... e.g. 'Analyze XAUUSD'"
    : "Ask about any futures contract... e.g. 'Analyze ES futures'";

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-chat">
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
          {/* Empty state */}
          {messages.length === 0 && !isAnalyzing && (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center max-w-md">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  Trade Buddy AI
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  Enter any {mode === "forex" ? "Forex pair or metal" : "futures contract"} to
                  activate 3 AI agents — Analyst, Risk Manager, and Strategist — 
                  for a multi-perspective trading analysis.
                </p>

                {/* Quick picks as cards */}
                <div className="grid grid-cols-2 gap-2">
                  {picks.map((pick) => (
                    <button
                      key={pick.label}
                      onClick={() => {
                        setInput(pick.query);
                        inputRef.current?.focus();
                      }}
                      className="rounded-xl border border-border bg-card/50 px-4 py-3 text-left transition-all hover:border-primary/30 hover:bg-card group"
                    >
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {pick.label}
                      </span>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/60 truncate">
                        {pick.query}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg) => (
            <div key={msg.id}>
              {/* User message */}
              {msg.role === "user" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end mb-6"
                >
                  <div className="max-w-xl rounded-2xl rounded-br-md bg-primary/15 border border-primary/20 px-5 py-3">
                    <p className="text-sm text-foreground leading-relaxed">{msg.query}</p>
                  </div>
                </motion.div>
              )}

              {/* AI response */}
              {msg.role === "ai" && msg.responses && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 mb-6"
                >
                  {msg.degraded && (
                    <div className="flex items-center gap-2 rounded-lg border border-hold/20 bg-hold/5 px-3 py-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-hold" />
                      <span className="text-[11px] text-hold font-medium">
                        Degraded Mode — Some nodes failed to respond
                      </span>
                    </div>
                  )}

                  {/* Render all persona responses inline (no tabs) */}
                  <div className="space-y-3">
                    {msg.responses.map((resp) => (
                      <PersonaBubble key={resp.persona} response={resp} />
                    ))}

                    {msg.errors?.map((err) => (
                      <PersonaBubble
                        key={err.persona}
                        response={{
                          persona: err.persona as "analyst" | "risk" | "strategist",
                          content: "",
                          thinking: "",
                          error: err.error,
                        }}
                      />
                    ))}
                  </div>

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

          {/* Loading state */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3 mb-6"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-md bg-card border border-border px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">Querying Neural Cluster</span>
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Brain className="h-3 w-3 text-analyst" /> Analyst</span>
                  <span className="flex items-center gap-1"><ShieldAlert className="h-3 w-3 text-risk" /> Risk</span>
                  <span className="flex items-center gap-1"><Crosshair className="h-3 w-3 text-strategist" /> Strategist</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error state */}
          {lastError && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3 mb-6"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sell/10">
                <AlertTriangle className="h-4 w-4 text-sell" />
              </div>
              <div className="rounded-2xl rounded-tl-md bg-card border border-sell/20 px-4 py-3">
                <p className="text-sm font-medium text-sell mb-0.5">Analysis Failed</p>
                <p className="text-xs text-sell/70">{lastError}</p>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed bottom input bar */}
      <div className="border-t border-border/40 bg-background">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card px-3 py-2 transition-colors focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholderText}
              rows={1}
              className="flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none leading-relaxed"
              disabled={isAnalyzing}
              style={{ maxHeight: 150 }}
            />
            <button
              onClick={handleAnalyze}
              disabled={!input.trim() || isAnalyzing}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground/40">
            DeepSeek-R1 · Multi-Persona Consensus · {mode === "forex" ? "Forex & Metals" : "Futures & Commodities"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TripleBubbleChat;
