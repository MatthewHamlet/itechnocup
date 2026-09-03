import type { LucideIcon } from "lucide-react";

type BlobProps = {
  icon?: LucideIcon;
  className?: string;
  fill?: string;
  iconClassName?: string;
  iconSize?: number;
  variant?: "a" | "b";
};

export default function Blob({
  icon: Icon,
  className = "",
  fill = "bg-farad-sage",
  iconClassName = "text-farad-forest",
  iconSize = 22,
  variant = "a",
}: BlobProps) {
  return (
    <span
      aria-hidden
      className={`grid place-items-center ${
        variant === "a" ? "farad-blob" : "farad-blob-alt"
      } ${fill} ${className}`}
    >
      {Icon ? (
        <Icon size={iconSize} strokeWidth={1.6} className={iconClassName} />
      ) : null}
    </span>
  );
}
