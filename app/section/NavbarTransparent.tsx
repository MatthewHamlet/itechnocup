"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import FaradLogo from "../components/FaradLogo";

const navItems = [
  { label: "Beranda", href: "#top" },
  { label: "Tentang", href: "#problem" },
  { label: "Fitur", href: "#features" },
  { label: "Cara Kerja", href: "#how-it-works" },
];

const sectionIds = navItems.map((item) => item.href.slice(1));

export default function NavbarTransparent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState(sectionIds[0]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let tops: { id: string; top: number }[] = [];

    const measure = () => {
      setIsScrolled(window.scrollY > 24);

      const line = window.scrollY + window.innerHeight * 0.35;
      let current = sectionIds[0];
      for (const t of tops) if (t.top <= line) current = t.id;

      const doc = document.documentElement;
      const scrollable = doc.scrollHeight > window.innerHeight + 1;
      if (
        scrollable &&
        window.innerHeight + window.scrollY >= doc.scrollHeight - 2
      ) {
        current = sectionIds[sectionIds.length - 1];
      }

      setActiveId(current);
    };

    const cachePositions = () => {
      const y = window.scrollY;
      tops = sectionIds.map((id) => {
        const el = document.getElementById(id);
        return {
          id,
          top: el
            ? el.getBoundingClientRect().top + y
            : Number.POSITIVE_INFINITY,
        };
      });
      measure();
    };

    cachePositions();
    window.addEventListener("scroll", measure, { passive: true });

    const observer = new ResizeObserver(cachePositions);
    observer.observe(document.body);

    return () => {
      window.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, []);

  return (
    <header className="relative z-50 h-0">
      <motion.nav
        layout
        transition={{ type: "spring", stiffness: 330, damping: 30, mass: 0.7 }}
        className={`fixed inset-x-4 top-5 mx-auto flex items-center justify-between transition-colors duration-300 sm:inset-x-8 lg:inset-x-12 ${
          isScrolled
            ? "farad-glass h-16 max-w-5xl rounded-full border border-farad-border bg-white/85 px-4 shadow-lg shadow-farad-ink/10 backdrop-blur-2xl sm:px-5"
            : "h-16 max-w-7xl bg-transparent px-0"
        }`}
      >
        <Link
          href="#top"
          aria-label="Beranda Farad"
          className={`z-10 flex h-full shrink-0 items-center transition-colors duration-300 ${
            isScrolled ? "text-farad-forest" : "text-white"
          }`}
        >
          <FaradLogo size={24} />
        </Link>

        <div
          className={`absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full p-1 transition-colors duration-300 lg:flex ${
            isScrolled ? "bg-farad-sage/70" : "bg-farad-ink/30 backdrop-blur-md"
          }`}
        >
          {navItems.map((item) => {
            const isActive = activeId === item.href.slice(1);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "location" : undefined}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  isActive
                    ? "text-farad-forest"
                    : isScrolled
                      ? "text-farad-muted hover:text-farad-forest"
                      : "text-white/85 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="farad-nav-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-sm"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", bounce: 0, duration: 0.4 }
                    }
                  />
                )}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <Link
          href="#cta"
          className={`farad-press z-10 hidden rounded-full px-5 py-2.5 text-sm font-bold transition sm:inline-flex ${
            isScrolled
              ? "bg-farad-forest text-white hover:bg-farad-ink"
              : "bg-white text-farad-ink hover:bg-farad-peach"
          }`}
        >
          Coba Farad
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isMobileMenuOpen}
          className={`farad-press z-10 grid size-11 place-items-center rounded-full border lg:hidden ${
            isScrolled
              ? "border-farad-border bg-white text-farad-forest hover:bg-farad-sage"
              : "border-white/40 bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
          }`}
        >
          {isMobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </motion.nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-x-4 top-24 z-40 mx-auto max-w-7xl rounded-[28px] border border-farad-border bg-white/95 p-4 shadow-xl shadow-farad-ink/10 backdrop-blur-md lg:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeId === item.href.slice(1);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive ? "location" : undefined}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                    isActive
                      ? "bg-farad-sage text-farad-forest"
                      : "text-farad-muted hover:bg-farad-sage/50 hover:text-farad-forest"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden
                      className="size-1.5 rounded-full bg-farad-primary"
                    />
                  )}
                </Link>
              );
            })}

            <Link
              href="#cta"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-2 rounded-full bg-farad-forest px-4 py-3 text-center text-sm font-bold text-white"
            >
              Coba Farad
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
