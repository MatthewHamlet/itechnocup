import type { Metadata } from "next";
import AppShell from "./components/AppShell";
import PlanProvider from "./components/PlanProvider";
import AppPreferences from "./components/AppPreferences";
import { getAppData } from "@/lib/data/queries";
import { planDateISO } from "@/lib/data/plan-date";

export const metadata: Metadata = {
  title: "Farad",
  description:
    "Rencanakan kegiatan rumah yang memakai listrik, lihat jam yang padat, dan atur gilirannya.",
};

export default async function FaradAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, profile, household, activities } = await getAppData(planDateISO());

  return (
    <AppPreferences
      accountName={profile?.display_name ?? null}
      accountAvatar={profile?.avatar_url ?? null}
      signedIn={userId !== null}
    >
      <PlanProvider
        household={{
          installedVA: household.installed_va,
          baseLoadVA: household.base_load_va,
          reserveFraction: Number(household.reserve_fraction),
        }}
        initialActivities={userId ? activities : undefined}
        planDate={planDateISO()}
        persist={userId !== null}
      >
        <AppShell>{children}</AppShell>
      </PlanProvider>
    </AppPreferences>
  );
}
