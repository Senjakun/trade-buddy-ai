import { motion } from "framer-motion";
import {
  Brain,
  ShieldAlert,
  Crosshair,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  TrendingUp,
} from "lucide-react";
import type { PersonaResponse } from "@/hooks/useOllamaAnalysis";

interface FinalDecisionProps {
  signal: {
    action: "BUY" | "SELL" | "HOLD";
    confidence: number;
    summary: string;
  };
  responses: PersonaResponse[];
}

const personaVoteConfig = {
  analyst: {
    icon: Brain,
    label: "Analyst",
    colorClass: "text-analyst",
    bgClass: "bg-analyst/10",
    borderClass: "border-analyst/30",
  },
  risk: {
    icon: ShieldAlert,
    label: "Risk Mgr",
    colorClass: "text-risk",
    bgClass: "bg-risk/10",
    borderClass: "border-risk/30",
  },
  strategist: {
    icon: Crosshair,
    label: "Strategist",
    colorClass: "text-strategist",
    bgClass: "bg-strategist/10",
    borderClass: "border-strategist/30",
  },
};

function extractPersonaVote(content: string): {
  lean: "BULLISH" | "BEARISH" | "NEUTRAL";
  confidence: number;
} {
  const upper = content.toUpperCase();

  let lean: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
  if (
    upper.includes("BULLISH") ||
    upper.includes("GO — LONG") ||
    upper.includes("GO —LONG") ||
    upper.includes("GO - LONG") ||
    upper.includes("BUY") ||
    upper.includes("LONG ENTRY")
  ) {
    lean = "BULLISH";
  } else if (
    upper.includes("BEARISH") ||
    upper.includes("NO GO") ||
    upper.includes("SHORT") ||
    upper.includes("SELL")
  ) {
    lean = "BEARISH";
  }

  const confMatch = content.match(/(\d{1,3})%/);
  const confidence = confMatch ? parseInt(confMatch[1]) : 50;

  return { lean, confidence };
}

const leanConfig = {
  BULLISH: {
    icon: ArrowUpRight,
    label: "BULLISH",
    color: "text-buy",
    bg: "bg-buy/10",
  },
  BEARISH: {
    icon: ArrowDownRight,
    label: "BEARISH",
    color: "text-sell",
    bg: "bg-sell/10",
  },
  NEUTRAL: {
    icon: Minus,
    label: "NEUTRAL",
    color: "text-hold",
    bg: "bg-hold/10",
  },
};

const FinalDecision = ({ signal, responses }: FinalDecisionProps) => {
  const isGo = signal.action === "BUY";
  const isSell = signal.action === "SELL";

  const votes = responses.map((r) => ({
    persona: r.persona,
    vote: extractPersonaVote(r.content),
  }));

  const bullishCount = votes.filter((v) => v.vote.lean === "BULLISH").length;
  const bearishCount = votes.filter((v) => v.vote.lean === "BEARISH").length;
  const consensus =
    votes.length > 0
      ? Math.round(
          (Math.max(bullishCount, bearishCount) / votes.length) * 100
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`mx-auto mt-4 max-w-lg rounded-xl border p-5 ${
        isGo
          ? "border-buy/40 bg-buy/5 glow-buy"
          : isSell
          ? "border-sell/40 bg-sell/5 glow-sell"
          : "border-hold/40 bg-hold/5"
      }`}
    >
      {/* Header */}
      <div className="mb-1 flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
        <TrendingUp className="h-3.5 w-3.5" />
        Consensus Decision
      </div>

      {/* Main Signal */}
      <div
        className={`text-center text-2xl font-black font-display ${
          isGo ? "text-buy" : isSell ? "text-sell" : "text-hold"
        }`}
      >
        {signal.action === "BUY"
          ? "🟢 GO — LONG"
          : signal.action === "SELL"
          ? "🔴 NO GO — SHORT"
          : "🟡 HOLD — WAIT"}
      </div>

      <div className="mt-1 text-center font-mono text-sm text-foreground/70">
        Confidence:{" "}
        <span className="font-bold text-foreground">{signal.confidence}%</span>
      </div>

      {/* Persona Votes Breakdown */}
      {votes.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider text-center">
            Individual Votes
          </div>
          <div className="grid grid-cols-3 gap-2">
            {votes.map((v) => {
              const pConfig =
                personaVoteConfig[
                  v.persona as keyof typeof personaVoteConfig
                ] || personaVoteConfig.analyst;
              const lConfig = leanConfig[v.vote.lean];
              const PIcon = pConfig.icon;
              const LIcon = lConfig.icon;

              return (
                <motion.div
                  key={v.persona}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`rounded-lg border ${pConfig.borderClass} ${pConfig.bgClass} p-2.5 text-center`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1.5">
                    <PIcon className={`h-3 w-3 ${pConfig.colorClass}`} />
                    <span
                      className={`font-mono text-[10px] font-semibold ${pConfig.colorClass}`}
                    >
                      {pConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <LIcon className={`h-3.5 w-3.5 ${lConfig.color}`} />
                    <span
                      className={`font-mono text-xs font-bold ${lConfig.color}`}
                    >
                      {lConfig.label}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {v.vote.confidence}%
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Consensus Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1">
              <span>Agreement</span>
              <span>{consensus}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${consensus}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={`h-full rounded-full ${
                  isGo ? "bg-buy" : isSell ? "bg-sell" : "bg-hold"
                }`}
              />
            </div>
          </div>
        </div>
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {signal.summary}
      </p>
    </motion.div>
  );
};

export default FinalDecision;
