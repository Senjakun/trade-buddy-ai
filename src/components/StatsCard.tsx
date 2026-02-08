import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  delay?: number;
}

const StatsCard = ({ title, value, change, changeType = "neutral", icon: Icon, delay = 0 }: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="void-card rounded-xl p-5 transition-all duration-300 hover:border-primary/20"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="mt-2 font-mono text-xl font-bold text-foreground">{value}</p>
          {change && (
            <p
              className={`mt-1 font-mono text-xs font-medium ${
                changeType === "positive"
                  ? "text-buy"
                  : changeType === "negative"
                  ? "text-sell"
                  : "text-muted-foreground"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
