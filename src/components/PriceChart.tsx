import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { time: "00:00", price: 164.20, ai: 164.50 },
  { time: "02:00", price: 165.80, ai: 165.40 },
  { time: "04:00", price: 163.90, ai: 164.80 },
  { time: "06:00", price: 166.20, ai: 166.00 },
  { time: "08:00", price: 167.50, ai: 167.20 },
  { time: "10:00", price: 166.80, ai: 167.50 },
  { time: "12:00", price: 168.40, ai: 168.10 },
  { time: "14:00", price: 167.20, ai: 168.00 },
  { time: "16:00", price: 169.30, ai: 169.00 },
  { time: "18:00", price: 168.50, ai: 169.20 },
  { time: "20:00", price: 169.80, ai: 169.50 },
  { time: "22:00", price: 168.92, ai: 169.80 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="void-card rounded-lg border border-border/40 p-3">
        <p className="text-[10px] text-muted-foreground font-mono">{label}</p>
        <p className="font-mono text-sm font-semibold text-primary">
          Price: ${payload[0].value.toFixed(2)}
        </p>
        <p className="font-mono text-xs text-analyst">
          AI: ${payload[1].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const PriceChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="void-card rounded-xl p-5"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">SOL/USDT</h3>
          <p className="font-mono text-xl font-bold text-foreground">
            $168.92{" "}
            <span className="text-xs text-buy">+3.47%</span>
          </p>
        </div>
        <div className="flex gap-1">
          {["1H", "4H", "1D", "1W", "1M"].map((tf) => (
            <button
              key={tf}
              className={`rounded-md px-2.5 py-1 font-mono text-[10px] font-medium transition-colors ${
                tf === "4H"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(160, 100%, 40%)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(160, 100%, 40%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0.1} />
              <stop offset="95%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 10%)" />
          <XAxis
            dataKey="time"
            stroke="hsl(0, 0%, 30%)"
            fontSize={10}
            fontFamily="JetBrains Mono"
            tickLine={false}
          />
          <YAxis
            stroke="hsl(0, 0%, 30%)"
            fontSize={10}
            fontFamily="JetBrains Mono"
            tickLine={false}
            domain={["dataMin - 2", "dataMax + 2"]}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="hsl(160, 100%, 40%)"
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
          <Area
            type="monotone"
            dataKey="ai"
            stroke="hsl(200, 80%, 55%)"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            fill="url(#aiGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-3 flex items-center gap-6 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4 rounded bg-primary" />
          <span>Market Price</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4 rounded border-t border-dashed border-analyst" />
          <span>AI Prediction</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PriceChart;
