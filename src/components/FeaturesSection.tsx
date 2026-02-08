import { motion } from "framer-motion";
import { Brain, BarChart3, Shield, Zap, Target, Globe } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Neural Network Analysis",
    description: "Deep learning models trained on 10+ years of market data to identify patterns invisible to human traders.",
  },
  {
    icon: Zap,
    title: "Real-time Signals",
    description: "Get instant buy, sell, and hold signals with confidence scores updated every second.",
  },
  {
    icon: BarChart3,
    title: "Advanced Charts",
    description: "Professional-grade charting with AI overlay predictions and technical indicator analysis.",
  },
  {
    icon: Target,
    title: "Smart Risk Management",
    description: "Automated stop-loss and take-profit suggestions optimized by reinforcement learning.",
  },
  {
    icon: Shield,
    title: "Secure & Encrypted",
    description: "Bank-grade encryption with 2FA and cold storage integration for your assets.",
  },
  {
    icon: Globe,
    title: "Multi-Market Coverage",
    description: "Crypto, stocks, forex, and commodities — all analyzed by our unified AI engine.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Powered by <span className="text-gradient-primary">Advanced AI</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Our proprietary algorithms process millions of data points per second to give you an edge in every market.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card group rounded-xl p-6 transition-all duration-300 hover:border-primary/30"
            >
              <div className="rounded-lg bg-primary/10 p-3 w-fit transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
