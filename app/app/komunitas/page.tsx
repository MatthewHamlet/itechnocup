import type { Metadata } from "next";
import CommunityView from "../components/community/CommunityView";
import { getCommunityData } from "@/lib/community/queries";

export const metadata: Metadata = {
  title: "Komunitas",
  description:
    "Tempat warga berbagi cerita dan tips soal listrik rumah: diskusi, grup, dan tanya jawab sesama pengguna.",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  return <CommunityView data={await getCommunityData()} />;
}
