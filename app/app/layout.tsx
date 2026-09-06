import type { Metadata } from "next";
import AppShell from "./components/AppShell";
import PlanProvider from "./components/PlanProvider";

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
    <>
      <link rel="preconnect" href="https://api.fontshare.com" />
      <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://api.fontshare.com/v2/css?f%5B%5D=satoshi@1,2&display=swap"
      />
      <PlanProvider>
        <AppShell>{children}</AppShell>
      </PlanProvider>
    </>
  );
}
