import Link from "next/link";
import { ArrowRight, MousePointerClick } from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import PlanProvider from "@/app/app/components/PlanProvider";
import PlanTimeline from "@/app/app/components/PlanTimeline";
import SaranFaradCard from "@/app/app/components/SaranFaradCard";
import KapasitasRumahCard from "@/app/app/components/KapasitasRumahCard";
import EstimasiEnergiCard from "@/app/app/components/EstimasiEnergiCard";

export default function AppShowcase() {
  return (
    <section
      id="product"
      className="relative bg-farad-ivory px-4 py-24 sm:px-6 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Di dalam Farad"
            title="Bukan gambar aplikasi. Ini aplikasinya."
            lead="Papan rencana, kartu kapasitas, dan saran Farad di bawah ini komponen yang sama persis dengan yang jalan di dalam Farad. Geser kegiatannya, lalu tekan Atur Giliran."
            align="center"
          />
        </Reveal>

        <Reveal delay={80}>
          <figure className="mt-16">
            <figcaption className="sr-only">
              Antarmuka Farad yang bisa dicoba langsung: papan rencana malam
              ini, saran dari maskot Farad, kapasitas rumah, dan estimasi
              energi.
            </figcaption>

            <div className="overflow-hidden rounded-[28px] border border-farad-border bg-white shadow-[0_40px_90px_-60px_rgba(30,41,37,0.55)] lg:rounded-[36px]">
              <div className="flex items-center gap-3 border-b border-farad-border bg-farad-paper px-5 py-3.5">
                <div className="flex items-center gap-1.5" aria-hidden>
                  <span className="size-2.5 rounded-full bg-farad-ink/15" />
                  <span className="size-2.5 rounded-full bg-farad-ink/10" />
                  <span className="size-2.5 rounded-full bg-farad-ink/10" />
                </div>
                <span className="mx-auto rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-farad-muted ring-1 ring-farad-border">
                  farad.app/app
                </span>
                <span className="hidden items-center gap-1.5 text-[11px] font-semibold text-farad-primary sm:inline-flex">
                  <MousePointerClick size={13} />
                  Bisa dipakai
                </span>
              </div>

              <div
                className="farad-theme space-y-4 bg-app-canvas p-3 sm:p-5 lg:space-y-6 lg:p-7"
                style={{
                  fontFamily: "var(--font-satoshi)",
                  ["--farad-advice-min-h" as string]: "0px",
                }}
              >
                <PlanProvider>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:gap-6">
                    <PlanTimeline />
                    <SaranFaradCard />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
                    <KapasitasRumahCard />
                    <EstimasiEnergiCard />
                  </div>
                </PlanProvider>
              </div>
            </div>
          </figure>
        </Reveal>

        <Reveal delay={140}>
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <p className="text-sm leading-6 text-farad-muted">
              Rencana contoh untuk satu malam. Di aplikasinya, semua ini
              mengikuti daya rumah yang kamu isi sendiri.
            </p>
            <Link
              href="/masuk"
              className="farad-press inline-flex items-center gap-2 rounded-full bg-farad-forest px-7 py-3.5 text-sm font-bold text-white hover:bg-farad-ink"
            >
              Buka Farad
              <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
