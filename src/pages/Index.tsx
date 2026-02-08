import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarketTicker from "@/components/MarketTicker";
import FeaturesSection from "@/components/FeaturesSection";
import DashboardSection from "@/components/DashboardSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <MarketTicker />
        <FeaturesSection />
        <DashboardSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
