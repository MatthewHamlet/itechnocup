import { Zap } from "lucide-react";

type MascotMarkProps = {
  size?: number;
  className?: string;
  ring?: boolean;
};

export default function MascotMark({
  size = 40,
  className = "",
  ring = true,
}: MascotMarkProps) {
  return (
    <span
      aria-hidden
      className={`relative grid shrink-0 place-items-center rounded-full ${
        ring ? "border-2 border-dashed border-current" : ""
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <Zap size={Math.round(size * 0.42)} strokeWidth={1.8} />
    </span>
  );
}
