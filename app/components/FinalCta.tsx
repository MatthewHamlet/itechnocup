import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import Reveal from "./Reveal";

const points = [
  "Tanpa smart plug",
  "Tanpa sensor tambahan",
  "Berdasarkan kapasitas rumahmu",
  "Bisa atur aktivitas secara manual",
  "Bisa dibantu otomatis oleh Farad",
];

export default function FinalCta() {
  return (
    <section id="cta" className="relative bg-white px-4 py-20 sm:px-6 lg:py-28">
      <Reveal>
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-farad-border lg:rounded-[40px]">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-center bg-farad-ivory p-8 sm:p-12 lg:p-14 xl:p-16">
              <h2 className="text-balance text-3xl font-bold leading-[1.08] tracking-[-0.02em] text-farad-ink sm:text-4xl lg:text-[2.5rem]">
                Rumah tetap berjalan, tanpa semuanya harus bersamaan.
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-farad-muted">
                Mulai dari daya yang sudah terpasang di rumahmu. Tidak ada alat
                yang perlu dibeli lebih dulu.
              </p>

              <ul className="mt-9 space-y-4">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <Check
                      size={17}
                      strokeWidth={2.5}
                      className="mt-0.5 shrink-0 text-farad-primary"
                    />
                    <span className="text-[15px] leading-6 text-farad-ink">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-11 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Link
                  href="#product"
                  className="farad-press inline-flex items-center justify-center gap-2 rounded-full bg-farad-forest px-8 py-4 text-sm font-bold text-white hover:bg-farad-ink"
                >
                  Mulai Atur Giliran
                  <ArrowRight size={15} />
                </Link>

                <Link
                  href="#energy"
                  className="farad-press inline-flex items-center justify-center rounded-full border border-farad-border bg-white px-8 py-4 text-sm font-bold text-farad-ink hover:border-farad-primary/40"
                >
                  Pelajari perhitungannya
                </Link>
              </div>
            </div>

            <div className="relative min-h-[320px] sm:min-h-[400px] lg:min-h-[600px]">
              <Image
                src="/asian-mom-cooking.jpg"
                alt="Satu keluarga memasak bersama di dapur rumah"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-[38%_38%] lg:object-[34%_45%]"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
