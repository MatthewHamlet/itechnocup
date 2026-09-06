import type { Metadata } from "next";
import RumahView from "../components/RumahView";

export const metadata: Metadata = { title: "Rumah Saya · Farad" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const { onboarding } = await searchParams;
  return <RumahView onboarding={onboarding === "1"} />;
}
