export const FARAD_BOLT = "M13.6 2 5 13.2h5.5L9.6 22 19 10.5h-5.6L13.6 2Z";

export default function FaradMark({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={`shrink-0 ${className}`}
    >
      <path d={FARAD_BOLT} />
    </svg>
  );
}
