"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { SummaryCard } from "@/components/SummaryCard";
import { UploadBox } from "@/components/UploadBox";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:5000";
const API_BASE = `${BACKEND_URL}/api/v1`;
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 20;

type UploadResponse = {
  job_id: string;
  doc_id: string;
  status: string;
};

type JobStatusResponse = {
  status: string;
};

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") return data.detail;
  } catch {
    // Ignore parsing errors and fall back to status text.
  }
  return response.statusText || "Request failed";
}

export default function Home() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
    });
    if (!uploadResponse.ok) {
      throw new Error(await readErrorDetail(uploadResponse));
    }
    const upload = (await uploadResponse.json()) as UploadResponse;

    let currentStatus = upload.status;
    let attempts = 0;
    while (attempts < MAX_POLL_ATTEMPTS && currentStatus !== "completed" && currentStatus !== "failed") {
      attempts += 1;
      await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
      const statusResponse = await fetch(`${API_BASE}/jobs/${upload.job_id}/status`);
      if (!statusResponse.ok) {
        throw new Error(await readErrorDetail(statusResponse));
      }
      const statusPayload = (await statusResponse.json()) as JobStatusResponse;
      currentStatus = statusPayload.status;
    }

    if (currentStatus !== "completed") {
      throw new Error(`Processing did not complete (status: ${currentStatus}).`);
    }
    router.push(`/chat/${encodeURIComponent(upload.doc_id)}?name=${encodeURIComponent(file.name)}`);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);
    setSummary("");
    setErrorMessage("");
    void handleFileUpload(file)
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Upload failed";
        setErrorMessage(message);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  return (
    <div className="relative min-h-screen overflow-hidden selection:bg-brand-500/30 selection:text-white bg-background text-foreground">
      {/* Background ambient orbs */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] pointer-events-none rounded-full bg-brand-500/15 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] pointer-events-none rounded-full bg-accent-500/12 blur-[120px]" />

      <Navbar />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        
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
             className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm font-medium text-brand-500 shadow-sm"
          >
             <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
             AI-Powered Document Analysis
          </motion.div>
          <h1 className="mb-4 whitespace-nowrap text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Understand documents in seconds.
          </h1>
          <p className="mx-auto whitespace-nowrap text-sm text-muted-foreground sm:text-base">
            Drop your PDF or DOCX file below and let our intelligent engine extract, summarize, and answer your questions instantly.
          </p>
        </motion.div>

        <section className="flex flex-col flex-1 justify-center relative">
          
          <UploadBox onFileSelect={handleFileSelect} selectedFile={selectedFile} isUploading={isUploading} />

          {(selectedFile || isUploading || errorMessage) && (
            <div className="mx-auto w-full max-w-2xl">
              <SummaryCard
                title="Upload Status"
                content={
                  errorMessage
                    ? errorMessage
                    : isUploading
                    ? "We are extracting and indexing your document. You will be redirected to chat when ready."
                    : summary || "Select a document to get started."
                }
                isLoading={isUploading}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
