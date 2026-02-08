import { motion } from "framer-motion";
import { DollarSign, TrendingUp, PieChart, Activity } from "lucide-react";
import Navbar from "@/components/Navbar";
import SOLTicker from "@/components/SOLTicker";
import StatsCard from "@/components/StatsCard";
import PriceChart from "@/components/PriceChart";
import SignalDisplay from "@/components/SignalDisplay";
import TripleBubbleChat from "@/components/TripleBubbleChat";
import NodeStatus from "@/components/NodeStatus";
import Footer from "@/components/Footer";
import { useBranding } from "@/contexts/BrandingContext";

const Index = () => {
  const { branding } = useBranding();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-14">
        {/* SOL/USDT Ticker */}
        <SOLTicker />

        {/* Dashboard Section */}
        <section id="dashboard" className="py-8">
          <div className="mx-auto max-w-7xl px-4">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Trading Dashboard
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {branding.tagline}
                </p>
              </div>
              <NodeStatus />
            </div>

            {/* Stats Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                delay={0.05}
              />
              <StatsCard
                title="Win Rate"
                value="87.3%"
                change="+2.1% vs last week"
                changeType="positive"
                icon={PieChart}
                delay={0.1}
              />
              <StatsCard
                title="Active Signals"
                value="3"
                change="2 buy · 1 sell"
                changeType="neutral"
                icon={Activity}
                delay={0.15}
              />
            </div>

            {/* Chart + Signals */}
            <div className="mt-6 grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <PriceChart />
              </div>
              <div id="signals" className="lg:col-span-2 void-card rounded-xl p-4">
                <SignalDisplay />
              </div>
            </div>
          </div>
        </section>

        {/* AI Chat Section */}
        <section id="chat" className="py-8">
          <div className="mx-auto max-w-7xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="void-card rounded-xl overflow-hidden"
              style={{ height: "650px" }}
            >
              <TripleBubbleChat />
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
