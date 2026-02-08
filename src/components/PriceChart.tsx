import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { time: "00:00", price: 67200, ai: 67100 },
  { time: "02:00", price: 67450, ai: 67500 },
  { time: "04:00", price: 67100, ai: 67300 },
  { time: "06:00", price: 67800, ai: 67750 },
  { time: "08:00", price: 68200, ai: 68000 },
  { time: "10:00", price: 67900, ai: 68100 },
  { time: "12:00", price: 68500, ai: 68400 },
  { time: "14:00", price: 68100, ai: 68300 },
  { time: "16:00", price: 68800, ai: 68700 },
  { time: "18:00", price: 68400, ai: 68600 },
  { time: "20:00", price: 68900, ai: 68850 },
  { time: "22:00", price: 67842, ai: 68100 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg border border-border p-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-mono text-sm font-semibold text-primary">
          Price: ${payload[0].value.toLocaleString()}
        </p>
        <p className="font-mono text-sm text-accent">
          AI: ${payload[1].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const PriceChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">BTC/USD</h3>
          <p className="font-mono text-2xl font-bold text-foreground">
            $67,842.30{" "}
            <span className="text-sm text-success">+2.34%</span>
          </p>
        </div>
        <div className="flex gap-2">
          {["1H", "4H", "1D", "1W", "1M"].map((tf) => (
            <button
              key={tf}
              className={`rounded-md px-3 py-1 font-mono text-xs font-medium transition-colors ${
                tf === "1D"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(200, 80%, 60%)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(200, 80%, 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 14%)" />
          <XAxis
            dataKey="time"
            stroke="hsl(215, 12%, 50%)"
            fontSize={11}
            fontFamily="JetBrains Mono"
            tickLine={false}
          />
          <YAxis
            stroke="hsl(215, 12%, 50%)"
            fontSize={11}
            fontFamily="JetBrains Mono"
            tickLine={false}
            domain={["dataMin - 200", "dataMax + 200"]}
            tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="hsl(175, 80%, 50%)"
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
          <Area
            type="monotone"
            dataKey="ai"
            stroke="hsl(200, 80%, 60%)"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            fill="url(#aiGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4 rounded bg-primary" />
          <span>Market Price</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4 rounded border-t border-dashed border-accent" />
          <span>AI Prediction</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PriceChart;
