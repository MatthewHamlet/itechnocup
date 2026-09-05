import HomeScene from "./components/HomeScene";
import MobileHome from "./components/MobileHome";
import PlanTimeline from "./components/PlanTimeline";
import ScrollFade from "./components/ScrollFade";
import SaranFaradCard from "./components/SaranFaradCard";
import KapasitasRumahCard from "./components/KapasitasRumahCard";
import EstimasiEnergiCard from "./components/EstimasiEnergiCard";
import KegiatanCarousel from "./components/KegiatanCarousel";

const GREETING_MASK =
  "linear-gradient(to bottom, #000 0%, #000 52%, transparent 88%), linear-gradient(to right, transparent 0%, #000 8%, #000 74%, transparent 99%)";

export default function FaradHome() {
  return (
    <>
      <div className="overflow-x-clip lg:hidden">
        <MobileHome />
      </div>

      <div className="hidden overflow-x-clip lg:block lg:h-[100dvh] lg:overflow-hidden lg:px-8 lg:pt-8 xl:px-12 xl:pt-10">
        <div className="grid h-full grid-cols-[minmax(0,2.05fr)_minmax(0,1fr)] gap-9 xl:gap-11">
          <div className="scrollbar-slim h-full space-y-7 overflow-y-auto overflow-x-hidden pb-10 pr-2 xl:space-y-8">
            <header className="relative pb-1">
              <div
                aria-hidden
                className="pointer-events-none absolute -left-12 -right-12 -top-20 h-[330px] overflow-hidden"
                style={{
                  WebkitMaskImage: GREETING_MASK,
                  maskImage: GREETING_MASK,
                  WebkitMaskComposite: "source-in",
                  maskComposite: "intersect",
                }}
              >
                <HomeScene />
              </div>

              <div className="relative">
                <h1 className="font-nohemi text-[32px] font-bold leading-[1.1] tracking-tight text-app-ink xl:text-[38px]">
                  Selamat pagi, Isabella&nbsp;<span aria-hidden>👋</span>
                </h1>
              </div>
            </header>

            <PlanTimeline />
            <KegiatanCarousel />
          </div>

          <ScrollFade className="scrollbar-none h-full space-y-6 overflow-y-auto overflow-x-hidden pb-8 xl:space-y-7">
            <SaranFaradCard />
            <KapasitasRumahCard />
            <EstimasiEnergiCard />
          </ScrollFade>
        </div>
      </div>
    </>
  );
}
