

export type SceneKind = "laundry" | "kitchen" | "water" | "calm";

const TONE = "#d8d3c8";

function Room() {
  return (
    <g>
      <rect x="286" y="26" width="248" height="212" rx="20" fillOpacity="0.5" />
      <rect x="302" y="42" width="216" height="180" rx="12" fillOpacity="0.34" />
      <rect x="406" y="42" width="7" height="180" fillOpacity="0.5" />
      <rect x="302" y="128" width="216" height="7" fillOpacity="0.5" />
      <rect x="272" y="238" width="268" height="13" rx="6.5" fillOpacity="0.6" />
      <rect x="0" y="446" width="520" height="7" rx="3.5" fillOpacity="0.5" />
    </g>
  );
}

function Shelf() {
  return (
    <g>
      <rect x="-10" y="152" width="172" height="11" rx="5.5" fillOpacity="0.45" />
      <rect x="36" y="112" width="24" height="40" rx="9" fillOpacity="0.5" />
      <rect x="74" y="124" width="17" height="28" rx="6" fillOpacity="0.42" />
      <rect x="103" y="118" width="20" height="34" rx="7" fillOpacity="0.38" />
    </g>
  );
}

function Laundry() {
  return (
    <g>

      <rect x="304" y="264" width="206" height="188" rx="28" fillOpacity="0.6" />
      <rect x="328" y="288" width="158" height="15" rx="7.5" fillOpacity="0.4" />
      <circle cx="482" cy="295" r="9" fillOpacity="0.45" />
      <circle
        cx="407"
        cy="374"
        r="62"
        fill="none"
        stroke={TONE}
        strokeWidth="11"
        strokeOpacity="0.55"
      />
      <circle
        cx="407"
        cy="374"
        r="40"
        fill="none"
        stroke={TONE}
        strokeWidth="6"
        strokeOpacity="0.34"
      />

      <path
        d="M-40 312 L236 270 q20 -3 20 13 t-20 15 L-40 338 Z"
        fillOpacity="0.5"
      />
      <path
        d="M28 330 L150 452"
        stroke={TONE}
        strokeWidth="10"
        strokeLinecap="round"
        strokeOpacity="0.42"
      />
      <path
        d="M168 300 L54 452"
        stroke={TONE}
        strokeWidth="10"
        strokeLinecap="round"
        strokeOpacity="0.42"
      />

      <path d="M112 262 q42 -26 88 -10 l10 18 q-48 8 -98 8 Z" fillOpacity="0.62" />
      <path
        d="M132 258 q22 -30 52 -14"
        fill="none"
        stroke={TONE}
        strokeWidth="9"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />

      <path d="M8 372 h150 l-16 80 h-118 Z" fillOpacity="0.45" />
      <rect x="-2" y="362" width="170" height="16" rx="8" fillOpacity="0.55" />
    </g>
  );
}

function Kitchen() {
  return (
    <g>
      <rect x="-20" y="300" width="352" height="19" rx="9.5" fillOpacity="0.6" />
      <rect x="-10" y="319" width="332" height="133" rx="20" fillOpacity="0.42" />
      <rect x="152" y="319" width="7" height="133" fillOpacity="0.38" />
      <rect x="118" y="356" width="60" height="8" rx="4" fillOpacity="0.45" />

      <rect x="58" y="238" width="126" height="62" rx="24" fillOpacity="0.6" />
      <rect x="48" y="226" width="146" height="17" rx="8.5" fillOpacity="0.5" />
      <circle cx="121" cy="222" r="10" fillOpacity="0.5" />
      <circle cx="160" cy="272" r="11" fillOpacity="0.36" />

      <path d="M226 258 h58 l10 42 h-78 Z" fillOpacity="0.5" />
      <rect x="234" y="248" width="42" height="12" rx="6" fillOpacity="0.55" />

      <rect x="304" y="286" width="212" height="166" rx="26" fillOpacity="0.4" />
      <rect x="330" y="316" width="160" height="7" rx="3.5" fillOpacity="0.34" />
    </g>
  );
}

function Water() {
  return (
    <g>

      <rect x="316" y="182" width="188" height="184" rx="30" fillOpacity="0.55" />
      <rect x="336" y="206" width="148" height="8" rx="4" fillOpacity="0.32" />
      <path
        d="M348 366 L336 452 M472 366 L484 452"
        stroke={TONE}
        strokeWidth="12"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />

      <path
        d="M316 268 H188 q-22 0 -22 24 V452"
        fill="none"
        stroke={TONE}
        strokeWidth="14"
        strokeLinecap="round"
        strokeOpacity="0.42"
      />
      <rect x="140" y="330" width="52" height="18" rx="9" fillOpacity="0.5" />

      <path d="M10 366 h122 l-14 86 h-94 Z" fillOpacity="0.45" />
      <rect x="0" y="356" width="142" height="16" rx="8" fillOpacity="0.55" />
      <path
        d="M18 358 q52 -46 106 0"
        fill="none"
        stroke={TONE}
        strokeWidth="8"
        strokeLinecap="round"
        strokeOpacity="0.36"
      />
    </g>
  );
}

function Calm() {
  return (
    <g>

      <path
        d="M404 300 V446"
        stroke={TONE}
        strokeWidth="11"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />
      <path d="M348 300 l24 -74 h64 l24 74 Z" fillOpacity="0.55" />
      <rect x="356" y="440" width="98" height="13" rx="6.5" fillOpacity="0.5" />

      <path d="M60 350 h116 l-16 102 h-84 Z" fillOpacity="0.48" />
      <rect x="48" y="338" width="140" height="17" rx="8.5" fillOpacity="0.58" />
      <path
        d="M118 338 V236 M118 276 q-52 -14 -66 -62 M118 262 q50 -18 62 -66"
        fill="none"
        stroke={TONE}
        strokeWidth="10"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />

      <rect x="-60" y="378" width="180" height="15" rx="7.5" fillOpacity="0.45" />
    </g>
  );
}

const SCENES: Record<SceneKind, () => React.JSX.Element> = {
  laundry: Laundry,
  kitchen: Kitchen,
  water: Water,
  calm: Calm,
};

export default function AdviceScene({
  scene,
  className = "",
}: {
  scene: SceneKind;
  className?: string;
}) {
  const Objects = SCENES[scene];

  return (
    <svg
      viewBox="0 0 520 520"
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <g fill={TONE}>
        {scene !== "kitchen" && <Room />}
        {scene === "kitchen" && (
          <rect x="0" y="446" width="520" height="7" rx="3.5" fillOpacity="0.5" />
        )}
        {scene === "laundry" && <Shelf />}
        <Objects />
      </g>
    </svg>
  );
}
