import { motion } from "framer-motion";

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
        {signal.action === "BUY"
          ? "🟢 GO — LONG"
          : signal.action === "SELL"
          ? "🔴 NO GO — SHORT"
          : "🟡 HOLD — WAIT"}
      </div>
      <div className="mt-1 font-mono text-sm text-foreground/70">
        Confidence:{" "}
        <span className="font-bold text-foreground">{signal.confidence}%</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{signal.summary}</p>
    </motion.div>
  );
};

export default SignalBadge;
