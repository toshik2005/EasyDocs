"use client";

import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";

export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type ChatDrawerProps = {
  isOpen: boolean;
  onToggle: () => void;
  messages: Message[];
  onSendMessage: (message: string) => void;
};

export function ChatDrawer({ isOpen, onToggle, messages, onSendMessage }: ChatDrawerProps) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="chat-drawer"
        className="fixed right-4 top-[5.25rem] z-50 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-slate-700"
      >
        {isOpen ? "Close Chat" : "Open Chat"}
      </button>

      <aside
        id="chat-drawer"
        aria-label="AI Chat sidebar"
        className={`fixed right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex h-16 items-center border-b border-slate-200 px-4">
          <h2 className="text-base font-semibold text-slate-900">AI Assistant</h2>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
              Start chatting once a file is uploaded.
            </p>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} role={message.role} text={message.text} />
            ))
          )}
        </div>

        <ChatInput onSend={onSendMessage} />
      </aside>
    </>
  );
}

