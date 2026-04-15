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
          className="fixed bottom-6 right-6 z-50 h-[3.25rem] w-[3.25rem] rounded-full p-0 shadow-lg shadow-black/5 bg-foreground text-background hover:bg-foreground/90 transition-transform active:scale-95"
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="h-[1.3rem] w-[1.3rem]" />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-[1.125rem] w-[1.125rem] items-center justify-center rounded-full border-2 border-background bg-brand-500 text-[9px] font-bold text-white shadow-sm">
              {messages.length}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh] max-h-[90vh] flex flex-col md:h-[85vh]">
        <DrawerHeader className="border-b border-border/50 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DrawerTitle className="text-sm">AI Assistant</DrawerTitle>
              <DrawerDescription className="text-xs">Ask questions about this document.</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div id="chat-scroll" className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {suggestedQuestions.length > 0 ? (
            <div className="rounded-xl border border-border/50 bg-surface/30 p-3">
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Suggested Questions
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={`${question}-${index}`}
                    type="button"
                    onClick={() => onSuggestedQuestionClick?.(question)}
                    className="rounded-full border border-border/60 bg-surface px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-surface-2"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.length === 0 ? (
            <div className="flex h-full min-h-28 flex-col items-center justify-center text-center opacity-70">
              <MessageSquare className="mb-3 h-8 w-8 text-muted-foreground stroke-1" />
              <p className="text-xs text-muted-foreground">
                No messages yet.
              </p>
            </div>
          ) : (
            visibleMessages.map((message) => (
              <ChatMessage key={message.id} role={message.role} text={message.text} />
            ))
          )}
        </div>

        <DrawerFooter className="border-t border-border/50 bg-background pt-3">
          <div className="w-full">
            <ChatInput onSend={onSendMessage} />
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

