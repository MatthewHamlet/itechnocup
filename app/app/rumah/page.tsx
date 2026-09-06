import { Lightning } from "@phosphor-icons/react/dist/ssr";
import PagePlaceholder from "../components/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      icon={Lightning}
      title="Rumah Saya"
      body="Kapasitas terpasang, beban dasar, dan cadangan yang dipakai Farad saat menyusun rencana."
    />
  );
}
