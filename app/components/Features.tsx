import { CalendarClock, Shuffle, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import MascotMark from "./MascotMark";

type Feature = {
  number: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  mascot?: boolean;
  card: string;
  accent: string;
};

const features: Feature[] = [
  {
    number: "01",
    title: "Tambah Kegiatan",
    description:
      "Masukkan kegiatan, alat, durasi, dan waktu yang kamu inginkan.",
    icon: CalendarClock,
    card: "bg-farad-peachsoft",
    accent: "text-farad-terracotta",
  },
  {
    number: "02",
    title: "Lihat Jam Padat",
    description:
      "Farad mendeteksi saat beberapa aktivitas berencana berjalan bersamaan.",
    icon: TriangleAlert,
    card: "bg-farad-ambersoft",
    accent: "text-farad-amber",
  },
  {
    number: "03",
    title: "Atur Giliran",
    description:
      "Aktivitas fleksibel dapat disusun ulang berdasarkan kapasitas rumah.",
    icon: Shuffle,
    card: "bg-farad-claysoft",
    accent: "text-farad-clay",
  },
  {
    number: "04",
    title: "Pahami Hasilnya",
    description:
      "Farad menjelaskan apa yang dipindah, kenapa, dan bagaimana estimasi energinya.",
    mascot: true,
    card: "bg-farad-sandsoft",
    accent: "text-farad-sand",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative bg-white px-6 py-24 sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Yang Farad lakukan"
            title="Dari kegiatan rumah menjadi rencana yang lebih lega."
            lead="Cukup masukkan apa yang perlu dilakukan dan kapan waktunya. Farad membantu melihat bagian yang terlalu padat."
            align="center"
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal
                key={feature.number}
                delay={60 * index}
                className="h-full"
              >
                <article
                  className={`farad-lift group flex h-full flex-col rounded-3xl p-7 ${feature.card}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`grid size-12 place-items-center rounded-2xl bg-white transition-transform duration-200 group-hover:scale-105 ${feature.accent}`}
                    >
                      {feature.mascot ? (
                        <MascotMark size={26} />
                      ) : (
                        Icon && <Icon size={20} strokeWidth={1.8} />
                      )}
                    </span>

                    <span
                      className={`text-xl font-bold tabular-nums ${feature.accent}`}
                    >
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="mt-7 text-lg font-bold text-farad-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-6 text-farad-ink/75">
                    {feature.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
