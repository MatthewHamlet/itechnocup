import type { Metadata } from "next";
import AppShell from "./components/AppShell";
import PlanProvider from "./components/PlanProvider";
import AppPreferences from "./components/AppPreferences";

export const metadata: Metadata = {
  title: "Farad",
  description:
    "Rencanakan kegiatan rumah yang memakai listrik, lihat jam yang padat, dan atur gilirannya.",
};

export default function FaradAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppPreferences>
      <PlanProvider>
        <AppShell>{children}</AppShell>
      </PlanProvider>
    </AppPreferences>
  );
}
