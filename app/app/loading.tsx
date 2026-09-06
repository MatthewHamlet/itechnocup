import { PAGE_SHELL } from "./components/PageHeader";

function Bone({ className = "" }: { className?: string }) {
  return <span className={`block rounded-full bg-app-ink/10 ${className}`} />;
}

function Card({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-[26px] bg-white p-6 ring-1 ring-app-line ${className}`}
    >
      <Bone className="h-3 w-24" />
      <Bone className="mt-4 h-8 w-40" />
      <Bone className="mt-3 h-3 w-full" />
      <Bone className="mt-2 h-3 w-3/4" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className={PAGE_SHELL} aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat halaman</span>

      <div className="animate-pulse">
        <div className="-mx-4 -mt-6 mb-6 rounded-b-[32px] bg-app-line-soft px-4 pb-7 pt-6 sm:-mx-6 sm:mb-8 sm:rounded-b-[44px] sm:px-6 sm:pb-10 md:-mx-8 md:-mt-10 md:px-8 md:pt-10 xl:-mx-12 xl:-mt-12 xl:mb-10 xl:px-12 xl:pb-12 xl:pt-12">
          <Bone className="h-3 w-20" />
          <Bone className="mt-4 h-9 w-56 rounded-2xl" />
          <Bone className="mt-4 h-3 w-72 max-w-full" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="rounded-[26px] bg-white p-6 ring-1 ring-app-line">
            <Bone className="h-3 w-28" />
            <div className="mt-6 space-y-3">
              <Bone className="h-12 w-full rounded-2xl" />
              <Bone className="h-12 w-11/12 rounded-2xl" />
              <Bone className="h-12 w-4/5 rounded-2xl" />
              <Bone className="h-12 w-2/3 rounded-2xl" />
            </div>
            <Bone className="mt-6 h-12 w-44 rounded-2xl" />
          </div>

          <div className="space-y-6">
            <Card />
            <Card />
          </div>
        </div>
      </div>
    </div>
  );
}
