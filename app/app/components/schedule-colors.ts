import type { Activity } from "./plan-model";

// Shared by the desktop and mobile schedules.
const TINT: Record<string, { bg: string; ink: string }> = {
  masak: { bg: "bg-farad-ambersoft", ink: "text-farad-amber" },
  rice: { bg: "bg-farad-ambersoft", ink: "text-farad-amber" },
  oven: { bg: "bg-farad-ambersoft", ink: "text-farad-amber" },
  setrika: { bg: "bg-farad-sage", ink: "text-farad-forest" },
  mesin: { bg: "bg-farad-sage", ink: "text-farad-forest" },
  cuci: { bg: "bg-farad-sage", ink: "text-farad-forest" },
  vacuum: { bg: "bg-farad-sage", ink: "text-farad-forest" },
  pompa: { bg: "bg-chip-1", ink: "text-chip-2i" },
  water: { bg: "bg-chip-1", ink: "text-chip-2i" },
  ac: { bg: "bg-chip-1", ink: "text-chip-2i" },
};
const FALLBACK_TINT = { bg: "bg-farad-sandsoft", ink: "text-farad-sand" };

export const tintOf = (activity: Activity) =>
  TINT[activity.id.split("-")[0]] ?? FALLBACK_TINT;
