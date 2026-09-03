import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import ScrollingWord from "./ScrollingWord";

const steps = [
  {
    number: "01",
    title: "Masukkan kegiatan",
    description: "Tambahkan aktivitas yang perlu selesai beserta waktunya.",
  },
  {
    number: "02",
    title: "Lihat yang bertabrakan",
    description: "Farad menunjukkan jam ketika beban terlalu menumpuk.",
  },
  {
    number: "03",
    title: "Atur giliran",
    description:
      "Klik sekali untuk mencari susunan yang lebih sesuai kapasitas rumah.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-white px-6 py-24 sm:px-8 lg:py-28"
    >
      <ScrollingWord text="Atur Giliran" className="text-farad-forest/[0.06]" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 46% at 50% 44%, var(--color-farad-sage) 0%, transparent 68%)",
          opacity: 0.55,
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Cara kerja"
            title="Tiga langkah, lalu Farad yang merapikan."
            align="center"
          />
        </Reveal>

        <div className="relative mt-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-7 hidden h-px lg:block"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, var(--color-farad-border) 0 7px, transparent 7px 15px)",
            }}
          />

          <ol className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-10">
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={70 * index}>
                <li className="relative flex flex-col items-start lg:items-center lg:text-center">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full border border-farad-border bg-white text-base font-bold tabular-nums text-farad-primary">
                    {step.number}
                  </span>

                  <h3 className="mt-6 text-xl font-bold text-farad-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 max-w-sm text-[15px] leading-7 text-farad-muted">
                    {step.description}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
