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
    model: string;
  }
> = {
  analyst: {
    label: "Analyst",
    icon: Brain,
    colorClass: "text-analyst",
    bgClass: "bg-analyst/10",
    model: "DeepSeek-R1",
  },
  risk: {
    label: "Risk Manager",
    icon: ShieldAlert,
    colorClass: "text-risk",
    bgClass: "bg-risk/10",
    model: "Llama 3",
  },
  strategist: {
    label: "Strategist",
    icon: Crosshair,
    colorClass: "text-strategist",
    bgClass: "bg-strategist/10",
    model: "Mistral",
  },
};

const PersonaBubble = ({
  response,
}: {
  response: PersonaResponse;
}) => {
  const config = personaConfig[response.persona] || personaConfig.analyst;
  const Icon = config.icon;

  if (response.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="void-card rounded-lg p-4 border border-sell/20"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className={`rounded-md ${config.bgClass} p-1.5`}>
            <Icon className={`h-4 w-4 ${config.colorClass}`} />
          </div>
          <span className={`text-sm font-semibold ${config.colorClass}`}>
            {config.label}
          </span>
          <span className="ml-auto rounded-full bg-sell/10 px-2 py-0.5 font-mono text-[10px] text-sell">
            ERROR
          </span>
        </div>
        <p className="font-mono text-xs text-sell/80">{response.error}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`void-card rounded-lg p-4 persona-${response.persona}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className={`rounded-md ${config.bgClass} p-1.5`}>
          <Icon className={`h-4 w-4 ${config.colorClass}`} />
        </div>
        <div>
          <span className={`text-sm font-semibold ${config.colorClass}`}>
            {config.label}
          </span>
          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
            {config.model}
          </span>
        </div>
      </div>

      {response.thinking && (
        <ThinkingSection thinking={response.thinking} persona={response.persona} />
      )}

      <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-foreground/90">
        {response.content.split("\n").map((line, i) => (
          <p
            key={i}
            className={`mb-1 ${line.startsWith("**") ? "font-semibold" : ""}`}
          >
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  );
};

export default PersonaBubble;
