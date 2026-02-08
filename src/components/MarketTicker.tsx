import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerItem {
  symbol: string;
  price: string;
  change: number;
}

const tickerData: TickerItem[] = [
  { symbol: "BTC/USD", price: "67,842.30", change: 2.34 },
  { symbol: "ETH/USD", price: "3,891.45", change: -0.87 },
  { symbol: "AAPL", price: "189.72", change: 1.12 },
  { symbol: "TSLA", price: "248.50", change: 3.45 },
  { symbol: "NVDA", price: "875.30", change: 4.21 },
  { symbol: "SOL/USD", price: "172.88", change: -1.23 },
  { symbol: "AMZN", price: "185.60", change: 0.95 },
  { symbol: "GOOGL", price: "141.80", change: -0.45 },
  { symbol: "META", price: "505.25", change: 2.10 },
  { symbol: "MSFT", price: "415.30", change: 1.78 },
];

const MarketTicker = () => {
  const doubled = [...tickerData, ...tickerData];

  return (
    <div className="w-full overflow-hidden border-y border-border bg-card/40 backdrop-blur-sm">
      <div className="flex animate-ticker whitespace-nowrap py-3">
        {doubled.map((item, index) => (
          <div
            key={`${item.symbol}-${index}`}
            className="mx-6 flex items-center gap-2"
          >
            <span className="font-mono text-sm font-semibold text-foreground">
              {item.symbol}
            </span>
            <span className="font-mono text-sm text-muted-foreground">
              ${item.price}
            </span>
            <span
              className={`flex items-center gap-0.5 font-mono text-xs font-medium ${
                item.change >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {item.change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {item.change >= 0 ? "+" : ""}
              {item.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
