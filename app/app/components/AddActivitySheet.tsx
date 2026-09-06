"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  ListDashes,
  NotePencil,
  Plugs,
  Plus,
} from "@phosphor-icons/react";
import {
  CATALOG,
  SLOT_MIN,
  WINDOW_END,
  WINDOW_START,
  formatVA,
  makeActivity,
  timeLabel,
  type CatalogItem,
  type Flexibility,
} from "./plan-model";
import Modal from "./Modal";
import ScanPhotoPanel from "./ScanPhotoPanel";
import { usePlan } from "./PlanProvider";

const DEFAULT_START = 19 * 60;

/* karsa's SourcePicker row, with Farad's tokens */
const ROW =
  "flex w-full items-center gap-3.5 rounded-2xl bg-white p-4 text-left outline-none ring-1 ring-app-line transition-colors duration-200 hover:bg-farad-sage/50 focus-visible:ring-2 focus-visible:ring-farad-primary/40 sm:gap-4 sm:p-5";

type Mode = "source" | "photo" | "catalog" | "custom" | "detail";

const TITLE: Record<Mode, string> = {
  source: "Tambah aktivitas dari",
  photo: "Baca dari foto",
  catalog: "Alat rumah",
  custom: "Tulis sendiri",
  detail: "",
};

function startOptions(duration: number) {
  const last = WINDOW_END - duration;
  const slots: number[] = [];
  for (let t = WINDOW_START; t <= last; t += SLOT_MIN) slots.push(t);
  return slots;
}

function SourceRow({
  icon,
  tone,
  title,
  note,
  onClick,
}: {
  icon: ReactNode;
  tone: string;
  title: string;
  note: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={ROW}>
      <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tone}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold leading-5 text-app-ink">
          {title}
        </span>
        <span className="block text-[12.5px] leading-4 text-app-muted">{note}</span>
      </span>
    </button>
  );
}

export default function AddActivitySheet({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (label: string) => void;
}) {
  const { addActivity } = usePlan();

  const [mode, setMode] = useState<Mode>("source");
  const [picked, setPicked] = useState<CatalogItem | null>(null);
  const [start, setStart] = useState(DEFAULT_START);
  const [flexibility, setFlexibility] = useState<Flexibility>("flexible");

  /* start fresh every time the sheet opens */
  useEffect(() => {
    if (open) return;
    const id = window.setTimeout(() => {
      setMode("source");
      setPicked(null);
      setStart(DEFAULT_START);
      setFlexibility("flexible");
    }, 220);
    return () => window.clearTimeout(id);
  }, [open]);

  const choose = (item: CatalogItem) => {
    setPicked(item);
    setFlexibility(item.flexibility);
    setStart(Math.min(DEFAULT_START, WINDOW_END - item.duration));
    setMode("detail");
  };

  const back = () => {
    if (mode === "detail") setMode(picked?.key === "custom" ? "custom" : "catalog");
    else setMode("source");
  };


  const submit = () => {
    if (!picked) return;
    addActivity(makeActivity(picked, start, flexibility));
    onAdded(picked.label);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} label="Tambah aktivitas">
      <div className="mb-3 flex shrink-0 items-center gap-2 sm:mb-5">
        {mode !== "source" && (
          <button
            type="button"
            onClick={back}
            aria-label="Kembali"
            className="-ml-1.5 grid size-8 shrink-0 place-items-center rounded-full text-app-muted outline-none transition-colors hover:bg-white hover:text-app-ink focus-visible:ring-2 focus-visible:ring-farad-primary/40"
          >
            <ArrowLeft size={17} weight="bold" />
          </button>
        )}
        <h3 className="font-nohemi min-w-0 flex-1 text-[16px] font-bold tracking-tight text-app-ink sm:text-[22px]">
          {mode === "detail" ? (picked?.label ?? "") : TITLE[mode]}
        </h3>
      </div>

      <div className="scrollbar-none -mx-5 -my-1 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-1 sm:-mx-7 sm:px-7">
        {mode === "source" && (
          <div className="space-y-2.5">
            <SourceRow
              icon={<Camera size={20} weight="bold" />}
              tone="bg-farad-sage text-farad-forest"
              title="Foto"
              note="Potret label daya alatnya sekarang"
              onClick={() => setMode("photo")}
            />
            <SourceRow
              icon={<ImageIcon size={20} weight="bold" />}
              tone="bg-chip-1 text-chip-2i"
              title="File"
              note="Pilih foto alat dari perangkat"
              onClick={() => setMode("photo")}
            />
            <SourceRow
              icon={<NotePencil size={20} weight="bold" />}
              tone="bg-farad-ambersoft text-farad-amber"
              title="Tulis sendiri"
              note="Isi nama dan dayanya manual"
              onClick={() => setMode("custom")}
            />
          </div>
        )}

        {mode === "photo" && (
          <div>
            <ScanPhotoPanel onUse={choose} />

            <button
              type="button"
              onClick={() => setMode("catalog")}
              className={`mt-2.5 ${ROW}`}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-app-canvas text-farad-forest">
                <ListDashes size={20} weight="bold" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold leading-5 text-app-ink">
                  Pilih dari daftar alat
                </span>
                <span className="block text-[12.5px] leading-4 text-app-muted">
                  Daya dan durasinya sudah terisi
                </span>
              </span>
            </button>
          </div>
        )}

        {mode === "catalog" && (
          <div className="space-y-2.5">
            {CATALOG.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => choose(item)}
                  className={ROW}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-app-canvas text-farad-forest">
                    <Icon size={20} weight="fill" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold leading-5 text-app-ink">
                      {item.label}
                    </span>
                    <span className="block truncate text-[12.5px] leading-4 text-app-muted">
                      {item.appliance}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[13.5px] font-bold tabular-nums leading-4 text-app-ink">
                      {formatVA(item.va)} VA
                    </span>
                    <span className="block text-[12px] leading-4 text-app-dim">
                      {item.duration} mnt
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {mode === "custom" && <CustomForm onReady={choose} />}

        {mode === "detail" && picked && (
          <DetailForm
            item={picked}
            start={start}
            onStart={setStart}
            flexibility={flexibility}
            onFlexibility={setFlexibility}
            onSubmit={submit}
          />
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full shrink-0 rounded-full bg-app-canvas py-3 text-[14px] font-bold text-app-ink outline-none transition-colors hover:bg-app-line focus-visible:ring-2 focus-visible:ring-farad-primary/40"
      >
        Batal
</button>
    </Modal>
  );
}

const FIELD =
  "mt-2 w-full rounded-2xl bg-white px-4 py-3.5 text-[15px] font-bold text-app-ink outline-none ring-1 ring-app-line focus-visible:ring-2 focus-visible:ring-farad-primary/40";
const LABEL =
  "block text-[12px] font-bold uppercase tracking-[0.16em] text-app-dim";

function CustomForm({ onReady }: { onReady: (item: CatalogItem) => void }) {
  const [label, setLabel] = useState("");
  const [va, setVa] = useState(300);
  const [duration, setDuration] = useState(60);

  const ready = label.trim().length > 0 && va > 0 && duration > 0;

  return (
    <div>
      <label className="block">
        <span className={LABEL}>Nama kegiatan</span>
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Misal: Ngecas mobil listrik"
          className={`${FIELD} placeholder:font-medium placeholder:text-app-dim`}
        />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className={LABEL}>Daya (VA)</span>
          <input
            type="number"
            min={10}
            step={10}
            value={va}
            onChange={(event) => setVa(Number(event.target.value))}
            className={`${FIELD} tabular-nums`}
          />
        </label>
        <label className="block">
          <span className={LABEL}>Durasi (menit)</span>
          <input
            type="number"
            min={15}
            step={15}
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
            className={`${FIELD} tabular-nums`}
          />
        </label>
      </div>

      <button
        type="button"
        disabled={!ready}
        onClick={() =>
          onReady({
            key: "custom",
            label: label.trim(),
            appliance: "Ditulis sendiri",
            icon: Plugs,
            va,
            watts: va,
            duration,
            flexibility: "flexible",
            note: "Ditulis sendiri",
          })
        }
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-farad-forest px-5 py-3.5 text-[15px] font-bold text-white outline-none transition-transform duration-200 hover:bg-farad-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-app-line disabled:text-app-dim focus-visible:ring-2 focus-visible:ring-farad-primary/40"
      >
        Lanjut atur jamnya
      </button>
    </div>
  );
}

function DetailForm({
  item,
  start,
  onStart,
  flexibility,
  onFlexibility,
  onSubmit,
}: {
  item: CatalogItem;
  start: number;
  onStart: (value: number) => void;
  flexibility: Flexibility;
  onFlexibility: (value: Flexibility) => void;
  onSubmit: () => void;
}) {
  const Icon = item.icon;
  const options = startOptions(item.duration);

  const chip =
    "flex-1 rounded-xl px-3 py-2.5 text-[13px] font-bold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-farad-primary/40";

  return (
    <div>
      <div className="flex items-center gap-3.5 rounded-2xl bg-white p-4 ring-1 ring-app-line sm:gap-4 sm:p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-app-canvas text-farad-forest">
          <Icon size={20} weight="fill" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-bold leading-5 text-app-ink">
            {item.appliance}
          </span>
          <span className="block truncate text-[12.5px] leading-4 text-app-muted">
            {item.note}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-[15px] font-bold tabular-nums leading-5 text-app-ink">
            {formatVA(item.va)} VA
          </span>
          <span className="block text-[12px] leading-4 text-app-dim">
            {item.duration} menit
          </span>
        </span>
      </div>

      <label className="mt-4 block">
        <span className={LABEL}>Mulai jam</span>
        <select
          value={start}
          onChange={(event) => onStart(Number(event.target.value))}
          className={`${FIELD} appearance-none`}
        >
          {options.map((value) => (
            <option key={value} value={value}>
              {timeLabel(value)} – {timeLabel(value + item.duration)}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4">
        <span className={LABEL}>Boleh digeser Farad?</span>
        <div className="mt-2 flex gap-2 rounded-2xl bg-white p-1.5 ring-1 ring-app-line">
          <button
            type="button"
            onClick={() => onFlexibility("flexible")}
            aria-pressed={flexibility === "flexible"}
            className={`${chip} ${
              flexibility === "flexible"
                ? "bg-farad-forest text-white"
                : "text-app-muted hover:bg-app-canvas"
            }`}
          >
            Boleh digeser
          </button>
          <button
            type="button"
            onClick={() => onFlexibility("fixed")}
            aria-pressed={flexibility === "fixed"}
            className={`${chip} ${
              flexibility === "fixed"
                ? "bg-farad-forest text-white"
                : "text-app-muted hover:bg-app-canvas"
            }`}
          >
            Jamnya tetap
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-farad-forest px-5 py-3.5 text-[15px] font-bold text-white outline-none transition-transform duration-200 hover:bg-farad-primary active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-farad-primary/40"
      >
        <Plus size={17} weight="bold" />
        Tambahkan ke rencana
      </button>
    </div>
  );
}
