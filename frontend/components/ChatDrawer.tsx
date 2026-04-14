"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
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
  // To handle scrolling to bottom
  useEffect(() => {
    if (isOpen) {
      const scrollableDiv = document.getElementById("chat-scroll");
      if (scrollableDiv) {
        scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
      }
    }
  }, [messages, isOpen]);

  return (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="chat-drawer"
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-brand-500/20 transition-all hover:shadow-brand-500/40"
      >
        {isOpen ? (
           <>
             <X className="h-5 w-5" />
             Close Chat
           </>
        ) : (
           <>
             <MessageSquare className="h-5 w-5" />
             Chat Assistant
             {messages.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[10px]">{messages.length}</span>}
           </>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            id="chat-drawer"
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            aria-label="AI Chat sidebar"
            className="fixed right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col border-l border-white/10 glass shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.5)]"
          >
             <div className="absolute inset-0 bg-slate-900/40 pointer-events-none mix-blend-overlay" />

            <header className="relative z-10 flex h-20 items-center border-b border-white/10 px-6 bg-white/5 backdrop-blur-md">
               <div className="flex items-center gap-3">
                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
                    <MessageSquare className="h-5 w-5" />
                 </div>
                 <div>
                   <h2 className="text-lg font-bold text-white">AI Assistant</h2>
                   <p className="text-xs text-brand-300">Always ready to help</p>
                 </div>
               </div>
            </header>

            <div id="chat-scroll" className="relative z-10 flex-1 space-y-4 overflow-y-auto p-6 scroll-smooth">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
                   <MessageSquare className="h-12 w-12 text-slate-500 mb-4" />
                   <p className="text-sm text-slate-400">
                     Upload a document and start uncovering insights!
                   </p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage key={message.id} role={message.role} text={message.text} />
                ))
              )}
            </div>

            <div className="relative z-10 bg-white/5 backdrop-blur-md p-4">
               <ChatInput onSend={onSendMessage} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

