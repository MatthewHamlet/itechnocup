import type { ReactNode } from "react";

/* Header halaman bergaya karsa-app: satu blok warna yang melebar sampai tepi
   layar, sudut bawah membulat, dengan lingkaran samar di kanan. */

const TONE = {
  blue: {
    wash: "linear-gradient(115deg, #d4e5f4 0%, #c1d9ed 62%, #e1edf5 100%)",
    ink: "text-[#253d55]",
    sub: "text-[#48627a]",
    eyebrow: "text-[#526e89]",
  },
  lavender: {
    wash: "linear-gradient(115deg, #e1e1f1 0%, #d4d9ec 65%, #ecebf5 100%)",
    ink: "text-[#3e4568]",
    sub: "text-[#5d6483]",
    eyebrow: "text-[#696e8f]",
  },
  peach: {
    wash: "linear-gradient(115deg, #f3e3d6 0%, #edd9c7 65%, #f8eee5 100%)",
    ink: "text-[#624a3d]",
    sub: "text-[#786153]",
    eyebrow: "text-[#876c5a]",
  },
  ice: {
    wash: "linear-gradient(115deg, #d7e8e9 0%, #c8dfe3 65%, #e7eff0 100%)",
    ink: "text-[#31525d]",
    sub: "text-[#4d6b74]",
    eyebrow: "text-[#587b83]",
  },
  forest: {
    wash: "#285548",
    ink: "text-white",
    sub: "text-white/78",
    eyebrow: "text-white/60",
  },
  clay: {
    wash: "#ae5b50",
    ink: "text-white",
    sub: "text-white/80",
    eyebrow: "text-white/62",
  },
  sand: {
    wash: "#e6dccb",
    ink: "text-app-ink",
    sub: "text-app-ink/70",
    eyebrow: "text-app-ink/50",
  },
} as const;

export type HeaderTone = keyof typeof TONE;

/* harus persis membatalkan padding PAGE_SHELL di bawah */
const BLEED =
  "-mx-4 -mt-6 px-4 pt-6 sm:-mx-6 sm:px-6 md:-mx-8 md:-mt-10 md:px-8 md:pt-10 xl:-mx-12 xl:-mt-12 xl:px-12 xl:pt-12";

export const PAGE_SHELL =
  "w-full px-4 pb-6 pt-6 sm:px-6 md:px-8 md:pt-10 lg:pb-10 xl:px-12 xl:pb-12 xl:pt-12";

export default function PageHeader({
  tone = "blue",
  eyebrow,
  title,
  subtitle,
  action,
  children,
}: {
  tone?: HeaderTone;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  const t = TONE[tone];

  return (
    <header
      className={`relative mb-6 overflow-hidden rounded-b-[32px] pb-7 sm:mb-8 sm:rounded-b-[44px] sm:pb-10 xl:mb-10 xl:pb-12 ${BLEED}`}
      style={{ background: t.wash }}
    >
      <svg
        aria-hidden
        viewBox="0 0 600 200"
        preserveAspectRatio="xMaxYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.11]"
      >
        <circle cx="512" cy="18" r="118" fill="white" />
        <circle cx="596" cy="164" r="86" fill="white" />
        <circle cx="392" cy="182" r="62" fill="white" />
      </svg>

      <div className="relative flex items-start gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p
              className={`font-satoshi text-[11px] font-bold uppercase leading-4 tracking-[0.18em] ${t.eyebrow}`}
            >
              {eyebrow}
            </p>
          )}
          <h1
            className={`font-nohemi mt-1.5 text-[26px] font-bold leading-none tracking-tight sm:text-[32px] xl:text-[38px] ${t.ink}`}
          >
            {title}
          </h1>
          {subtitle && (
            <p className={`mt-2.5 max-w-2xl text-[15px] leading-6 ${t.sub}`}>
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {children && <div className="relative mt-6">{children}</div>}
    </header>
  );
}
