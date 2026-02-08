import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";

const personaColorMap: Record<string, string> = {
  analyst: "text-analyst",
  risk: "text-risk",
  strategist: "text-strategist",
};

const ThinkingSection = ({
  thinking,
  persona,
}: {
  thinking: string;
  persona: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const colorClass = personaColorMap[persona] || "text-primary";

  return (
    <div className="mb-3 rounded-md border border-border/30 bg-muted/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Sparkles className={`h-3 w-3 ${colorClass}`} />
        <span className="font-mono">Thinking Process</span>
        {expanded ? (
          <ChevronUp className="ml-auto h-3 w-3" />
        ) : (
          <ChevronDown className="ml-auto h-3 w-3" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="px-3 pb-3 font-mono text-xs leading-relaxed text-muted-foreground/80 italic">
              {thinking}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThinkingSection;
