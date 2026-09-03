"use client";

import { useEffect, useRef } from "react";
import {
  AirVent,
  BatteryCharging,
  Cable,
  CalendarClock,
  ChartColumn,
  Clock,
  Coffee,
  CookingPot,
  Droplets,
  Fan,
  Gauge,
  Hourglass,
  House,
  Lamp,
  Lightbulb,
  Microwave,
  Plug,
  Plug2,
  PlugZap,
  Power,
  Refrigerator,
  Shirt,
  ShowerHead,
  Sun,
  Thermometer,
  Timer,
  ToggleRight,
  Tv,
  UtilityPole,
  WashingMachine,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: LucideIcon[] = [
  Zap,
  Plug,
  WashingMachine,
  Lightbulb,
  Clock,
  CookingPot,
  Gauge,
  Shirt,
  PlugZap,
  Droplets,
  Timer,
  Refrigerator,
  Power,
  Fan,
  CalendarClock,
  Microwave,
  Sun,
  Cable,
  House,
  Tv,
  BatteryCharging,
  Thermometer,
  Hourglass,
  AirVent,
  Lamp,
  Plug2,
  ShowerHead,
  UtilityPole,
  ChartColumn,
  ToggleRight,
  Coffee,
];

const TONES = [
  "text-farad-primary/30",
  "text-farad-primary/25",
  "text-farad-primary/35",
  "text-farad-forest/20",
  "text-farad-peach/55",
  "text-farad-peach/45",
  "text-farad-terracotta/25",
  "text-farad-amber/25",
];

type Ornament = {
  icon: LucideIcon;
  x: number;
  y: number;
  size: number;
  rotate: number;
  delay: number;
  from: number;
  tone: string;
};

const COLUMNS = 14;
const ROWS = 12;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ornaments: Ornament[] = (() => {
  const random = mulberry32(20260903);
  const list: Ornament[] = [];

  for (let row = 0; row < ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      const stagger = row % 2 === 0 ? 0 : 0.5;
      const x = ((column + stagger + (random() - 0.5) * 0.55) / COLUMNS) * 100;
      const y = ((row + 0.5 + (random() - 0.5) * 0.55) / ROWS) * 100;

      list.push({
        icon: ICONS[Math.floor(random() * ICONS.length)],
        x: Math.min(Math.max(x, 0), 100),
        y: Math.min(Math.max(y, 0), 100),
        size: Math.round(17 + random() * 15),
        rotate: Math.round((random() * 2 - 1) * 30),
        delay: Math.round(random() * 620),
        from: -Math.round(18 + random() * 40),
        tone: TONES[Math.floor(random() * TONES.length)],
      });
    }
  }

  return list;
})();

const TEXT_HOLE =
  "radial-gradient(46% 42% at 25% 45%, transparent 0%, #000 78%)";

export default function FallingIcons({ hole = TEXT_HOLE }: { hole?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.dataset.visible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = "true";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -120px 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden select-none lg:block"
      style={{ maskImage: hole, WebkitMaskImage: hole }}
    >
      {ornaments.map((o, index) => (
        <span
          key={index}
          className="absolute"
          style={{
            top: `${o.y}%`,
            left: `${o.x}%`,
            transform: `translate(-${o.x}%, -50%)`,
          }}
        >
          <span
            className={`farad-drift block ${o.tone}`}
            style={{
              ["--reveal-delay" as string]: `${o.delay}ms`,
              ["--drift-from" as string]: `${o.from}px`,
            }}
          >
            <o.icon
              size={o.size}
              strokeWidth={1.75}
              style={{ transform: `rotate(${o.rotate}deg)` }}
            />
          </span>
        </span>
      ))}
    </div>
  );
}
