import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const SOLTicker = () => {
  const [price, setPrice] = useState(168.92);
  const [change, setChange] = useState(3.47);
  const [high, setHigh] = useState(172.40);
  const [low, setLow] = useState(163.10);
  const [volume, setVolume] = useState("1.2B");
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice((prev) => {
        const delta = (Math.random() - 0.48) * 0.8;
        const next = +(prev + delta).toFixed(2);
        setFlash(delta > 0 ? "up" : "down");
        setTimeout(() => setFlash(null), 300);
        return next;
      });
      setChange((prev) => +(prev + (Math.random() - 0.48) * 0.1).toFixed(2));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const isPositive = change >= 0;

  return (
    <div className="border-b border-border/30 bg-card/20 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        {/* Main pair */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-foreground">S</span>
            </div>
            <span className="font-mono text-sm font-bold text-foreground">
              SOL/USDT
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-lg font-black transition-colors duration-300 ${
                flash === "up"
                  ? "text-buy"
                  : flash === "down"
                  ? "text-sell"
                  : "text-foreground"
              }`}
            >
              ${price.toFixed(2)}
            </span>
            <span
              className={`flex items-center gap-0.5 rounded-sm px-1.5 py-0.5 font-mono text-xs font-semibold ${
                isPositive ? "bg-buy/10 text-buy" : "bg-sell/10 text-sell"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden items-center gap-6 sm:flex">
          {[
            { label: "24h High", value: `$${high.toFixed(2)}`, color: "text-buy" },
            { label: "24h Low", value: `$${low.toFixed(2)}`, color: "text-sell" },
            { label: "Volume", value: `$${volume}`, color: "text-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </div>
              <div className={`font-mono text-xs font-semibold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SOLTicker;
