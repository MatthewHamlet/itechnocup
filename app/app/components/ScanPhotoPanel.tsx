"use client";

import { useRef, useState } from "react";
import {
  ArrowClockwise,
  Camera,
  CheckCircle,
  Image as ImageIcon,
  Plugs,
  Sparkle,
  Warning,
} from "@phosphor-icons/react";
import { scanApplianceAction } from "../scan-actions";
import type { Detection } from "@/lib/scan/detect";
import { CATALOG, SLOT_MIN, WINDOW_END, WINDOW_START, formatVA, type CatalogItem } from "./plan-model";

const MAX_DURATION = WINDOW_END - WINDOW_START;

async function compress(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
  return { dataUrl, base64: dataUrl.slice(dataUrl.indexOf(",") + 1) };
}

function toCatalogItem(detection: Detection): CatalogItem {
  const known = CATALOG.find((item) => item.key === detection.catalog_key);
  const duration = Math.min(
    MAX_DURATION,
    Math.max(SLOT_MIN, Math.round(detection.duration_minutes / SLOT_MIN) * SLOT_MIN),
  );

  return {
    key: known?.key ?? "custom",
    label: detection.label,
    appliance: detection.appliance,
    icon: known?.icon ?? Plugs,
    va: Math.round(detection.va),
    watts: Math.round(detection.watts),
    duration,
    flexibility: detection.flexibility,
    note: detection.note,
  };
}

export default function ScanPhotoPanel({
  onUse,
}: {
  onUse: (item: CatalogItem) => void;
}) {
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [detection, setDetection] = useState<Detection | null>(null);

  async function handle(file: File | undefined) {
    if (!file) return;
    setError("");
    setDetection(null);
    setScanning(true);

    try {
      const { dataUrl, base64 } = await compress(file);
      setPreview(dataUrl);

      const result = await scanApplianceAction(base64, "image/jpeg");
      if (!result.ok) setError(result.error);
      else setDetection(result.detection);
    } catch {
      setError("Fotonya tidak bisa dibuka. Coba ambil ulang.");
    } finally {
      setScanning(false);
    }
  }

  function reset() {
    setPreview(null);
    setDetection(null);
    setError("");
    if (camera.current) camera.current.value = "";
    if (gallery.current) gallery.current.value = "";
  }

  const usable = detection?.found === true && detection.va > 0 && detection.watts > 0;

  return (
    <div>
      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(event) => handle(event.target.files?.[0])}
      />
      <input
        ref={gallery}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(event) => handle(event.target.files?.[0])}
      />

      {preview && (
        <div className="relative mb-4 overflow-hidden rounded-2xl bg-app-canvas ring-1 ring-app-line">
          <img src={preview} alt="Foto alat yang dipindai" className="max-h-56 w-full object-contain" />
          {scanning && (
            <div className="absolute inset-0 grid place-items-center bg-app-ink/45 backdrop-blur-[2px]">
              <p className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-app-ink">
                <Sparkle size={15} weight="fill" className="animate-pulse text-farad-primary" />
                Farad sedang membaca…
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mb-4 flex items-start gap-2.5 rounded-2xl bg-farad-oversoft px-4 py-3 text-[13px] leading-5 text-farad-over">
          <Warning size={16} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {detection && !detection.found && (
        <p className="mb-4 rounded-2xl bg-farad-ambersoft px-4 py-3 text-[13px] leading-5 text-farad-amber">
          {detection.note || "Tidak ada alat listrik yang terbaca di foto ini."}
        </p>
      )}

      {detection && detection.found && (
        <div className="mb-4 rounded-2xl bg-white p-4 ring-1 ring-app-line">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-bold leading-5 text-app-ink">{detection.label}</p>
              <p className="mt-0.5 text-[12.5px] leading-4 text-app-muted">{detection.appliance}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold ${
                detection.reading === "nameplate"
                  ? "bg-farad-sage text-farad-forest"
                  : "bg-farad-ambersoft text-farad-amber"
              }`}
            >
              {detection.reading === "nameplate" ? "Dari label daya" : "Perkiraan"}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-app-canvas px-3 py-3">
            <div>
              <dt className="text-[10.5px] text-app-muted">Daya semu</dt>
              <dd className="mt-0.5 text-[15px] font-bold tabular-nums text-app-ink">{formatVA(detection.va)} VA</dd>
            </div>
            <div>
              <dt className="text-[10.5px] text-app-muted">Daya nyata</dt>
              <dd className="mt-0.5 text-[15px] font-bold tabular-nums text-app-ink">{formatVA(detection.watts)} W</dd>
            </div>
            <div>
              <dt className="text-[10.5px] text-app-muted">Perkiraan</dt>
              <dd className="mt-0.5 text-[15px] font-bold tabular-nums text-app-ink">{Math.round(detection.duration_minutes)} m</dd>
            </div>
          </dl>

          {detection.note && (
            <p className="mt-3 text-[12.5px] leading-5 text-app-muted">{detection.note}</p>
          )}

          {detection.confidence !== "high" && (
            <p className="mt-2 text-[12px] leading-4 text-farad-amber">
              Farad belum yakin betul. Cek lagi angkanya di langkah berikutnya.
            </p>
          )}
        </div>
      )}

      {!preview && !scanning && (
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => camera.current?.click()}
            className="flex w-full items-center gap-3.5 rounded-2xl bg-white p-4 text-left outline-none ring-1 ring-app-line transition-colors duration-200 hover:bg-farad-sage/50 focus-visible:ring-2 focus-visible:ring-farad-primary/40 sm:gap-4 sm:p-5"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-farad-sage text-farad-forest">
              <Camera size={20} weight="bold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold leading-5 text-app-ink">Ambil foto sekarang</span>
              <span className="block text-[12.5px] leading-4 text-app-muted">
                Arahkan ke stiker daya di badan alatnya
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => gallery.current?.click()}
            className="flex w-full items-center gap-3.5 rounded-2xl bg-white p-4 text-left outline-none ring-1 ring-app-line transition-colors duration-200 hover:bg-farad-sage/50 focus-visible:ring-2 focus-visible:ring-farad-primary/40 sm:gap-4 sm:p-5"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-chip-1 text-chip-2i">
              <ImageIcon size={20} weight="bold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold leading-5 text-app-ink">Pilih foto dari perangkat</span>
              <span className="block text-[12.5px] leading-4 text-app-muted">JPG, PNG, atau WebP</span>
            </span>
          </button>
        </div>
      )}

      {preview && !scanning && (
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-[14px] font-bold text-app-ink outline-none ring-1 ring-app-line transition-colors hover:bg-app-canvas focus-visible:ring-2 focus-visible:ring-farad-primary/40"
          >
            <ArrowClockwise size={16} weight="bold" aria-hidden />
            Foto ulang
          </button>

          {usable && detection && (
            <button
              type="button"
              onClick={() => onUse(toCatalogItem(detection))}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-farad-forest px-5 py-3.5 text-[14px] font-bold text-white outline-none transition-transform hover:bg-farad-primary active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-farad-primary/40"
            >
              <CheckCircle size={16} weight="fill" aria-hidden />
              Pakai ini
            </button>
          )}
        </div>
      )}
    </div>
  );
}
