import type { Icon } from "@phosphor-icons/react";

export default function PagePlaceholder({
  icon: PageIcon,
  title,
  body,
}: {
  icon: Icon;
  title: string;
  body: string;
}) {
  return (
    <div className="px-4 pb-12 pt-6 sm:px-6 md:px-8 md:pt-10 xl:px-12 xl:pt-12">
      <div className="grid min-h-[60vh] place-items-center rounded-[28px] bg-white p-8 text-center ring-1 ring-app-line">
        <div className="max-w-sm">
          <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-app-canvas text-farad-forest">
            <PageIcon size={30} weight="fill" />
          </span>
          <h1 className="mt-6 text-[24px] font-extrabold tracking-tight text-app-ink">
            {title}
          </h1>
          <p className="mt-3 text-[14.5px] leading-6 text-app-muted">{body}</p>
        </div>
      </div>
    </div>
  );
}
