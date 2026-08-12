import { getTranslations } from "next-intl/server";

import { Picture } from "@/shared/components/ui/picture";

export async function AboutSelectionSection() {
  const t = await getTranslations("aboutProduct.quality");

  return (
    <section data-plumb-id="frame-2085667073" aria-labelledby="quality-title" className="flex min-h-[2270px] items-center justify-center bg-warm py-24 lg:py-[200px]">
      <div className="mx-auto w-full max-w-[1000px] px-6 md:px-0">
        <div className="grid items-start gap-10 md:grid-cols-[2fr_1fr] lg:grid-cols-[700px_1fr]">
          <h2 data-plumb-id="lorem-ipsum-dolor-18" id="quality-title" className="font-display text-[clamp(3.5rem,6vw,5.25rem)] uppercase leading-[1.07]">{t("title")}</h2>
          <p className="font-sans text-sm leading-[1.43] text-muted-ink">{t("description")}</p>
        </div>
        <div className="mt-[87px] space-y-24">
          <article className="grid items-center gap-12 md:grid-cols-2">
            <div><h3 data-plumb-id="lorem-ipsum-dolor-20" className="font-display text-[32px] leading-none">{t("consideration.title")}</h3><p className="mt-6 font-sans text-sm leading-[1.43] text-muted-ink">{t("consideration.description")}</p></div>
            <Picture basePath="/images/about-product/quality-careful-consideration" fallbackExtension="jpg" alt={t("consideration.imageAlt")} width={940} height={1400} sizes="(max-width: 767px) 100vw, 470px" pictureClassName="block" className="aspect-[47/70] size-full rounded-brand object-cover" />
          </article>
          <article className="grid items-center gap-12 md:grid-cols-2">
            <Picture basePath="/images/about-product/quality-salting-process" fallbackExtension="jpg" alt={t("salting.imageAlt")} width={940} height={1400} sizes="(max-width: 767px) 100vw, 470px" pictureClassName="block" className="aspect-[47/70] size-full rounded-brand object-cover" />
            <div><h3 data-plumb-id="lorem-ipsum-dolor-22" className="font-display text-[32px] leading-none">{t("salting.title")}</h3><p className="mt-6 font-sans text-sm leading-[1.43] text-muted-ink">{t("salting.description")}</p></div>
          </article>
        </div>
      </div>
    </section>
  );
}
