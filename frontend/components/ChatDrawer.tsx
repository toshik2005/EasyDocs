"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageSquare, Minimize2, Sparkles } from "lucide-react";
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const visibleMessages = messages.slice(-4);

  useEffect(() => {
    if (isOpen && !isCollapsed) {
      const scrollableDiv = document.getElementById("chat-scroll");
      if (scrollableDiv) {
        scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
      }
    }
  }, [messages, isOpen, isCollapsed]);

  useEffect(() => {
    if (!isOpen) {
      setIsCollapsed(false);
    }
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-shadow hover:shadow-[0_0_28px_rgba(37,99,235,0.5)]"
            aria-label="Open AI Assistant"
          >
            <MessageSquare className="h-5 w-5" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-accent-500 text-[10px] font-bold text-white shadow-sm">
                {messages.length}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed bottom-6 right-6 z-50 flex max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl transition-[width,height] duration-300 ${
              isCollapsed ? "h-[180px] w-[58px]" : "h-[450px] w-[280px] sm:w-[300px]"
            }`}
          >
            {!isCollapsed ? (
              <header className="relative z-10 flex h-14 items-center justify-between border-b border-border bg-surface px-3 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20 text-brand-500">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                    aria-label="Collapse assistant panel"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onToggle}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                    aria-label="Close chat"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </button>
                </div>
              </header>
            ) : null}

            {isCollapsed ? (
              <div className="flex flex-1 flex-col items-center justify-between bg-surface p-2">
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 text-brand-500 transition-colors hover:bg-brand-500/25"
                  aria-label="Expand assistant panel"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <MessageSquare className="h-5 w-5 text-muted-foreground" />

                {messages.length > 0 ? (
                  <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {messages.length}
                  </span>
                ) : null}
              </div>
            ) : (
              <div id="chat-scroll" className="relative z-10 flex-1 space-y-3 overflow-y-auto bg-surface p-3 scroll-smooth">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center opacity-80">
                   <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground" />
                   <p className="text-xs text-muted-foreground">
                     Upload a document and start uncovering insights!
                   </p>
                </div>
              ) : (
                visibleMessages.map((message) => (
                  <ChatMessage key={message.id} role={message.role} text={message.text} />
                ))
              )}
              </div>
            )}

            {!isCollapsed ? (
              <div className="relative z-10 border-t border-border bg-surface p-3">
                <ChatInput onSend={onSendMessage} />
              </div>
            ) : null}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

