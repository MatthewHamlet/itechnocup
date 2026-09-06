"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { CaretLineLeft, Lightning, User } from "@phosphor-icons/react";
import {
  EASE,
  NAV,
  PILL_SPRING,
  RAIL_CLOSED,
  RAIL_OPEN,
  RAIL_SPRING,
  SETTINGS,
  isActive,
  type NavItem,
} from "./nav";
import BottomNav from "./BottomNav";

const RailContext = createContext(true);

export const useRailOpen = () => useContext(RailContext);

function RailLink({
  item,
  open,
  active,
}: {
  item: NavItem;
  open: boolean;
  active: boolean;
}) {
  const reduce = useReducedMotion();
  const Icon = item.icon;

  const label = reduce
    ? { duration: 0 }
    : {
        width: { duration: 0.28, ease: EASE },
        x: { duration: 0.28, ease: EASE },
        opacity: { duration: open ? 0.18 : 0.1, delay: open ? 0.08 : 0 },
      };

  return (
    <li className="relative">
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`group/item relative flex h-12 items-center rounded-[18px] px-3.5 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-farad-primary/40 ${
          active ? "text-farad-forest" : "text-app-muted hover:text-app-ink"
        }`}
      >
        {active && (
          <motion.span
            layoutId="rail-pill"
            transition={reduce ? { duration: 0 } : PILL_SPRING}
            className="absolute inset-0 rounded-[18px] bg-white shadow-[0_1px_2px_rgba(24,32,24,0.05),0_8px_18px_-14px_rgba(24,32,24,0.28)] ring-1 ring-app-line"
          />
        )}
        {!active && (
          <span className="absolute inset-0 rounded-[18px] bg-app-ink/0 transition-colors duration-200 group-hover/item:bg-app-ink/[0.045]" />
        )}
        {active && open && (
          <motion.span
            layoutId="rail-accent"
            transition={reduce ? { duration: 0 } : PILL_SPRING}
            className="absolute -left-3 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-farad-volt"
          />
        )}

        <span className="relative z-10 grid w-8 shrink-0 place-items-center">
          <Icon
            size={23}
            weight={active ? "fill" : "regular"}
            className="transition-transform duration-200 group-hover/item:scale-110 group-active/item:scale-95"
          />
        </span>

        <motion.span
          animate={{ width: open ? "auto" : 0, opacity: open ? 1 : 0, x: open ? 0 : -8 }}
          transition={label}
          className="relative z-10 overflow-hidden whitespace-nowrap"
        >
          <span className="ml-3.5 block text-[16px] font-semibold">{item.label}</span>
        </motion.span>

        {!open && (
          <span
            role="tooltip"
            className="pointer-events-none absolute left-[calc(100%+16px)] top-1/2 z-50 -translate-x-1 -translate-y-1/2 scale-95 whitespace-nowrap rounded-xl bg-app-ink px-3 py-2 text-[13px] font-semibold text-white opacity-0 shadow-lg transition-all duration-150 ease-out group-hover/item:translate-x-0 group-hover/item:scale-100 group-hover/item:opacity-100"
          >
            {item.label}
          </span>
        )}
      </Link>
    </li>
  );
}

function Rail({
  open,
  onToggle,
  pathname,
}: {
  open: boolean;
  onToggle: () => void;
  pathname: string;
}) {
  const reduce = useReducedMotion();
  const size = reduce ? { duration: 0 } : RAIL_SPRING;
  const fade = reduce ? { duration: 0 } : { duration: 0.2, ease: EASE };

  return (
    <div className="relative flex h-full flex-col bg-white">
      <div className="flex h-[76px] shrink-0 items-center px-6">
        <Link
          href="/app"
          aria-label="Beranda Farad"
          className="flex items-center gap-2.5 text-farad-forest"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-farad-forest text-farad-volt">
            <Lightning size={21} weight="fill" />
          </span>
          <motion.span
            animate={{ width: open ? "auto" : 0, opacity: open ? 1 : 0 }}
            transition={fade}
            className="overflow-hidden whitespace-nowrap"
          >
            <span className="text-[21px] font-extrabold tracking-tight">Farad</span>
          </motion.span>
        </Link>
      </div>

      <div className="mx-3 h-px bg-app-line" />

      <div className="px-[26px] pb-2.5 pt-6">
        <motion.p
          animate={{ opacity: open ? 1 : 0 }}
          transition={fade}
          className="text-[11px] font-bold uppercase leading-4 tracking-[0.16em] text-app-dim"
        >
          Menu
        </motion.p>
      </div>

      <nav>
        <ul className="space-y-2 px-3">
          {NAV.map((item) => (
            <RailLink
              key={item.href}
              item={item}
              open={open}
              active={isActive(pathname, item.href)}
            />
          ))}
        </ul>
      </nav>

      <div className="flex-1" />

      <div className="mx-3 h-px bg-app-line" />

      <div className="px-3 pb-1 pt-3.5">
        <div className="group/me relative flex h-12 items-center rounded-[18px] px-3.5">
          <span className="relative z-10 grid w-8 shrink-0 place-items-center">
            <span className="grid size-8 place-items-center rounded-full bg-farad-sage text-farad-forest">
              <User size={18} weight="fill" />
            </span>
          </span>
          <motion.span
            animate={{ width: open ? "auto" : 0, opacity: open ? 1 : 0, x: open ? 0 : -8 }}
            transition={fade}
            className="relative z-10 overflow-hidden whitespace-nowrap"
          >
            <span className="ml-3.5 block">
              <span className="block truncate text-[15px] font-bold leading-5 text-app-ink">
                Isabella
              </span>
              <span className="block truncate text-[12.5px] leading-4 text-app-muted">
                R-1 / 1.300 VA
              </span>
            </span>
          </motion.span>
        </div>
      </div>

      <ul className="space-y-2 px-3 pb-6 pt-2">
        <RailLink
          item={SETTINGS}
          open={open}
          active={isActive(pathname, SETTINGS.href)}
        />
      </ul>

      <motion.button
        onClick={onToggle}
        aria-label={open ? "Ciutkan sidebar" : "Lebarkan sidebar"}
        aria-expanded={open}
        whileHover={reduce ? undefined : { scale: 1.14 }}
        whileTap={reduce ? undefined : { scale: 0.86 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 600, damping: 22 }}
        className="group/toggle absolute -right-4 top-[22px] z-50 hidden size-8 place-items-center rounded-full bg-white text-app-dim shadow-[0_2px_10px_-2px_rgba(24,32,24,0.22)] outline-none ring-1 ring-app-line transition-colors duration-200 hover:bg-farad-forest hover:text-white hover:ring-farad-forest focus-visible:ring-2 focus-visible:ring-farad-primary md:grid"
      >
        <motion.span
          animate={{ rotate: open ? 0 : 180 }}
          transition={size}
          className="grid place-items-center"
        >
          <CaretLineLeft size={16} weight="bold" />
        </motion.span>
      </motion.button>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const size = reduce ? { duration: 0 } : RAIL_SPRING;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <RailContext.Provider value={open}>
      <BottomNav pathname={pathname} />

      <motion.aside
        initial={{ width: open ? RAIL_OPEN : RAIL_CLOSED }}
        animate={{ width: open ? RAIL_OPEN : RAIL_CLOSED }}
        transition={size}
        className="fixed inset-y-0 left-0 z-50 hidden border-r border-app-line md:block"
      >
        <Rail open={open} onToggle={() => setOpen((v) => !v)} pathname={pathname} />
      </motion.aside>

      <div className={`farad-app flex overflow-x-clip bg-app-canvas ${pathname === "/app/planner" ? "h-dvh overflow-y-hidden md:h-auto md:min-h-screen md:overflow-y-visible" : "min-h-screen"}`}>
        <motion.div
          aria-hidden
          initial={{ width: open ? RAIL_OPEN : RAIL_CLOSED }}
          animate={{ width: open ? RAIL_OPEN : RAIL_CLOSED }}
          transition={size}
          className="hidden shrink-0 md:block"
        />
        <main className="min-w-0 flex-1 overflow-x-clip pb-[var(--farad-bottom-nav)]">{children}</main>
      </div>
    </RailContext.Provider>
  );
}
