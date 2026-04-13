"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import styles from "./page.module.css";

type UploadResponse = {
  job_id: string;
  doc_id: string;
  status: string;
};

type JobStatus = {
  job_id: string;
  doc_id: string;
  status: string;
};

type ChatSource = {
  chunk_id: string;
  page: number | null;
  text: string;
};

type ChatResponse = {
  answer: string;
  sources: ChatSource[];
  provider_used?: string | null;
  answer_source?: string | null;
};

type DocumentDetails = {
  doc_id: string;
  file_name: string;
  status: string;
  summary: string | null;
  summary_detailed: string | null;
  key_points: string[];
  precomputed_qa: { question: string; answer: string }[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: string };
    return data.detail || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [docId, setDocId] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  
  const [docDetails, setDocDetails] = useState<DocumentDetails | null>(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<ChatSource[]>([]);
  
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [fetchingDoc, setFetchingDoc] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState("");

  const docReady = useMemo(() => jobStatus === "completed", [jobStatus]);

  useEffect(() => {
    if (docReady && docId) {
      fetchDocDetails(docId);
    }
  }, [docReady, docId]);

  const fetchDocDetails = async (id: string) => {
    setFetchingDoc(true);
    try {
      const res = await fetch(`${API_BASE}/docs/${id}`);
      if (!res.ok) throw new Error(await parseError(res));
      const data = (await res.json()) as DocumentDetails;
      setDocDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch document details.");
    } finally {
      setFetchingDoc(false);
    }
  };

  const onUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Select a PDF or DOCX file first.");
      return;
    }

    setError("");
    setAnswer("");
    setSources([]);
    setDocDetails(null);
    setLoadingUpload(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
      if (!res.ok) {
        throw new Error(await parseError(res));
      }
      const data = (await res.json()) as UploadResponse;
      setDocId(data.doc_id);
      setJobId(data.job_id);
      setJobStatus(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoadingUpload(false);
    }
  };

  const checkStatus = async () => {
    if (!jobId) {
      setError("Upload a document first.");
      return;
    }
    setError("");
    setLoadingStatus(true);
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/status`);
      if (!res.ok) {
        throw new Error(await parseError(res));
      }
      const data = (await res.json()) as JobStatus;
      setDocId(data.doc_id);
      setJobStatus(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status fetch failed.");
    } finally {
      setLoadingStatus(false);
    }
  };

  const askQuestion = async (e?: FormEvent, presetQuestion?: string) => {
    if (e) e.preventDefault();
    const q = presetQuestion || question;
    if (!docId || !q.trim()) {
      setError("Document ID and question are required.");
      return;
    }

    if (presetQuestion) {
      setQuestion(presetQuestion);
    }

    setError("");
    setLoadingChat(true);
    setAnswer("");
    setSources([]);
    
    try {
      const res = await fetch(`${API_BASE}/docs/${docId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, top_k: 5 }),
      });
      if (!res.ok) {
        throw new Error(await parseError(res));
      }
      const data = (await res.json()) as ChatResponse;
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed.");
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>EasyDocs ✨</h1>
        <p className={styles.subtitle}>Supercharge your reading with AI-powered document intelligence</p>
      </header>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <section className={styles.glassPanel}>
        <h2 className={styles.panelTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          1. Upload Document
        </h2>
        <form className={styles.fileInputWrapper} onSubmit={onUpload}>
          <input
            type="file"
            className={styles.fileInput}
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button
            type="submit"
            disabled={loadingUpload}
            className={styles.btn}
          >
            {loadingUpload ? "Uploading & Processing..." : "Upload & Process"}
          </button>
        </form>
      </section>

      {(jobId || docId) && (
        <section className={styles.glassPanel}>
          <h2 className={styles.panelTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            2. Processing Status
          </h2>
          <div className={styles.statusRow}>
            <button
              onClick={checkStatus}
              disabled={!jobId || loadingStatus}
              className={styles.btnSecondary}
            >
              {loadingStatus ? "Checking..." : "Refresh Status"}
            </button>
            <span><strong>Job ID:</strong> {jobId || "N/A"}</span>
            <span><strong>Doc ID:</strong> {docId || "N/A"}</span>
            <span className={`${styles.statusBadge} ${styles[jobStatus] || ''}`}>
              {jobStatus || "unknown"}
            </span>
            {fetchingDoc && <span>Loading document intelligence...</span>}
          </div>

          {docDetails && (
            <div className={styles.docInfoGrid}>
              <div className={styles.summarySection}>
                <h3 className={styles.summaryTitle}>Document Summary</h3>
                <p className={styles.summaryText}>{docDetails.summary || "No summary available."}</p>
                
                {docDetails.key_points && docDetails.key_points.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 className={styles.summaryTitle}>Key Insights</h3>
                    <ul className={styles.keyPointsList}>
                      {docDetails.key_points.map((kp, idx) => (
                        <li key={idx} className={styles.keyPoint}>{kp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {docDetails.precomputed_qa && docDetails.precomputed_qa.length > 0 && (
                <div className={styles.summarySection}>
                  <h3 className={styles.summaryTitle}>Suggested Questions</h3>
                  <div className={styles.qaGrid}>
                    {docDetails.precomputed_qa.map((qa, idx) => (
                      <div 
                        key={idx} 
                        className={styles.qaCard}
                        onClick={() => askQuestion(undefined, qa.question || (qa as any).q)}
                      >
                        <div>
                          <strong>Q:</strong> {qa.question || (qa as any).q}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <section className={styles.glassPanel}>
        <h2 className={styles.panelTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          3. Chat with Document
        </h2>
        <form className={styles.chatBox} onSubmit={(e) => askQuestion(e, undefined)}>
          <div className={styles.chatInputWrapper}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about the document. Need a specific detail? Just ask..."
              className={styles.chatInput}
            />
            <button
              type="submit"
              disabled={loadingChat || !docReady}
              className={styles.btn}
              style={{ alignSelf: 'flex-start' }}
            >
              {loadingChat ? "AI is thinking..." : docReady ? "Send Message ✨" : "Document not ready"}
            </button>
          </div>
        </form>

        {answer && (
          <div className={styles.answerBox}>
            <h3 className={styles.answerTitle}>AI Response</h3>
            <p className={styles.answerText}>{answer}</p>

            {sources.length > 0 && (
              <>
                <h4 className={styles.sourcesTitle}>Reference Sources</h4>
                <div className={styles.sourcesList}>
                  {sources.map((source, idx) => (
                    <div key={idx} className={styles.sourceCard}>
                      <span style={{ color: '#818cf8', display: 'block', marginBottom: '0.4rem' }}>
                        Source Chunk: {source.chunk_id.substring(0, 8)}... {source.page ? `(Page ${source.page})` : ""}
                      </span>
                      {source.text}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
