"use client";

import { motion } from "framer-motion";
import { FileText, Home, Settings, User } from "lucide-react";

const navLinks = [
  { name: "Home", icon: Home },
  { name: "Documents", icon: FileText },
  { name: "Settings", icon: Settings },
];

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-4 z-40 mx-auto w-[95%] max-w-7xl rounded-full glass border border-white/10 mt-4 mb-8"
    >
      <nav
        className="flex h-16 w-full items-center justify-between px-6"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            ED
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            EasyDocs
          </span>
        </div>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.name}>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </motion.button>
            </li>
          ))}
        </ul>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open profile menu"
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-4 text-sm font-medium text-slate-300 shadow-sm transition-colors hover:bg-white/10 hover:text-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-accent-400 to-brand-500 text-xs font-bold text-white shadow-inner">
            <User className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">Profile</span>
        </motion.button>
      </nav>
    </motion.header>
  );
}

