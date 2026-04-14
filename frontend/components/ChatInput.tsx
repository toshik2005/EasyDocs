"use client";

import { FormEvent, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { SendHorizonal } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="relative rounded-2xl border border-border bg-surface-2 p-1 shadow-sm transition-all focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-ring">
      <label htmlFor="chat-input" className="sr-only">
        Message input
      </label>
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the document..."
          rows={1}
          className="max-h-24 min-h-[36px] flex-1 resize-none bg-transparent px-3 py-2 text-[13px] text-foreground placeholder-muted-foreground outline-none"
        />
        <motion.button
          type="submit"
          disabled={!value.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mb-1 mr-1 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm shadow-brand-500/30 transition-opacity disabled:opacity-50"
        >
          <SendHorizonal className="h-4 w-4" />
        </motion.button>
      </div>
    </form>
  );
}

