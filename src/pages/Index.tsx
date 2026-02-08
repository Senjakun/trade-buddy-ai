import Navbar from "@/components/Navbar";
import SOLTicker from "@/components/SOLTicker";
import NeuralStatusBar from "@/components/NeuralStatusBar";
import TripleBubbleChat from "@/components/TripleBubbleChat";
import Footer from "@/components/Footer";
import { useBranding } from "@/contexts/BrandingContext";

const Index = () => {
  const { branding } = useBranding();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-14 flex flex-col">
        {/* SOL/USDT Live Ticker */}
        <SOLTicker />

        {/* Neural Node Status — sleek horizontal bar */}
        <NeuralStatusBar />

        {/* AI Analysis — Full Width, Center Stage */}
        <section id="chat" className="flex-1 flex flex-col py-4">
          <div className="mx-auto w-full max-w-7xl px-4 flex-1 flex flex-col">
            <div className="mb-3">
              <h1 className="font-display text-lg font-bold text-foreground tracking-tight">
                AI Intelligence Center
              </h1>
              <p className="mt-0.5 text-[11px] text-muted-foreground font-mono">
                {branding.tagline}
              </p>
            </div>

            <div className="void-card rounded-xl overflow-hidden flex-1" style={{ minHeight: "600px" }}>
              <TripleBubbleChat />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
