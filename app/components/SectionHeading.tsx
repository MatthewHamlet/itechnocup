type SectionHeadingProps = {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={`${centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}
    >
      <span
        className={`inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-farad-primary ${
          centered ? "justify-center" : ""
        }`}
      >
        <span aria-hidden className="h-px w-7 bg-farad-peach" />
        {eyebrow}
      </span>

      <h2 className="mt-5 text-balance text-3xl font-bold leading-[1.08] tracking-tight text-farad-ink sm:text-4xl lg:text-[2.85rem]">
        {title}
      </h2>

      {lead && (
        <p
          className={`mt-5 text-base leading-7 text-farad-muted sm:text-[17px] ${
            centered ? "mx-auto max-w-xl" : "max-w-xl"
          }`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
