import FaradMark from "./FaradMark";

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
      <FaradMark size={size} />
      <span className="font-extrabold tracking-tight">Farad</span>
    </span>
  );
}
