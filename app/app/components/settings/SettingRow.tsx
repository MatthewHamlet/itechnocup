"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export default function SettingRow({
  icon,
  title,
  description,
  value,
  trailing,
  interactive = false,
  onClick,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  value?: string;
  trailing?: ReactNode;
  interactive?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <>
      {icon}
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[15px] font-medium leading-6 text-app-ink">
          {title}
        </span>
        {description && (
          <span className="mt-0.5 block text-[13.5px] leading-5 text-app-muted">
            {description}
          </span>
        )}
      </span>

      {value && (
        <span className="shrink-0 text-[14px] tabular-nums text-app-muted">{value}</span>
      )}

      {trailing}

      {interactive && !trailing && (
        <ChevronRight
          size={18}
          strokeWidth={2}
          className="shrink-0 text-app-dim transition-transform duration-200 group-hover/row:translate-x-0.5 group-hover/row:text-app-muted"
        />
      )}
    </>
  );

  const shell =
    "group/row flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-200";

  if (!interactive) {
    return <div className={shell}>{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${shell} outline-none hover:bg-app-canvas/50 focus-visible:bg-app-canvas/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-farad-primary/40`}
    >
      {body}
    </button>
  );
}
