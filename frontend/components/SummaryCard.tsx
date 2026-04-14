"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type SummaryCardProps = {
  title: string;
  content: string;
  isLoading: boolean;
};

export function SummaryCard({ title, content, isLoading }: SummaryCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8 rounded-3xl glass-panel p-8 shadow-xl relative overflow-hidden"
      aria-busy={isLoading}
      aria-live="polite"
    >
      <div className="absolute top-0 right-0 p-8 w-full h-full pointer-events-none overflow-hidden opacity-30">
         <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent-500 rounded-full blur-[100px]" />
      </div>

      <div className="relative mb-6 flex items-center gap-3">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/10 text-brand-400">
           <Sparkles className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
      </div>

      <div className="relative">
        {isLoading ? (
          <div className="space-y-4">
            <motion.div 
               animate={{ opacity: [0.3, 0.7, 0.3] }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
               className="h-4 w-full rounded-md bg-white/10" 
            />
            <motion.div 
               animate={{ opacity: [0.3, 0.7, 0.3] }}
               transition={{ duration: 1.5, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
               className="h-4 w-11/12 rounded-md bg-white/10" 
            />
            <motion.div 
               animate={{ opacity: [0.3, 0.7, 0.3] }}
               transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
               className="h-4 w-4/5 rounded-md bg-white/10" 
            />
          </div>
        ) : (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="leading-relaxed text-slate-300 text-lg"
          >
            {content}
          </motion.p>
        )}
      </div>
    </motion.section>
  );
}

