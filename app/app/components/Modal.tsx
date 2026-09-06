"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRailOpen } from "./AppShell";
import { RAIL_CLOSED, RAIL_OPEN } from "./nav";

/* below sm this is a bottom sheet, above it a centred dialog; only the sheet
   can leave by sliding y:"100%", which is its own height */
function useCompact() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const sync = () => setCompact(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return compact;
}

export default function Modal({
  open,
  onClose,
  label,
  width = "30rem",
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  width?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const compact = useCompact();
  const railOpen = useRailOpen();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  /* One keyed child owns the exit, and it animates a real property. A wrapper
     that animates nothing — or a panel whose exit sits deeper — leaves
     AnimatePresence waiting: the fade finishes but the node is never
     unmounted, which reads as a pause then a teleport. */
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key={`modal-${label}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2, ease: [0.32, 0.72, 0, 1] }}
          style={
            {
              "--rail": `${railOpen ? RAIL_OPEN : RAIL_CLOSED}px`,
              "--modal-w": width,
            } as CSSProperties
          }
          /* the rail is fixed to the left edge, so centring on the viewport
             leaves the panel visibly left of the content it belongs to */
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6 md:pl-[calc(var(--rail)+1.5rem)]"
        >
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="fixed inset-0 bg-app-ink/50 backdrop-blur-[2px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={
              reduce ? false : compact ? { y: "100%" } : { y: 14, scale: 0.98 }
            }
            animate={reduce ? undefined : { y: 0, scale: 1 }}
            transition={
              reduce
                ? { duration: 0 }
                : compact
                  ? { type: "spring", stiffness: 400, damping: 40 }
                  : { duration: 0.24, ease: [0.32, 0.72, 0, 1] }
            }
            className="relative flex max-h-[86dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-farad-ivory px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_44px_-16px_rgba(24,32,24,0.5)] sm:max-h-[82dvh] sm:w-[min(92vw,var(--modal-w))] sm:rounded-[28px] sm:p-7 sm:shadow-[0_32px_80px_-24px_rgba(24,32,24,0.55)]"
          >
            <div className="mb-3 flex shrink-0 justify-center sm:hidden">
              <span aria-hidden className="h-1.5 w-10 rounded-full bg-app-line" />
            </div>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
