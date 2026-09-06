import type { Metadata } from "next";
import AktivitasView from "../components/AktivitasView";
import { getAppData } from "@/lib/data/queries";
import { PLAN_DATE_ISO } from "@/lib/data/plan-date";

export const metadata: Metadata = {
  title: "Aktivitas · Farad",
  description:
    "Catat alat rumah yang mau dipakai malam ini, lalu Farad mengatur gilirannya.",
};

export default async function Page() {
  const { userId, profile } = await getAppData(PLAN_DATE_ISO);
  return <AktivitasView onboarding={userId !== null && !profile?.onboarded_at} />;
}
