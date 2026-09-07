"use client";

import { useRef, useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Camera, Check, ChevronRight, Database, House, Info, Palette, Pencil, ShieldCheck, UserRound } from "lucide-react";
import FaradMark from "@/app/components/FaradMark";
import PageHeader, { PAGE_SHELL } from "./PageHeader";
import { savePreferences, useAccount, usePreferences } from "./AppPreferences";
import { compressImage, type CompressedImage } from "./compress-image";
import { saveProfileAction } from "../actions";
import { usePlan } from "./PlanProvider";
import { formatVA } from "./plan-model";
import SettingRow from "./settings/SettingRow";
import { signOut } from "@/app/masuk/actions";
import Toggle from "./settings/Toggle";
import styles from "./SettingsView.module.css";

const SECTIONS = [
  { id: "profile", title: "Profil", description: "Sapaan yang terasa lebih personal.", icon: UserRound, tone: "blue" },
  { id: "appearance", title: "Tampilan", description: "Atur kenyamanan saat menggunakan Farad.", icon: Palette, tone: "purple" },
  { id: "data", title: "Data di perangkat", description: "Kenali apa yang tersimpan di browser ini.", icon: Database, tone: "sand" },
  { id: "about", title: "Tentang Farad", description: "Teman merencanakan listrik di rumah.", icon: Info, tone: "ice" },
] as const;
type SectionId = typeof SECTIONS[number]["id"];

export default function SettingsView({ email = null }: { email?: string | null }) {
  const [selected, setSelected] = useState<SectionId>("profile");
  const { name } = usePreferences();
  const { avatarUrl: accountAvatar } = useAccount();
  const { household } = usePlan();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const section = SECTIONS.find((item) => item.id === selected)!;
  const Icon = section.icon;

  function onKey(event: KeyboardEvent, index: number) {
    const last = SECTIONS.length - 1;
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % SECTIONS.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index + last) % SECTIONS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;
    event.preventDefault();
    setSelected(SECTIONS[next].id);
    buttons.current[next]?.focus();
  }

  return (
    <div className={PAGE_SHELL}>
      <PageHeader tone="ice" eyebrow="Farad" title="Pengaturan" subtitle="Sedikit sentuhanmu, lebih nyaman setiap hari." />
      <div className={styles.layout}>
        <aside className={styles.rail}>
          <div className={styles.profile}>
            {accountAvatar
              ? <img src={accountAvatar} alt="" className={styles.avatar} />
              : <div className={styles.avatar} aria-hidden>{Array.from(name)[0]?.toUpperCase()}</div>}
            <div className={styles.profileCopy}><h2>{name}</h2><p><span /> {email ? "Tersimpan di akunmu" : "Profil di perangkat ini"}</p></div>
            <button className={styles.edit} type="button" aria-label="Ubah profil" onClick={() => { setSelected("profile"); buttons.current[0]?.focus(); }}><Pencil size={16} /></button>
          </div>
          <div className={styles.houseSummary}><House size={18} aria-hidden /><div><p>Rumah saya</p><strong>{formatVA(household.installedVA)} <span>VA terpasang</span></strong></div></div>
          <p className={styles.groupLabel}>PREFERENSI SAYA</p>
          <div role="tablist" aria-label="Kategori pengaturan" className={styles.tabs}>
            {SECTIONS.map((item, index) => {
              const ItemIcon = item.icon;
              return <button key={item.id} ref={(node) => { buttons.current[index] = node; }} type="button" role="tab" id={`settings-tab-${item.id}`} aria-controls="settings-panel" aria-selected={selected === item.id} tabIndex={selected === item.id ? 0 : -1} onKeyDown={(event) => onKey(event, index)} onClick={() => setSelected(item.id)} className={styles.tab}>
                <span className={styles.icon} data-tone={item.tone}><ItemIcon size={19} aria-hidden /></span><span>{item.title}</span><ChevronRight size={16} className={styles.chevron} aria-hidden />
              </button>;
            })}
          </div>
          <div className={styles.railFooter}><FaradMark size={15} /><span>Farad</span></div>
        </aside>
        <section id="settings-panel" role="tabpanel" aria-labelledby={`settings-tab-${selected}`} tabIndex={0} className={styles.panel}>
          <div className={styles.panelHeader}><span className={styles.icon} data-tone={section.tone}><Icon size={23} aria-hidden /></span><div><h2>{section.title}</h2><p>{section.description}</p></div></div>
          {selected === "profile" && <ProfileForm key={name} />}
          {selected === "appearance" && <Appearance />}
          {selected === "data" && <DataPanel email={email} />}
          {selected === "about" && <AboutPanel />}
        </section>
      </div>
    </div>
  );
}

function ProfileForm() {
  const { name } = usePreferences();
  const { avatarUrl, signedIn } = useAccount();
  const router = useRouter();
  const picker = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(name);
  const [photo, setPhoto] = useState<CompressedImage | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, startSaving] = useTransition();

  const preview = photo?.dataUrl ?? avatarUrl;
  const dirty = draft.trim() !== name || photo !== null;

  async function pick(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      setPhoto(await compressImage(file, 512));
    } catch {
      setError("Fotonya tidak bisa dibuka. Coba pilih file lain.");
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;

    if (!signedIn) {
      const saved = savePreferences({ name: draft });
      setError(saved ? "" : "Nama belum tersimpan. Periksa izin penyimpanan browser, lalu coba lagi.");
      setFeedback(saved ? "Nama tersimpan di browser ini." : "");
      return;
    }

    startSaving(async () => {
      const result = await saveProfileAction({
        name: draft,
        avatar: photo ? { base64: photo.base64, mediaType: photo.mediaType } : null,
      });

      if (!result.ok) {
        setError(result.error ?? "Profil belum tersimpan.");
        return;
      }

      savePreferences({ name: draft });
      setPhoto(null);
      setError("");
      setFeedback("Profil tersimpan di akunmu.");
      router.refresh();
    });
  }

  return <form className={styles.body} onSubmit={submit}>
    <div className={styles.profilePreview}>
      {preview
        ? <img src={preview} alt="" className={styles.previewAvatar} />
        : <span className={styles.previewAvatar} aria-hidden>{Array.from(draft.trim() || name)[0]?.toUpperCase()}</span>}
      <div><span className={styles.eyebrow}>SAPAAN DI HOME</span><p>Selamat pagi, <strong>{draft.trim() || name}</strong> <span aria-hidden>👋</span></p></div>
    </div>

    <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => pick(event.target.files?.[0])} />

    <div className={styles.field}>
      <label htmlFor="profile-name">Nama panggilan</label>
      <p>Nama ini muncul di Home dan profilmu.</p>
      <input id="profile-name" autoComplete="given-name" maxLength={40} required value={draft} onChange={(event) => { setDraft(event.target.value); setError(""); setFeedback(""); }} />
      <span className={styles.fieldHint}>Maksimal 40 karakter.</span>
    </div>

    <div className={styles.rows}>
      <SettingRow
        icon={<Camera size={19} aria-hidden />}
        title="Foto profil"
        description={signedIn ? "Ambil dari galeri, tersimpan di akunmu." : "Masuk dulu untuk menyimpan foto profil."}
        interactive={signedIn}
        onClick={() => picker.current?.click()}
        value={!signedIn ? "Perlu masuk" : photo ? "Foto baru" : avatarUrl ? "Terpasang" : "Belum ada"}
      />
    </div>

    <div className={styles.actions}>
      <button type="submit" disabled={saving || !dirty || !draft.trim()} className={styles.save}>
        <Check size={17} aria-hidden />{saving ? "Menyimpan…" : dirty ? "Simpan perubahan" : "Profil tersimpan"}
      </button>
      {dirty && !saving && <button type="button" className={styles.cancel} onClick={() => { setDraft(name); setPhoto(null); setError(""); }}>Batalkan</button>}
    </div>

    {(error || feedback) && <p role="status" className={styles.feedback}>{error || feedback}</p>}
  </form>;
}

function Appearance() {
  const preferences = usePreferences();
  const [feedback, setFeedback] = useState("");
  function change(key: "reduceMotion" | "strongText", next: boolean) {
    setFeedback(savePreferences({ [key]: next }) ? "Preferensi tampilan tersimpan." : "Belum bisa menyimpan. Periksa izin penyimpanan browser.");
  }
  return <div className={styles.body}>
    <div className={styles.palettePreview}><div><span className={styles.eyebrow}>PALET FARAD</span><h3>Tenang, ringan, lebih fokus.</h3><p>Biru lembut dengan sentuhan warna di setiap halaman.</p></div><div className={styles.swatches} aria-label="Biru, lavender, peach, dan biru es"><span /><span /><span /><span /></div></div>
    <div className={styles.rows}>
      <SettingRow title="Teks lebih tegas" description="Pertebal teks dan perjelas warna keterangan." trailing={<Toggle checked={preferences.strongText} onChange={(next) => change("strongText", next)} label="Teks lebih tegas" />} />
      <SettingRow title="Kurangi animasi" description="Minimalkan gerakan saat berpindah dan berinteraksi." trailing={<Toggle checked={preferences.reduceMotion} onChange={(next) => change("reduceMotion", next)} label="Kurangi animasi" />} />
    </div>
    <p className={styles.fieldHint}>Saat opsi animasi mati, Farad mengikuti preferensi gerakan perangkatmu.</p>
    <p role="status" className={styles.feedback}>{feedback}</p>
  </div>;
}

function DataPanel({ email }: { email: string | null }) {
  const { household } = usePlan();
  return <div className={styles.body}>
    <div className={styles.info}><ShieldCheck size={22} aria-hidden /><p>Nama, preferensi tampilan, dan pengaturan rumah disimpan di browser ini. Data tersebut belum tersinkron ke perangkat lain.</p></div>
    <div className={styles.rows}>
      <SettingRow title="Profil & tampilan" description="Nama panggilan, teks, dan animasi." value="Lokal" />
      <SettingRow title="Pengaturan rumah" description={`Daya ${formatVA(household.installedVA)} VA, beban dasar, dan cadangan.`} value="Lokal" />
      <SettingRow title="Rencana kegiatan" description="Perubahan kegiatan berlaku selama sesi ini. Memuat ulang halaman mengembalikan kegiatan awal." />
    </div>
    <p className={styles.groupLabel}>AKUN</p>
    <div className={styles.rows}>
      <SettingRow title="Masuk sebagai" description={email ?? "Belum masuk. Rencana tetap bisa dipakai di perangkat ini."} value={email ? "Supabase" : undefined} />
    </div>
    {email && <form action={signOut}><button type="submit" className={styles.inlineLink}>Keluar dari akun <ArrowUpRight size={17} aria-hidden /></button></form>}
    <Link href="/app/rumah" className={styles.inlineLink}>Kelola pengaturan rumah <ArrowUpRight size={17} aria-hidden /></Link>
  </div>;
}

function AboutPanel() {
  return <div className={styles.body}>
    <div className={styles.aboutBrand}><span><FaradMark size={26} /></span><div><h3>Farad</h3><p>Ruang untuk setiap kegiatan.</p></div></div>
    <p className={styles.aboutCopy}>Farad membantu kamu merencanakan kegiatan yang memakai listrik, melihat jam yang padat, dan mengatur giliran sesuai kapasitas rumah.</p>
    <div className={styles.rows}><SettingRow title="Perencanaan dari rumahmu" description="Perhitungan memakai daya alat, durasi, dan pengaturan rumah yang kamu isi; bukan pembacaan meter listrik langsung." /></div>
    <Link href="/app" className={styles.inlineLink}>Lihat rencana di Home <ArrowUpRight size={17} aria-hidden /></Link>
  </div>;
}
