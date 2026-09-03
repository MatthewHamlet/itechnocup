type FaradLogoProps = {
  className?: string;
  size?: number;
};

export default function FaradLogo({
  className = "",
  size = 22,
}: FaradLogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      style={{ fontSize: size * 0.95 }}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className="shrink-0"
      >
        <path d="M13.6 2 5 13.2h5.5L9.6 22 19 10.5h-5.6L13.6 2Z" />
      </svg>
      <span className="font-extrabold tracking-tight">Farad</span>
    </span>
  );
}
