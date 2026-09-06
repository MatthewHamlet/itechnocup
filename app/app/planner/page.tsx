import type { Metadata } from "next";
import JadwalView from "../components/JadwalView";

export const metadata: Metadata = {
  title: "Jadwal · Farad",
  description:
    "Urutan kegiatan rumah per jam, dan jam mana yang paling padat dayanya.",
};

export default function Page() {
  return <JadwalView />;
}
