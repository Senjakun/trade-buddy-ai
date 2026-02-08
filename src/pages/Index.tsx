import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import SOLTicker from "@/components/SOLTicker";
import NeuralNodeCards from "@/components/NeuralNodeCards";
import PriceChart from "@/components/PriceChart";
import TripleBubbleChat from "@/components/TripleBubbleChat";
import Footer from "@/components/Footer";
import { useBranding } from "@/contexts/BrandingContext";

const Index = () => {
  const { branding } = useBranding();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-14">
        {/* SOL/USDT Live Ticker */}
        <SOLTicker />

        {/* Command Center */}
        <section id="dashboard" className="py-6">
          <div className="mx-auto max-w-7xl px-4">
            {/* Header */}
            <div className="mb-5">
              <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
                Intelligence Command Center
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                {branding.tagline}
              </p>
            </div>

            {/* Neural Node Status Cards */}
            <NeuralNodeCards />
          </div>
        </section>

        {/* AI Reasoning — Center Stage */}
        <section id="chat" className="py-4">
          <div className="mx-auto max-w-7xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="void-card rounded-xl overflow-hidden"
              style={{ height: "620px" }}
            >
              <TripleBubbleChat />
            </motion.div>
          </div>
        </section>

        {/* Price Chart + Compact Info */}
        <section id="signals" className="py-4">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <PriceChart />
              </div>
              <div className="lg:col-span-2 void-card rounded-xl p-4">
                <CompactSignalInfo />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

/* ─── Compact signal info — only shows meaningful data ─── */
const CompactSignalInfo = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="rounded-2xl bg-primary/5 border border-primary/10 p-6 max-w-xs">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </motion.div>
        </div>
        <h3 className="font-display text-sm font-semibold text-foreground">
          Awaiting Analysis
        </h3>
        <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
          Submit a trading query above to activate the consensus engine. Signals will appear here after all AI personas have voted.
        </p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-buy/40" />
            <span className="font-mono text-[9px] text-buy/60">BULLISH</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sell/40" />
            <span className="font-mono text-[9px] text-sell/60">BEARISH</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-hold/40" />
            <span className="font-mono text-[9px] text-hold/60">NEUTRAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
