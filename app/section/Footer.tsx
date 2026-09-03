import Link from "next/link";
import FaradLogo from "../components/FaradLogo";

const linkGroups = [
  {
    heading: "Produk",
    links: [
      { label: "Home", href: "#product" },
      { label: "Planner", href: "#product" },
      { label: "Aktivitas", href: "#features" },
      { label: "Rumah Saya", href: "#cta" },
    ],
  },
  {
    heading: "Pelajari",
    links: [
      { label: "Cara kerja", href: "#how-it-works" },
      { label: "Perhitungan", href: "#energy" },
      { label: "Asumsi & batasan", href: "#energy" },
    ],
  },
  {
    heading: "Proyek",
    links: [
      { label: "Tentang Farad", href: "#problem" },
      { label: "SDG 7", href: "#problem" },
      { label: "Dokumentasi", href: "#" },
    ],
  },
];

const socials = [
  { label: "Instagram", short: "ig" },
  { label: "LinkedIn", short: "in" },
  { label: "X", short: "x" },
];

export default function Footer() {
  return (
    <footer className="relative bg-farad-ink text-white">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Link href="#top" aria-label="Beranda Farad" className="inline-flex">
              <FaradLogo size={26} />
            </Link>

            <p className="mt-6 max-w-xs text-sm leading-7 text-white/65">
              Perencana aktivitas listrik rumah. Menata giliran pemakaian supaya
              beban tidak menumpuk di jam yang sama — memakai kapasitas yang
              sudah ada, tanpa perangkat tambahan.
            </p>

            <div className="mt-8 flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.short}
                  href="#"
                  aria-label={social.label}
                  className="farad-press grid size-11 place-items-center rounded-full bg-white/10 text-sm font-bold lowercase text-white hover:bg-farad-peach hover:text-farad-ink"
                >
                  {social.short}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {linkGroups.map((group) => (
              <div key={group.heading}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-farad-peach">
                  {group.heading}
                </p>
                <ul className="mt-3 space-y-0.5 sm:mt-5 sm:space-y-1">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-block py-3 text-sm text-white/70 transition-colors duration-150 hover:text-white sm:py-1.5"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/65 sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()} Farad. Seluruh hak cipta
            dilindungi.
          </p>

          <div className="flex items-center gap-7">
            <Link
              href="#"
              className="inline-block py-3 transition-colors duration-150 hover:text-white sm:py-0"
            >
              Privasi
            </Link>
            <Link
              href="#"
              className="inline-block py-3 transition-colors duration-150 hover:text-white sm:py-0"
            >
              Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
