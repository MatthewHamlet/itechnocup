"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export default function ScrollFade({
  className = "",
  fade = 34,
  children,
}: {
  className?: string;
  fade?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ top: 0, bottom: 0 });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rest = el.scrollHeight - el.clientHeight - el.scrollTop;
    setEdges((prev) => {
      const top = Math.round(Math.min(fade, Math.max(0, el.scrollTop)));
      const bottom = Math.round(Math.min(fade, Math.max(0, rest)));
      return prev.top === top && prev.bottom === bottom ? prev : { top, bottom };
    });
  }, [fade]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [measure]);

  const mask =
    edges.top || edges.bottom
      ? `linear-gradient(to bottom, transparent 0, #000 ${edges.top}px, #000 calc(100% - ${edges.bottom}px), transparent 100%)`
      : undefined;

  return (
    <div
      ref={ref}
      onScroll={measure}
      className={className}
      style={mask ? { WebkitMaskImage: mask, maskImage: mask } : undefined}
    >
      {children}
    </div>
  );
}
