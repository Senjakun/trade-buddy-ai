import { motion } from "framer-motion";
import { DollarSign, TrendingUp, PieChart, Activity } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import PriceChart from "@/components/PriceChart";
import AISignals from "@/components/AISignals";

const DashboardSection = () => {
  return (
    <section id="dashboard" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Live <span className="text-gradient-primary">Dashboard</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Your command center for AI-powered trading decisions.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Portfolio Value"
            value="$284,392"
            change="+12.5% this month"
            changeType="positive"
            icon={DollarSign}
            delay={0}
          />
          <StatsCard
            title="Today's P&L"
            value="+$3,847"
            change="+1.37%"
            changeType="positive"
            icon={TrendingUp}
            delay={0.1}
          />
          <StatsCard
            title="Win Rate"
            value="87.3%"
            change="+2.1% vs last week"
            changeType="positive"
            icon={PieChart}
            delay={0.2}
          />
          <StatsCard
            title="Active Trades"
            value="12"
            change="3 pending signals"
            changeType="neutral"
            icon={Activity}
            delay={0.3}
          />
        </div>

        {/* Chart + Signals */}
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <PriceChart />
          </div>
          <div className="lg:col-span-2">
            <AISignals />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;
