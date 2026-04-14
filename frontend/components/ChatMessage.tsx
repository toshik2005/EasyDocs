"use client";

import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";

type ChatMessageProps = {
  role: "user" | "assistant";
  text: string;
};

export function ChatMessage({ role, text }: ChatMessageProps) {
  const isUser = role === "user";
  return (
    <motion.article 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isUser ? "bg-brand-500" : "bg-white/10"}`}>
           {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-brand-400" />}
        </div>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser ? "bg-brand-600 text-white rounded-tr-sm" : "glass-panel text-slate-200 border-white/5 rounded-tl-sm"
          }`}
        >
          {text}
        </div>
      </div>
    </motion.article>
  );
}

