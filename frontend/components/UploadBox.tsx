"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

type UploadBoxProps = {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isUploading: boolean;
};

const ACCEPTED_TYPES = ".pdf,.txt,application/pdf,text/plain";

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
    <section className="mx-auto w-full max-w-2xl">
      <div
        role="button"
        tabIndex={0}
        aria-label="Drag and drop upload area"
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
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
        className={`group rounded-2xl border-2 border-dashed bg-white p-8 text-center shadow-sm transition-all duration-300 ${
          isDragging
            ? "border-indigo-500 bg-indigo-50/70 shadow-indigo-100"
            : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={onInputChange}
          className="hidden"
          aria-label="Upload PDF or text file"
        />

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-indigo-100 group-hover:text-indigo-700">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 16V5m0 0-4 4m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16.5v1a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 17.5v-1" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-slate-900">Drop your file here</h2>
        <p className="mt-2 text-sm text-slate-500">Supports PDF and TXT files</p>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            inputRef.current?.click();
          }}
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 active:scale-[0.98]"
        >
          Choose File
        </button>

        <p className="mt-4 min-h-5 text-sm text-slate-600" aria-live="polite">
          {isUploading
            ? "Uploading and generating summary..."
            : selectedFile
              ? `Selected: ${selectedFile.name}`
              : "No file selected yet"}
        </p>
      </div>
    </section>
  );
}

