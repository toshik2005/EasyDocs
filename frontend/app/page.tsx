"use client";

import { useReducer, useState } from "react";
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
    }, 1200);
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
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto flex w-full max-w-4xl flex-col px-4 pb-12 pt-16 sm:px-6 lg:px-8">
        <section className="flex min-h-[58vh] flex-col justify-center">
          <UploadBox onFileSelect={handleFileSelect} selectedFile={selectedFile} isUploading={isUploading} />

          {selectedFile ? (
            <div className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-600 shadow-sm">
              <span className="font-medium text-slate-800">Uploaded file:</span> {selectedFile.name}
            </div>
          ) : null}

          {(selectedFile || isUploading) && (
            <SummaryCard title="Summary" content={summary || mockSummary} isLoading={isUploading} />
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
