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
    <form onSubmit={handleSubmit} className="relative rounded-2xl glass p-2 backdrop-blur-xl border border-white/10">
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
          className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white placeholder-slate-400 outline-none"
        />
        <motion.button
          type="submit"
          disabled={!value.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white transition-opacity disabled:opacity-50"
        >
          <SendHorizonal className="h-4 w-4" />
        </motion.button>
      </div>
    </form>
  );
}

