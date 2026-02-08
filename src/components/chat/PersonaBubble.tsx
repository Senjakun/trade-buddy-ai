import { motion } from "framer-motion";
import { Brain, ShieldAlert, Crosshair } from "lucide-react";
import ThinkingSection from "./ThinkingSection";
import type { PersonaResponse } from "@/hooks/useOllamaAnalysis";

const personaConfig: Record<
  string,
  {
    label: string;
    icon: typeof Brain;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    model: string;
  }
> = {
  analyst: {
    label: "Technical Analyst",
    icon: Brain,
    colorClass: "text-analyst",
    bgClass: "bg-analyst/10",
    borderClass: "border-analyst/20",
    model: "DeepSeek-R1",
  },
  risk: {
    label: "Risk Manager",
    icon: ShieldAlert,
    colorClass: "text-risk",
    bgClass: "bg-risk/10",
    borderClass: "border-risk/20",
    model: "Llama 3",
  },
  strategist: {
    label: "Market Strategist",
    icon: Crosshair,
    colorClass: "text-strategist",
    bgClass: "bg-strategist/10",
    borderClass: "border-strategist/20",
    model: "Mistral",
  },
};

const PersonaBubble = ({ response }: { response: PersonaResponse }) => {
  const config = personaConfig[response.persona] || personaConfig.analyst;
  const Icon = config.icon;

  if (response.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-sell/20 bg-card p-4"
      >
        <div className="mb-2 flex items-center gap-2">
          <div className={`rounded-lg ${config.bgClass} p-1.5`}>
            <Icon className={`h-4 w-4 ${config.colorClass}`} />
          </div>
          <span className={`text-sm font-semibold ${config.colorClass}`}>
            {config.label}
          </span>
          <span className="ml-auto rounded-full bg-sell/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-sell">
            OFFLINE
          </span>
        </div>
        <p className="text-xs text-sell/70">{response.error}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border ${config.borderClass} bg-card p-4`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <div className={`rounded-lg ${config.bgClass} p-1.5`}>
          <Icon className={`h-4 w-4 ${config.colorClass}`} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${config.colorClass}`}>
            {config.label}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
            {config.model}
          </span>
        </div>
      </div>

      {/* Thinking Process (collapsible) */}
      {response.thinking && (
        <ThinkingSection thinking={response.thinking} persona={response.persona} />
      )}

      {/* Content */}
      <div className="text-sm leading-relaxed text-foreground/90 space-y-1.5">
        {response.content.split("\n").map((line, i) => {
          if (!line.trim()) return null;
          return (
            <p
              key={i}
              className={line.startsWith("**") ? "font-semibold text-foreground" : ""}
            >
              {line}
            </p>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PersonaBubble;
