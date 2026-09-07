"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { NAV, PILL_SPRING, isActive } from "./nav";

export default function BottomNav({ pathname }: { pathname: string }) {
  const reduce = useReducedMotion();
  const spring = reduce ? { duration: 0 } : PILL_SPRING;

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-app-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${NAV.length}, minmax(0, 1fr))` }}>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="group/tab relative flex h-[72px] flex-col items-center justify-center gap-1 rounded-2xl outline-none transition-transform duration-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-farad-primary/40 active:scale-[0.92] motion-reduce:active:scale-100"
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-pill"
                    transition={spring}
                    aria-hidden
                    className="absolute inset-y-2 inset-x-1.5 rounded-[20px] bg-farad-sage"
                  />
                )}

                <Icon
                  size={23}
                  weight={active ? "fill" : "regular"}
                  className={`relative transition-colors duration-200 ${
                    active ? "text-farad-forest" : "text-app-dim"
                  }`}
                />
                <span
                  className={`relative truncate px-1 text-[11px] leading-3 transition-colors duration-200 ${
                    active ? "font-bold text-farad-forest" : "font-medium text-app-muted"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
