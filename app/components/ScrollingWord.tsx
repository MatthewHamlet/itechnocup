"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

type ScrollingWordProps = {
  text: string;
  from?: string;
  to?: string;
  className?: string;
};

export default function ScrollingWord({
  text,
  from = "38%",
  to = "-22%",
  className = "",
}: ScrollingWordProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  const x = useTransform(smooth, [0, 1], [from, to]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.span
        style={reduceMotion ? undefined : { x }}
        className={`absolute left-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[64px] font-extrabold uppercase leading-none tracking-tighter sm:text-[80px] md:text-[160px] lg:text-[200px] ${className}`}
      >
        {text}
      </motion.span>
    </div>
  );
}
