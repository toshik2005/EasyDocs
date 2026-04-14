"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File as FileIcon, CheckCircle2 } from "lucide-react";

type UploadBoxProps = {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isUploading: boolean;
};

const ACCEPTED_TYPES = ".pdf,.txt,application/pdf,text/plain";

const dashArray = "0 10";

export function UploadBox({ onFileSelect, selectedFile, isUploading }: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    const validType = file.type === "application/pdf" || file.type === "text/plain";
    const validExtension = file.name.endsWith(".pdf") || file.name.endsWith(".txt");
    if (!validType && !validExtension) return;
    onFileSelect(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
  };

  return (
    <section className="mx-auto w-full max-w-2xl relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          role="button"
          tabIndex={0}
          aria-label="Drag and drop upload area"
          onDragOver={(event) => {
            event.preventDefault();
            if (!isDragging) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative group overflow-hidden rounded-3xl border bg-surface p-10 text-center backdrop-blur-md transition-all duration-300 ${
            isDragging
              ? "border-brand-500 bg-brand-500/8 shadow-[0_0_40px_-15px_rgba(59,130,246,0.35)]"
              : "border-border shadow-sm hover:border-brand-500/40 hover:bg-surface"
          }`}
        >
          {/* Animated border using SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl" style={{ strokeDasharray: dashArray }}>
            <rect
              width="100%"
              height="100%"
              rx="24"
              fill="none"
              stroke={isDragging ? "rgba(59, 130, 246, 0.8)" : "rgba(148, 163, 184, 0.35)"}
              strokeWidth="2"
              strokeDasharray="10 10"
              className={isDragging ? "animate-[spin_4s_linear_infinite]" : ""}
            />
          </svg>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={onInputChange}
            className="hidden"
            aria-label="Upload PDF or text file"
          />

          <AnimatePresence mode="wait">
            {!selectedFile ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center relative z-10"
              >
                <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600/20 to-accent-500/20 text-brand-500 shadow-inner ring-1 ring-border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                  <UploadCloud className="h-10 w-10" />
                  {isDragging && (
                    <motion.div
                      layoutId="pulse"
                      className="absolute inset-0 rounded-2xl bg-brand-500/30"
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
                <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">Drop your magic here</h2>
                <p className="text-sm font-medium text-muted-foreground">Supports PDF and TXT files</p>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(event) => {
                    event.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="mt-8 rounded-xl bg-brand-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition-all hover:shadow-brand-500/35"
                >
                  Browse Files
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="loading-or-done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center relative z-10"
              >
                <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-2 text-brand-500 ring-1 ring-border">
                  {isUploading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="relative h-10 w-10"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-full w-full stroke-current stroke-2">
                         <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                         <path d="M12 2v10" strokeLinecap="round" />
                      </svg>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <CheckCircle2 className="h-10 w-10 text-brand-400" />
                    </motion.div>
                  )}
                </div>
                <h2 className="mb-2 max-w-full truncate px-4 text-xl font-bold text-foreground">
                  {selectedFile.name}
                </h2>
                <p className="animate-pulse text-sm font-medium text-brand-500">
                  {isUploading ? "Extracting knowledge..." : "Ready to analyze!"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}

