"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Generator" },
  { href: "/history", label: "History" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border-default bg-bg-primary/90 backdrop-blur-xl">
      <div className="max-w-[1280px] mx-auto h-full px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <span className="text-base font-bold text-text-primary tracking-tight">
            Content<span className="text-accent">Forge</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-accent bg-accent/8"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-surface2"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
