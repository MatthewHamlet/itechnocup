import type { Metadata } from "next";
import RumahView from "../components/RumahView";

export const metadata: Metadata = { title: "Rumah Saya · Farad" };

export default function Page() {
  return <RumahView />;
}
