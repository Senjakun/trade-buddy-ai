import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus, Zap, Clock } from "lucide-react";

interface TradingSignal {
  id: number;
  pair: string;
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
  entry: string;
  stopLoss: string;
  takeProfit: string;
  timeframe: string;
  timestamp: string;
}

const mockSignals: TradingSignal[] = [
  {
    id: 1,
    pair: "SOL/USDT",
    action: "BUY",
    confidence: 84,
    entry: "$168.50",
    stopLoss: "$164.20",
    takeProfit: "$185.00",
    timeframe: "4H",
    timestamp: "2m ago",
  },
  {
    id: 2,
    pair: "BTC/USDT",
    action: "HOLD",
    confidence: 58,
    entry: "—",
    stopLoss: "—",
    takeProfit: "—",
    timeframe: "1D",
    timestamp: "8m ago",
  },
  {
    id: 3,
    pair: "ETH/USDT",
    action: "SELL",
    confidence: 72,
    entry: "$3,890",
    stopLoss: "$3,950",
    takeProfit: "$3,680",
    timeframe: "4H",
    timestamp: "14m ago",
  },
];

const actionConfig = {
  BUY: {
    icon: ArrowUpRight,
    label: "LONG",
    colorClass: "text-buy",
    bgClass: "bg-buy/10",
    borderClass: "border-buy/30",
    glowClass: "glow-buy",
  },
  SELL: {
    icon: ArrowDownRight,
    label: "SHORT",
    colorClass: "text-sell",
    bgClass: "bg-sell/10",
    borderClass: "border-sell/30",
    glowClass: "glow-sell",
  },
  HOLD: {
    icon: Minus,
    label: "WAIT",
    colorClass: "text-hold",
    bgClass: "bg-hold/10",
    borderClass: "border-hold/30",
    glowClass: "",
  },
};

const SignalDisplay = () => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Active Signals</h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-buy/10 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-buy animate-pulse" />
          <span className="font-mono text-[10px] font-medium text-buy">LIVE</span>
        </div>
      </div>

      {mockSignals.map((signal, idx) => {
        const config = actionConfig[signal.action];
        const Icon = config.icon;

        return (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
            className={`void-card rounded-lg p-4 border ${config.borderClass} transition-all hover:border-primary/20`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-foreground">
                  {signal.pair}
                </span>
                <span
                  className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold ${config.bgClass} ${config.colorClass}`}
                >
                  {signal.action} — {config.label}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="font-mono text-[10px]">{signal.timestamp}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Confidence
                </div>
                <div className={`font-mono text-sm font-bold ${config.colorClass}`}>
                  {signal.confidence}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Entry
                </div>
                <div className="font-mono text-sm font-semibold text-foreground">
                  {signal.entry}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Stop Loss
                </div>
                <div className="font-mono text-sm font-semibold text-sell">
                  {signal.stopLoss}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Take Profit
                </div>
                <div className="font-mono text-sm font-semibold text-buy">
                  {signal.takeProfit}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SignalDisplay;
