"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, WashingMachine, Zap } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";
import Blob from "../components/Blob";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 40,
    mass: 0.4,
  });

  const photoY = useTransform(smooth, [0, 1], ["0%", "26%"]);
  const photoScale = useTransform(smooth, [0, 1], [1.06, 1.24]);

  const contentY = useTransform(smooth, [0, 1], [0, -110]);
  const contentOpacity = useTransform(smooth, [0, 0.65], [1, 0]);

  const blobOneY = useTransform(smooth, [0, 1], [0, -190]);
  const blobTwoY = useTransform(smooth, [0, 1], [0, 150]);
  const badgeY = useTransform(smooth, [0, 1], [0, -60]);

  const layer = <T,>(value: MotionValue<T>) =>
    reduceMotion ? undefined : value;

  return (
    <section ref={sectionRef} className="relative bg-farad-ink">
      <div className="relative isolate h-dvh min-h-[560px] overflow-hidden bg-farad-ink">
        <motion.div
          style={{ y: layer(photoY), scale: layer(photoScale) }}
          className="absolute inset-0 -z-20 will-change-transform"
        >
          <Image
            src="/asian-mom-laundry.jpg"
            alt="Seorang ibu memasukkan cucian ke mesin cuci di rumah"
            fill
            preload
            sizes="100vw"
            className="object-cover object-[46%_45%] lg:object-[58%_45%]"
          />
        </motion.div>

        <div className="absolute inset-x-0 top-0 -z-10 h-44 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-3/5 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <motion.div
          style={{ y: layer(blobOneY) }}
          className="pointer-events-none absolute -right-10 top-24 -z-[5] hidden lg:block"
        >
          <Blob
            icon={Zap}
            fill="bg-farad-peach/85"
            iconClassName="text-farad-forest"
            iconSize={34}
            className="size-40 backdrop-blur-sm"
          />
        </motion.div>

        <motion.div
          style={{ y: layer(blobTwoY) }}
          className="pointer-events-none absolute -left-12 bottom-1/3 -z-[5] hidden lg:block"
        >
          <Blob
            icon={WashingMachine}
            variant="b"
            fill="bg-white/20"
            iconClassName="text-white"
            iconSize={30}
            className="size-32 backdrop-blur-md"
          />
        </motion.div>

        <motion.div
          style={{ y: layer(badgeY) }}
          className="absolute right-5 top-28 z-10 hidden sm:block lg:right-10 lg:top-32"
        >
          <div className="flex items-center gap-2.5 rounded-full bg-white/95 px-4 py-2.5 text-farad-ink shadow-lg shadow-farad-ink/10 backdrop-blur-md">
            <span className="size-2 rounded-full bg-farad-primary" />
            <span className="text-xs font-semibold">
              Dibuat untuk rumah dengan daya terbatas
            </span>
          </div>
        </motion.div>

        <motion.div
          style={{ y: layer(contentY), opacity: layer(contentOpacity) }}
          className="relative z-10 flex h-full items-end"
        >
          <div className="mx-auto w-full max-w-7xl px-6 pb-16 sm:px-8 lg:pb-20">
            <Link
              href="#how-it-works"
              className="farad-press mb-7 inline-flex w-fit items-center gap-2 rounded-full bg-white/90 py-1.5 pl-1.5 pr-4 text-xs font-semibold text-farad-ink backdrop-blur-sm hover:bg-white"
            >
              <span className="rounded-full bg-farad-peach px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-farad-ink">
                Baru
              </span>
              Kenali cara kerja Atur Giliran
              <ArrowRight size={12} />
            </Link>

            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:max-w-4xl lg:text-[4.25rem]">
              Semua boleh menyala.
              <br className="hidden sm:block" />{" "}
              <span className="text-farad-peach">Nggak harus barengan.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-white/85 sm:text-lg">
              Farad membantu mengatur giliran aktivitas yang memakai listrik
              agar beban tidak terlalu menumpuk pada waktu yang sama.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="#cta"
                className="farad-press inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-farad-ink hover:bg-farad-peach"
              >
                Coba Farad
                <ArrowRight size={15} />
              </Link>

              <Link
                href="#how-it-works"
                className="farad-press inline-flex items-center justify-center rounded-full border border-white/45 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/15"
              >
                Lihat cara kerjanya
              </Link>
            </div>
          </div>
        </motion.div>

        <Link
          href="#problem"
          aria-label="Gulir ke bagian berikutnya"
          className="farad-press absolute bottom-8 right-6 z-20 grid size-12 place-items-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-md hover:bg-white hover:text-farad-ink lg:right-10"
        >
          <ArrowDown size={17} />
        </Link>
      </div>
    </section>
  );
}
