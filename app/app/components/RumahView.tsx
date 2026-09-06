"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { calculatePlanningLimitVA } from "@/lib/farad";
import Image from "next/image";
import { ArrowRight, Check, HouseLine, Info, Lightning, Plug, ShieldCheck, SlidersHorizontal } from "@phosphor-icons/react";
import PageHeader, { PAGE_SHELL } from "./PageHeader";
import { usePlan } from "./PlanProvider";
import { formatVA } from "./plan-model";
import { validHousehold } from "./household-settings";

import styles from "./RumahView.module.css";
const CAPACITIES = [450, 900, 1300, 2200, 3500, 5500];

export default function RumahView({ onboarding = false }: { onboarding?: boolean }) {
  const { household } = usePlan();
  return <HouseholdForm onboarding={onboarding} key={`${household.installedVA}-${household.baseLoadVA}-${household.reserveFraction}`} />;
}

function HouseholdForm({ onboarding }: { onboarding: boolean }) {
  const { household, updateHousehold, planningLimitVA } = usePlan();
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const [capacity, setCapacity] = useState(household.installedVA);
  const [base, setBase] = useState(String(household.baseLoadVA));
  const [reservePercent, setReservePercent] = useState(Math.round(household.reserveFraction * 100));
  const [message, setMessage] = useState("");
  const baseLoad = base.trim() === "" ? NaN : Number(base);
  const draft = { installedVA: capacity, baseLoadVA: baseLoad, reserveFraction: reservePercent / 100 };
  const valid = validHousehold(draft);
  const limit = calculatePlanningLimitVA({ ...draft, baseLoadVA: 0 });
  const reserve = capacity - limit;
  const room = Math.max(0, limit - (Number.isFinite(baseLoad) ? baseLoad : 0));
  const dirty = capacity !== household.installedVA || baseLoad !== household.baseLoadVA || reservePercent !== Math.round(household.reserveFraction * 100);
  const segments = [
    { label: "Beban dasar", hint: "Sudah dipakai sehari-hari", value: Number.isFinite(baseLoad) ? Math.max(0, baseLoad) : 0, color: "#a9b9c8" },
    { label: "Ruang kegiatan", hint: "Untuk kegiatan yang kamu atur", value: room, color: "#608aad" },
    { label: "Cadangan", hint: "Ruang ekstra yang disisihkan", value: reserve, color: "#d8b879" },
  ];
  const baseError = !Number.isInteger(baseLoad) || baseLoad < 0
    ? "Isi beban dasar dengan angka bulat, minimal 0 VA."
    : baseLoad >= limit
      ? `Beban dasar harus di bawah batas rencana ${formatVA(limit)} VA.`
      : "";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;
    startSaving(async () => {
      if (!(await updateHousehold(draft))) {
        setMessage("Belum bisa menyimpan. Coba lagi sebentar lagi.");
        return;
      }
      setMessage("");
      if (onboarding) router.push("/app/aktivitas?onboarding=1");
    });
  }

  function cancel() {
    setCapacity(household.installedVA);
    setBase(String(household.baseLoadVA));
    setReservePercent(Math.round(household.reserveFraction * 100));
    setMessage("");
  }

  return (
    <div className={PAGE_SHELL}>
      <PageHeader
        eyebrow={onboarding ? "Langkah 1 dari 2" : "Farad"}
        title="Rumah Saya"
        subtitle={onboarding ? "Isi dulu daya rumahmu, supaya Farad tahu ruang yang tersedia." : "Rumah yang kamu kenal. Rencana yang lebih pas."}
      />
      <div className={styles.grid}>
        <div className={styles.overview}>
          <section aria-label="Profil listrik rumah" className={styles.hero}>
            <div className={styles.heroTop}>
              <span className={styles.heroLabel}><HouseLine size={19} weight="duotone" aria-hidden /> Profil rumah</span>
            </div>
            <div className={styles.scene}>
              <div className={styles.heroCopy}>
                <p>Daya terpasang</p>
                <p className={styles.capacity}>{formatVA(household.installedVA)}<span>VA</span></p>
                <p className={styles.heroCaption}>Ruang untuk semua kegiatan di rumahmu.</p>
              </div>
              <Image src="/home.png" alt="" loading="eager" width={1536} height={1024} sizes="(min-width: 1600px) 510px, (min-width: 1024px) 440px, 85vw" className={styles.house} />
            </div>
            <dl className={styles.stats}>
              {[
                { label: "Beban dasar", value: `${formatVA(household.baseLoadVA)} VA` },
                { label: "Cadangan", value: `${Math.round(household.reserveFraction * 100)}%` },
                { label: "Batas rencana", value: `${formatVA(planningLimitVA)} VA` },
              ].map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
            </dl>
          </section>
          <section aria-labelledby="capacity-breakdown" className={`${styles.panel} ${styles.breakdown}`}>
            <div className={styles.sectionHeading}>
              <h2 id="capacity-breakdown" className={styles.heading}>Ruang listrikmu</h2>
            </div>
            <p className={styles.description}>Satu kapasitas, dibagi sesuai kebutuhan.</p>
            <div className={styles.chartRow}>
              <div className={styles.chart} role="img" aria-label={valid ? `${formatVA(room)} VA ruang kegiatan, ${formatVA(baseLoad)} VA beban dasar, ${formatVA(reserve)} VA cadangan` : "Periksa beban dasar untuk melihat pembagian kapasitas"}>
                <svg viewBox="0 0 200 200" aria-hidden className="size-full -rotate-90">
                  <circle cx="100" cy="100" r="83" fill="none" stroke="#edf1f5" strokeWidth="15" />
                  {valid && segments.map((segment, index) => {
                    const circumference = 2 * Math.PI * 83;
                    const length = segment.value / capacity * circumference;
                    const offset = segments.slice(0, index).reduce((sum, s) => sum + s.value, 0) / capacity * circumference;
                    return <circle key={segment.label} cx="100" cy="100" r="83" fill="none" stroke={segment.color} strokeWidth="15" strokeLinecap="butt" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} opacity={length > 0 ? 1 : 0} />;
                  })}
                </svg>
                <div aria-hidden className={styles.chartCenter}>
                  <Lightning size={18} weight="duotone" className="text-farad-primary" />
                  <p className={styles.chartNumber}>{valid ? formatVA(room) : "—"}<span>VA</span></p>
                  <p className={styles.chartCaption}>untuk kegiatan</p>
                </div>
              </div>
              <dl className={styles.legend}>
                {segments.map((segment) => <div key={segment.label} className={styles.legendRow}>
                  <span aria-hidden className={styles.dot} style={{ background: segment.color }} />
                  <div className={styles.legendCopy}><dt>{segment.label}</dt><p>{segment.hint}</p></div>
                  <dd>{valid ? formatVA(segment.value) : "—"}<span>VA</span></dd>
                </div>)}
              </dl>
            </div>
            <div className={styles.note}><Info size={16} aria-hidden /><p>Batas rencana <strong>{formatVA(limit)} VA</strong> mencakup beban dasar dan kegiatan. Cadangan tetap di luar batas ini.</p></div>
          </section>
        </div>
        <form onSubmit={submit} className={`${styles.panel} ${styles.form}`} aria-label="Pengaturan listrik">
          <div className={styles.formHeader}>
            <span className={styles.formIcon}><SlidersHorizontal size={23} aria-hidden /></span>
            <div><h2 className={styles.heading}>Pengaturan listrik</h2><p className={styles.description}>Sesuaikan dengan rumahmu.</p></div>
          </div>
          <fieldset>
            <legend className={styles.fieldLabel}><Lightning size={17} weight="duotone" aria-hidden /> Daya terpasang</legend>
            <p id="capacity-help" className={styles.description}>Cek daya rumah di meter atau aplikasi PLN Mobile.</p>
            <div className={styles.choices}>
              {Array.from(new Set([...CAPACITIES, household.installedVA])).sort((a, b) => a - b).map((value) => <label key={value} className={styles.choice}>
                <input type="radio" name="capacity" value={value} checked={capacity === value} onChange={() => { setCapacity(value); setMessage(""); }} aria-describedby="capacity-help" />
                <span>{formatVA(value)} <small>VA</small></span>
              </label>)}
            </div>
          </fieldset>
          <div className={styles.field}>
            <label htmlFor="base-load" className={styles.fieldLabel}><Plug size={17} weight="duotone" aria-hidden /> Beban dasar</label>
            <p id="base-help" className={styles.description}>Perkiraan alat yang tetap menyala, seperti kulkas, lampu, dan Wi-Fi.</p>
            <div className={styles.inputWrap}>
              <input id="base-load" type="number" inputMode="numeric" min="0" max={Math.ceil(limit) - 1} step="1" required value={base} onChange={(event) => { setBase(event.target.value); setMessage(""); }} aria-describedby={`base-help${baseError ? " base-error" : ""}`} aria-invalid={!!baseError} className={styles.input} />
              <span className={styles.unit}>VA</span>
            </div>
            {baseError && <p id="base-error" role="alert" className={styles.error}>{baseError}</p>}
          </div>
          <div className={styles.field}>
            <div className={styles.reserveHeader}><label htmlFor="reserve" className={styles.fieldLabel}><ShieldCheck size={17} weight="duotone" aria-hidden /> Cadangan daya</label><output htmlFor="reserve">{reservePercent}%</output></div>
            <p id="reserve-help" className={styles.description}>Sisihkan ruang untuk perubahan beban di luar rencana.</p>
            <input id="reserve" type="range" min="0" max="30" step="5" value={reservePercent} onChange={(event) => { setReservePercent(Number(event.target.value)); setMessage(""); }} aria-describedby="reserve-help" aria-valuetext={`${reservePercent} persen, ${formatVA(reserve)} VA`} className={styles.range} />
            <div className={styles.rangeLabels}><span>0%</span><span>15%</span><span>30%</span></div>
          </div>
          <div className={styles.formBottom}>
            <div className={styles.limit}><div><p className={styles.limitLabel}>Batas rencana</p><p className={styles.limitHint}>Daya terpasang − cadangan</p></div><p className={styles.limitValue}>{formatVA(limit)}<span>VA</span></p></div>
            <div className={styles.actions}>
              {dirty && <button type="button" onClick={cancel} className={styles.cancel}>Batalkan</button>}
              <button type="submit" disabled={saving || (!onboarding && !dirty) || !valid} className={styles.save}>
                {onboarding ? <ArrowRight size={17} weight="bold" aria-hidden /> : <Check size={17} weight="bold" aria-hidden />}
                {saving ? "Menyimpan…" : onboarding ? "Simpan & lanjut" : dirty ? "Simpan" : "Simpan perubahan"}
              </button>
            </div>
            <p role="status" aria-live="polite" className={`${styles.saveStatus}${message ? ` ${styles.error}` : ""}`}>{message || (onboarding ? "Bisa diubah lagi kapan saja dari halaman ini." : "Perubahan diterapkan setelah kamu simpan.")}</p>
          </div>
        </form>
      </div>
    </div>
  );
}
