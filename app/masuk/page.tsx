import type { Metadata } from "next";
import MasukView from "./MasukView";

export const metadata: Metadata = {
  title: "Masuk · Farad",
  description: "Masuk ke Farad untuk menyimpan profil listrik rumah dan rencana kegiatanmu.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const raw = params.next ?? "/app";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/app";

  return <MasukView next={next} initialError={params.error ?? null} />;
}
