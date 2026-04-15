"use client";

import { motion } from "framer-motion";

type ChatMessageProps = {
  role: "user" | "assistant";
  text: string;
};

export function ChatMessage({ role, text }: ChatMessageProps) {
  const isUser = role === "user";
  return (
    <motion.article 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex max-w-[85%] sm:max-w-[75%] gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className={`px-4 py-2.5 text-[13px] leading-relaxed ${
            isUser 
              ? "rounded-2xl rounded-br-sm bg-foreground text-background" 
              : "rounded-2xl rounded-bl-sm border border-border/50 bg-surface text-foreground"
          }`}
        >
          {text}
        </div>
      </div>
    </motion.article>
  );
}

