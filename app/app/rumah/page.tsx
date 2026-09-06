import type { Metadata } from "next";
import RumahView from "../components/RumahView";
import { getAppData } from "@/lib/data/queries";
import { PLAN_DATE_ISO } from "@/lib/data/plan-date";

export const metadata: Metadata = { title: "Rumah Saya · Farad" };

export default async function Page() {
  const { userId, profile } = await getAppData(PLAN_DATE_ISO);
  return <RumahView onboarding={userId !== null && !profile?.onboarded_at} />;
}
