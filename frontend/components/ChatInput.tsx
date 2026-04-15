"use client";

import { FormEvent, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

type ChatInputProps = {
  onSend: (value: string) => void;
};

export function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
       textareaRef.current.style.height = "auto";
       textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  return (
    <form onSubmit={handleSubmit} className="relative rounded-2xl border border-border/80 bg-surface shadow-sm transition-all focus-within:border-foreground/30 focus-within:ring-2 focus-within:ring-foreground/10">
      <label htmlFor="chat-input" className="sr-only">
        Message input
      </label>
      <div className="flex items-end gap-2 pr-1.5 pl-3 py-1.5">
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          rows={1}
          className="max-h-24 min-h-[36px] flex-1 resize-none bg-transparent pt-2 pb-1 text-[13px] text-foreground placeholder-muted-foreground outline-none"
        />
        <motion.button
          type="submit"
          disabled={!value.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mb-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background transition-opacity disabled:opacity-40"
        >
          <ArrowUp className="h-4 w-4 stroke-[2.5]" />
        </motion.button>
      </div>
    </form>
  );
}

