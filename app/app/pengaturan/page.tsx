import type { Metadata } from "next";
import SettingsView from "../components/SettingsView";

export const metadata: Metadata = { title: "Pengaturan | Farad" };

export default function Page() {
  return <SettingsView />;
}
