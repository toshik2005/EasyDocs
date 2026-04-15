"use client";

import { useEffect } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type ChatDrawerProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  messages: Message[];
  onSendMessage: (message: string) => void;
  suggestedQuestions?: string[];
  onSuggestedQuestionClick?: (question: string) => void;
};

export function ChatDrawer({
  isOpen,
  onOpenChange,
  messages,
  onSendMessage,
  suggestedQuestions = [],
  onSuggestedQuestionClick,
}: ChatDrawerProps) {
  const visibleMessages = messages.slice(-8);

  useEffect(() => {
    if (isOpen) {
      const scrollableDiv = document.getElementById("chat-scroll");
      if (scrollableDiv) {
        scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
      }
    }
  }, [messages, isOpen]);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full p-0 shadow-[0_0_20px_rgba(37,99,235,0.35)]"
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="h-5 w-5" />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-accent-500 text-[10px] font-bold text-white shadow-sm">
              {messages.length}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[70vh]">
        <DrawerHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20 text-brand-500">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DrawerTitle>AI Assistant</DrawerTitle>
              <DrawerDescription>Ask about this document and use suggested prompts.</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div id="chat-scroll" className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {suggestedQuestions.length > 0 ? (
            <div className="rounded-xl border border-border bg-surface-2 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Suggested Questions
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={`${question}-${index}`}
                    type="button"
                    onClick={() => onSuggestedQuestionClick?.(question)}
                    className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-500/20"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.length === 0 ? (
            <div className="flex h-full min-h-28 flex-col items-center justify-center text-center opacity-80">
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

        <DrawerFooter className="border-t border-border">
          <div className="w-full">
            <ChatInput onSend={onSendMessage} />
          </div>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

