import type { Metadata } from "next";
import AktivitasView from "../components/AktivitasView";

export const metadata: Metadata = {
  title: "Aktivitas · Farad",
  description:
    "Catat alat rumah yang mau dipakai malam ini, lalu Farad mengatur gilirannya.",
};

export default function Page() {
  return <AktivitasView />;
}
