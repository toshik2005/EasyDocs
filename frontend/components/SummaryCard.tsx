"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type SummaryCardProps = {
  title: string;
  content: string;
  isLoading: boolean;
  children?: ReactNode;
};

function extractBulletLines(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-*•]\s+/.test(line))
    .map((line) => line.replace(/^[-*•]\s+/, "").trim())
    .filter((line) => line.length > 0);
}

export function SummaryCard({ title, content, isLoading, children }: SummaryCardProps) {
  const bulletLines = extractBulletLines(content);

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mt-8 w-full overflow-hidden rounded-2xl border border-border/60 bg-surface/50 p-6 sm:p-8 backdrop-blur-lg shadow-sm"
      aria-busy={isLoading}
      aria-live="polite"
    >
      <div className="mb-4 flex items-center gap-2 text-foreground">
        <Sparkles className="h-4 w-4" />
        <h3 className="text-sm font-semibold tracking-wide uppercase">{title}</h3>
      </div>

      <div className="relative">
        {isLoading ? (
          <div className="space-y-3">
            <motion.div 
               animate={{ opacity: [0.3, 0.7, 0.3] }}
               transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
               className="h-3 w-full rounded-md bg-surface-2" 
            />
            <motion.div 
               animate={{ opacity: [0.3, 0.7, 0.3] }}
               transition={{ duration: 1.2, delay: 0.1, repeat: Infinity, ease: "easeInOut" }}
               className="h-3 w-11/12 rounded-md bg-surface-2" 
            />
            <motion.div 
               animate={{ opacity: [0.3, 0.7, 0.3] }}
               transition={{ duration: 1.2, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
               className="h-3 w-4/5 rounded-md bg-surface-2" 
            />
          </div>
        ) : bulletLines.length > 0 ? (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground"
          >
            {bulletLines.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </motion.ul>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
          >
            {content}
          </motion.p>
        )}
      </div>
      {!isLoading && children ? <div className="mt-6">{children}</div> : null}
    </motion.section>
  );
}

