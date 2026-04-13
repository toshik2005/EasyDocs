"use client";

import { FormEvent, useState } from "react";

type ChatInputProps = {
  onSend: (value: string) => void;
};

export function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3">
      <label htmlFor="chat-input" className="sr-only">
        Message input
      </label>
      <div className="flex items-end gap-2">
        <textarea
          id="chat-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask about the uploaded file..."
          rows={2}
          className="min-h-10 flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 active:scale-[0.98]"
        >
          Send
        </button>
      </div>
    </form>
  );
}

