"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Loader2, MessageSquare, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:5000";
const API_BASE = `${BACKEND_URL}/api/v1`;

type DocumentItem = {
  doc_id: string;
  file_name: string;
  status: string;
  summary?: string | null;
  created_at?: string;
  updated_at?: string;
};

function formatDate(value?: string): string {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString();
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDocuments = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/docs`);
      if (!response.ok) {
        throw new Error("Failed to load documents.");
      }
      const payload = (await response.json()) as DocumentItem[];
      setDocuments(payload);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load documents.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
  }, []);

  const completedCount = useMemo(
    () => documents.filter((doc) => doc.status === "completed").length,
    [documents]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Navbar />
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-border bg-surface p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {documents.length} total documents, {completedCount} ready for chat.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                void loadDocuments();
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </motion.section>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-border bg-surface p-10 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading document history...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            <Link
              href="/"
              className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Upload your first document
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <motion.article
                key={doc.doc_id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-foreground">{doc.file_name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Uploaded: {formatDate(doc.created_at)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Last update: {formatDate(doc.updated_at)}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      doc.status === "completed"
                        ? "bg-emerald-500/15 text-emerald-500"
                        : doc.status === "failed"
                        ? "bg-red-500/15 text-red-500"
                        : "bg-amber-500/15 text-amber-500"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {doc.summary?.trim() || "No summary generated yet."}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/chat/${encodeURIComponent(doc.doc_id)}?name=${encodeURIComponent(doc.file_name)}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View
                  </Link>
                  <Link
                    href={`/chat/${encodeURIComponent(doc.doc_id)}?name=${encodeURIComponent(doc.file_name)}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Chat
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
