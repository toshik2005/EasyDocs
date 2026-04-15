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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative mt-8 overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-xl backdrop-blur-md"
      aria-busy={isLoading}
      aria-live="polite"
    >
      <div className="absolute top-0 right-0 p-8 w-full h-full pointer-events-none overflow-hidden opacity-30">
         <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative mb-6 flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/20">
           <Sparkles className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-bold tracking-wide text-foreground">{title}</h3>
      </div>

      <div className="relative">
        {isLoading ? (
          <div className="space-y-4">
            <motion.div 
               animate={{ opacity: [0.2, 0.5, 0.2] }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
               className="h-4 w-full rounded-md bg-surface-2" 
            />
            <motion.div 
               animate={{ opacity: [0.2, 0.5, 0.2] }}
               transition={{ duration: 1.5, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
               className="h-4 w-11/12 rounded-md bg-surface-2" 
            />
            <motion.div 
               animate={{ opacity: [0.2, 0.5, 0.2] }}
               transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
               className="h-4 w-4/5 rounded-md bg-surface-2" 
            />
          </div>
        ) : bulletLines.length > 0 ? (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted-foreground"
          >
            {bulletLines.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </motion.ul>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground"
          >
            {content}
          </motion.p>
        )}
      </div>
      {!isLoading && children ? <div className="relative mt-6">{children}</div> : null}
    </motion.section>
  );
}

