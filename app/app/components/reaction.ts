import type { Mood } from "./Mascot";
import {
  HOUSEHOLD,
  PLANNING_LIMIT_VA,
  formatVA,
  timeLabel,
  type Activity,
  type Band,
  type Severity,
} from "./plan-model";

export type Reaction = {
  mood: Mood;
  title: string;
  body: string;
};

export function reactionFor({
  severity,
  peak,
  planBands,
  houseBands,
  moves,
  activities,
}: {
  severity: Severity;
  peak: number;
  planBands: Band[];
  houseBands: Band[];
  moves: { id: string; from: number; to: number }[];
  activities: Activity[];
}): Reaction {
  const band = houseBands[0] ?? planBands[0];
  const at = band ? timeLabel(band.start) : "18.00";

  if (severity === "ok") {
    const moved = moves[0];
    if (moved) {
      const activity = activities.find((item) => item.id === moved.id);
      const rest = moves.length - 1;
      return {
        mood: "happy",
        title: "Sudah lebih lega.",
        body: `${activity?.label ?? "Kegiatan"} aku pindahkan ke ${timeLabel(moved.to)}${
          rest > 0 ? `, dan ${rest} kegiatan lain ikut digeser` : ""
        }.`,
      };
    }
    return {
      mood: "happy",
      title: "Malam ini sudah lega.",
      body: `Puncaknya ${formatVA(peak)} VA, masih di bawah batas rencana ${formatVA(
        PLANNING_LIMIT_VA,
      )} VA.`,
    };
  }

  const flexible = activities.filter(
    (activity) =>
      activity.flexibility === "flexible" &&
      band &&
      activity.start < band.end &&
      activity.start + activity.duration > band.start,
  );

  const names =
    flexible.length === 0
      ? null
      : flexible.length === 1
        ? flexible[0].label
        : `${flexible.slice(0, -1).map((a) => a.label).join(", ")} dan ${
            flexible.at(-1)!.label
          }`;

  if (severity === "over-house") {
    return {
      mood: "alert",
      title: names ? `${names} masih fleksibel.` : `Jam ${at} terlalu penuh.`,
      body: names
        ? `Jam ${at} sampai ${formatVA(peak)} VA, di atas ${formatVA(HOUSEHOLD.installedVA)} VA terpasang. Aku bisa memisahkan waktunya.`
        : `Puncaknya ${formatVA(peak)} VA, di atas ${formatVA(HOUSEHOLD.installedVA)} VA yang terpasang.`,
    };
  }

  return {
    mood: "worry",
    title: names ? `${names} masih fleksibel.` : `Jam ${at} agak ramai nih.`,
    body: names
      ? `Aku bisa memisahkan waktunya supaya jam ${at} lebih lega.`
      : `Bebannya ${formatVA(peak - PLANNING_LIMIT_VA)} VA di atas batas rencana.`,
  };
}
