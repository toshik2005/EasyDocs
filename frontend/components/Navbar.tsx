"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Home, Moon, Settings, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Settings", href: "#", icon: Settings },
];

export function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const shouldUseDark = savedTheme ? savedTheme === "dark" : false;
    document.documentElement.dataset.theme = shouldUseDark ? "dark" : "light";
    document.documentElement.classList.toggle("dark", shouldUseDark);
    setIsDark(shouldUseDark);
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("theme", nextDark ? "dark" : "light");
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-4 z-40 mx-auto mb-8 mt-4 w-[88%] max-w-5xl rounded-full border border-border/80 bg-surface/80 shadow-sm backdrop-blur-xl"
    >
      <nav
        className="flex h-16 w-full items-center justify-between px-6"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-md shadow-brand-500/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            ED
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            EasyDocs
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.name}>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={link.href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-surface-2 text-foreground"
                      : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              </motion.div>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleThemeToggle}
            aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
            className={`relative flex h-12 w-[170px] items-center rounded-full border px-1.5 text-sm font-semibold transition-colors ${
              isDark
                ? "border-brand-500/35 bg-slate-800/70 text-slate-100"
                : "border-amber-200 bg-amber-50 text-slate-700"
            }`}
          >
            <span className="z-10 flex w-full items-center justify-between px-3">
              <span className={`flex items-center gap-1 ${!isDark ? "text-amber-600" : "text-slate-400"}`}>
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </span>
              <span className={`flex items-center gap-1 ${isDark ? "text-brand-300" : "text-slate-400"}`}>
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </span>
            </span>
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`absolute top-1.5 h-9 w-[80px] rounded-full shadow-sm ring-1 ${
                isDark ? "left-[84px] bg-slate-700 ring-brand-500/35" : "left-1.5 bg-white ring-amber-200"
              }`}
            />
            <span className="sr-only">{mounted ? `${isDark ? "Dark" : "Light"} mode enabled` : "Toggle theme"}</span>
          </motion.button>
        </div>
      </nav>
    </motion.header>
  );
}

