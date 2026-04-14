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
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex max-w-[90%] gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full shadow-sm ${isUser ? "bg-brand-600" : "border border-border bg-surface-2"}`}>
           {isUser ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-brand-500" />}
        </div>
        <div
          className={`px-3 py-2 text-[13px] leading-relaxed shadow-sm ${
            isUser ? "rounded-2xl rounded-tr-sm bg-brand-600 text-white" : "rounded-2xl rounded-tl-sm border border-border bg-surface-2 text-foreground"
          }`}
        >
          {text}
        </div>
      </div>
    </motion.article>
  );
}

