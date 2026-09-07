import type { Metadata } from "next";
import AktivitasView from "../components/AktivitasView";
import { getAppData } from "@/lib/data/queries";
import { planDateISO } from "@/lib/data/plan-date";

export const metadata: Metadata = {
  title: "Aktivitas",
  description:
    "Catat alat rumah yang mau dipakai malam ini, lalu Farad mengatur gilirannya.",
};

export default async function Page() {
  const { userId, profile } = await getAppData(planDateISO());
  return <AktivitasView onboarding={userId !== null && !profile?.onboarded_at} />;
}
