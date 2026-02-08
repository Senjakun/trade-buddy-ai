import { motion } from "framer-motion";
import { Brain, ArrowUpRight, ArrowDownRight, Minus, Zap } from "lucide-react";

interface Signal {
  id: number;
  asset: string;
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
  reason: string;
  timeAgo: string;
}

const signals: Signal[] = [
  {
    id: 1,
    asset: "BTC/USD",
    action: "BUY",
    confidence: 87,
    reason: "RSI oversold + bullish divergence detected",
    timeAgo: "2m ago",
  },
  {
    id: 2,
    asset: "ETH/USD",
    action: "HOLD",
    confidence: 62,
    reason: "Consolidation pattern, awaiting breakout",
    timeAgo: "5m ago",
  },
  {
    id: 3,
    asset: "NVDA",
    action: "BUY",
    confidence: 91,
    reason: "Strong momentum + earnings beat expected",
    timeAgo: "8m ago",
  },
  {
    id: 4,
    asset: "TSLA",
    action: "SELL",
    confidence: 74,
    reason: "Head & shoulders pattern forming on 4H",
    timeAgo: "12m ago",
  },
  {
    id: 5,
    asset: "SOL/USD",
    action: "BUY",
    confidence: 83,
    reason: "Volume surge + golden cross on daily",
    timeAgo: "15m ago",
  },
];

const actionConfig = {
  BUY: {
    icon: ArrowUpRight,
    bgClass: "bg-success/10",
    textClass: "text-success",
    borderClass: "border-success/30",
  },
  SELL: {
    icon: ArrowDownRight,
    bgClass: "bg-destructive/10",
    textClass: "text-destructive",
    borderClass: "border-destructive/30",
  },
  HOLD: {
    icon: Minus,
    bgClass: "bg-warning/10",
    textClass: "text-warning",
    borderClass: "border-warning/30",
  },
};

const AISignals = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">AI Signals</h3>
            <p className="text-xs text-muted-foreground">Real-time AI analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1">
          <Zap className="h-3 w-3 text-success" />
          <span className="text-xs font-medium text-success">Live</span>
        </div>
      </div>

      <div className="space-y-3">
        {signals.map((signal, index) => {
          const config = actionConfig[signal.action];
          const ActionIcon = config.icon;

          return (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-4 rounded-lg border border-border/50 bg-secondary/30 p-4 transition-colors hover:border-primary/20"
            >
              <div className={`rounded-lg border ${config.borderClass} ${config.bgClass} p-2`}>
                <ActionIcon className={`h-4 w-4 ${config.textClass}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {signal.asset}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${config.bgClass} ${config.textClass}`}>
                    {signal.action}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {signal.reason}
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-semibold text-primary">
                  {signal.confidence}%
                </div>
                <p className="text-[10px] text-muted-foreground">{signal.timeAgo}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AISignals;
