import type { Metadata } from "next";
import RumahView from "../components/RumahView";
import { getAppData } from "@/lib/data/queries";
import { planDateISO } from "@/lib/data/plan-date";

export const metadata: Metadata = { title: "Rumah Saya" };

export default async function Page() {
  const { userId, profile } = await getAppData(planDateISO());
  return <RumahView onboarding={userId !== null && !profile?.onboarded_at} />;
}
