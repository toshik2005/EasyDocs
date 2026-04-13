"use client";

const navLinks = ["Home", "Documents", "Settings"];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm">
            ED
          </div>
          <span className="text-lg font-semibold text-slate-900">EasyDocs</span>
        </div>

        <ul className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <li key={link}>
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {link}
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-label="Open profile menu"
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 pr-3 text-sm text-slate-700 shadow-sm transition hover:border-slate-300"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            U
          </span>
          <span className="hidden sm:inline">Profile</span>
        </button>
      </nav>
    </header>
  );
}

