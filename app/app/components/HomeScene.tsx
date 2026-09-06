export default function HomeScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 900 340"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <defs>
        <linearGradient id="hs-wall" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#8a6746" stopOpacity="0.16" />
          <stop offset="0.55" stopColor="#a17d57" stopOpacity="0.12" />
          <stop offset="1" stopColor="#c19a70" stopOpacity="0.1" />
        </linearGradient>

        <linearGradient id="hs-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a5637" stopOpacity="0.3" />
          <stop offset="1" stopColor="#8f6a45" stopOpacity="0.18" />
        </linearGradient>

        <linearGradient id="hs-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c98f52" stopOpacity="0.4" />
          <stop offset="1" stopColor="#e8b877" stopOpacity="0.22" />
        </linearGradient>

        <radialGradient id="hs-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f6c445" stopOpacity="0.42" />
          <stop offset="1" stopColor="#f6c445" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="hs-beam" x1="1" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#f2c78a" stopOpacity="0.34" />
          <stop offset="1" stopColor="#f2c78a" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="900" height="340" fill="url(#hs-wall)" />

      <g opacity="0.9">
        <rect x="676" y="30" width="180" height="196" rx="16" fill="#8a6746" fillOpacity="0.26" />
        <rect x="688" y="42" width="156" height="172" rx="10" fill="url(#hs-dusk)" />
        <circle cx="800" cy="92" r="20" fill="#f6c445" fillOpacity="0.5" />
        <circle cx="800" cy="92" r="62" fill="url(#hs-glow)" />
        <path
          d="M688 168 q34 -28 68 -6 q28 18 54 -8 l34 -18 v78 H688 Z"
          fill="#6f5236"
          fillOpacity="0.24"
        />
        <rect x="758" y="42" width="8" height="172" fill="#8a6746" fillOpacity="0.3" />
        <rect x="688" y="120" width="156" height="8" fill="#8a6746" fillOpacity="0.3" />
        <rect x="664" y="222" width="204" height="11" rx="5.5" fill="#7a5637" fillOpacity="0.3" />
      </g>

      <g opacity="0.72">
        <path d="M700 233 L548 340 L376 340 L656 233 Z" fill="url(#hs-beam)" />
        <path d="M824 233 L748 340 L614 340 L774 233 Z" fill="url(#hs-beam)" />
      </g>

      <g opacity="0.92">
        <rect x="24" y="150" width="196" height="18" rx="9" fill="#8a6746" fillOpacity="0.3" />
        <rect x="44" y="168" width="10" height="112" rx="5" fill="#7a5637" fillOpacity="0.3" />
        <rect x="190" y="168" width="10" height="112" rx="5" fill="#7a5637" fillOpacity="0.3" />
        <rect x="66" y="176" width="46" height="58" rx="8" fill="#a17d57" fillOpacity="0.26" />
        <rect x="126" y="176" width="46" height="58" rx="8" fill="#a17d57" fillOpacity="0.26" />
        <circle cx="106" cy="205" r="4" fill="#6f5236" fillOpacity="0.4" />
        <circle cx="132" cy="205" r="4" fill="#6f5236" fillOpacity="0.4" />
      </g>

      <g opacity="0.9">
        <rect x="256" y="238" width="86" height="42" rx="10" fill="#8a6746" fillOpacity="0.3" />
        <rect x="266" y="216" width="66" height="24" rx="8" fill="#a17d57" fillOpacity="0.28" />
        <circle cx="282" cy="228" r="5" fill="#6f5236" fillOpacity="0.4" />
        <circle cx="300" cy="228" r="5" fill="#6f5236" fillOpacity="0.4" />
        <rect x="276" y="192" width="46" height="24" rx="7" fill="#c19a70" fillOpacity="0.3" />
      </g>

      <g opacity="0.88">
        <path d="M392 280 h52 l-7 -46 h-38 Z" fill="#8a6746" fillOpacity="0.32" />
        <g stroke="#7d6a45" strokeOpacity="0.36" strokeWidth="7" fill="none" strokeLinecap="round">
          <path d="M418 234 v-46" />
          <path d="M418 212 q-24 -12 -30 -38" />
          <path d="M418 200 q24 -16 32 -42" />
        </g>
        <ellipse cx="384" cy="164" rx="14" ry="8" fill="#8d7a4f" fillOpacity="0.3" transform="rotate(-28 384 164)" />
        <ellipse cx="452" cy="154" rx="15" ry="8" fill="#8d7a4f" fillOpacity="0.3" transform="rotate(26 452 154)" />
        <ellipse cx="418" cy="182" rx="12" ry="7" fill="#8d7a4f" fillOpacity="0.32" />
      </g>

      <g opacity="0.9">
        <rect x="500" y="252" width="14" height="28" rx="5" fill="#7a5637" fillOpacity="0.32" />
        <rect x="486" y="276" width="42" height="8" rx="4" fill="#7a5637" fillOpacity="0.32" />
        <path d="M480 252 q27 -46 54 0 Z" fill="#f6c445" fillOpacity="0.3" />
        <circle cx="507" cy="248" r="46" fill="url(#hs-glow)" />
      </g>

      <rect y="278" width="900" height="62" fill="url(#hs-floor)" />
      <rect y="278" width="900" height="2" fill="#6f5236" fillOpacity="0.28" />
      <ellipse cx="450" cy="314" rx="236" ry="28" fill="#6f5236" fillOpacity="0.12" />
      <ellipse cx="450" cy="314" rx="198" ry="20" fill="#c19a70" fillOpacity="0.14" />
    </svg>
  );
}
