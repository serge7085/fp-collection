"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileMenu({
  navItems,
}: {
  navItems: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        className="w-9 h-9 flex flex-col items-center justify-center gap-1.5"
      >
        <span
          className={`block w-5 h-px bg-bone transition-transform ${
            open ? "rotate-45 translate-y-[3px]" : ""
          }`}
        />
        <span
          className={`block w-5 h-px bg-bone transition-transform ${
            open ? "-rotate-45 -translate-y-[3px]" : ""
          }`}
        />
      </button>

      {open && (
        <div className="fixed inset-x-0 top-[65px] bottom-0 bg-ink z-30 px-6 py-8 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-3.5 border-b border-bone/5 text-sm uppercase tracking-[0.1em] text-bone/70 hover:text-gold transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
