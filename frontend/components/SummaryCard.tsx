"use client";

type SummaryCardProps = {
  title: string;
  content: string;
  isLoading: boolean;
};

export function SummaryCard({ title, content, isLoading }: SummaryCardProps) {
  return (
    <section
      className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-busy={isLoading}
      aria-live="polite"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-indigo-500" />
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        </div>
      ) : (
        <p className="leading-7 text-slate-700">{content}</p>
      )}
    </section>
  );
}

