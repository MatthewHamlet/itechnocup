import { Gear } from "@phosphor-icons/react/dist/ssr";
import PagePlaceholder from "../components/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      icon={Gear}
      title="Pengaturan"
      body="Preferensi jam, satuan, dan seberapa berani Farad menggeser kegiatanmu."
    />
  );
}
