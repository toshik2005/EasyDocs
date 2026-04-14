"use client";

import { useReducer, useState } from "react";
import { motion } from "framer-motion";
import { ChatDrawer, Message } from "@/components/ChatDrawer";
import { Navbar } from "@/components/Navbar";
import { SummaryCard } from "@/components/SummaryCard";
import { UploadBox } from "@/components/UploadBox";

type ChatAction = { type: "add"; payload: Message } | { type: "reset" };

const mockSummary =
  "This document outlines key ideas, major takeaways, and practical action items. It highlights the most relevant points in a concise structure so readers can quickly understand the content and apply it.";

function messageReducer(state: Message[], action: ChatAction): Message[] {
  if (action.type === "add") return [...state, action.payload];
  return [];
}

const nextMessage = (role: "user" | "assistant", text: string): Message => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  text,
});

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [messages, dispatchMessages] = useReducer(messageReducer, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);
    setSummary("");
    dispatchMessages({ type: "reset" });

    window.setTimeout(() => {
      setSummary(mockSummary);
      setIsUploading(false);
      dispatchMessages({
        type: "add",
        payload: nextMessage("assistant", `File "${file.name}" uploaded. Ask me anything about it.`),
      });
      setIsDrawerOpen(true); // Automatically open chat when done
    }, 2000);
  };

  const handleSendMessage = (input: string) => {
    dispatchMessages({ type: "add", payload: nextMessage("user", input) });
    window.setTimeout(() => {
      dispatchMessages({
        type: "add",
        payload: nextMessage(
          "assistant",
          "Thanks for the question. This is a placeholder AI response wired to the current chat UI."
        ),
      });
    }, 800);
  };

  return (
    <div className="relative min-h-screen overflow-hidden selection:bg-brand-500/30 selection:text-white">
      {/* Background ambient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/30 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/20 blur-[120px] pointer-events-none mix-blend-screen" />

      <Navbar />

      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        
        {/* Animated Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.div
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 0.2, duration: 0.5 }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-300 text-sm font-medium mb-6"
          >
             <span className="flex h-2 w-2 rounded-full bg-accent-500 animate-pulse"></span>
             AI-Powered Document Analysis
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight mb-6 leading-tight">
            Understand documents <br className="hidden md:block"/> in seconds.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Drop your PDF or text file below and let our intelligent engine extract, summarize, and answer your questions instantly.
          </p>
        </motion.div>

        <section className="flex flex-col flex-1 justify-center relative">
          
          <UploadBox onFileSelect={handleFileSelect} selectedFile={selectedFile} isUploading={isUploading} />

          {selectedFile ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 mx-auto w-full max-w-2xl rounded-2xl bg-white/5 border border-emerald-500/30 p-4 text-sm text-emerald-200 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]"
            >
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-white">Active Document:</span> {selectedFile.name}
              </div>
            </motion.div>
          ) : null}

          {(selectedFile || isUploading) && (
            <div className="mx-auto w-full max-w-2xl">
              <SummaryCard title="Executive Summary" content={summary || mockSummary} isLoading={isUploading} />
            </div>
          )}
        </section>
      </main>

      <ChatDrawer
        isOpen={isDrawerOpen}
        onToggle={() => setIsDrawerOpen((prev) => !prev)}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
