import { getTranslations } from "next-intl/server";

import { Picture } from "@/shared/components/ui/picture";

const milestones = [
  { key: "early", image: "cultivation-year-0-12" },
  { key: "mature", image: "cultivation-year-12-20" },
  { key: "harvest", image: "cultivation-year-20" },
] as const;

export async function AboutCultivationSection() {
  const t = await getTranslations("aboutProduct.cultivation");

  return (
    <section data-plumb-id="frame-2085667072" aria-labelledby="cultivation-title" className="flex min-h-[2242px] flex-col items-center justify-center bg-warm py-24 lg:py-[200px]">
      <div className="mx-auto w-full max-w-[1000px] px-6 md:px-0">
        <h2 data-plumb-id="lorem-ipsum-dolor-6" id="cultivation-title" className="max-w-[600px] font-display text-[clamp(3.5rem,6vw,5.25rem)] uppercase leading-[1.07]">{t("title")}</h2>
        <div className="mt-[54px] space-y-[54px]">
          {milestones.map((milestone, index) => (
            <article key={milestone.key} className="grid items-center gap-10 md:grid-cols-2 md:gap-[60px]">
              <div className={index % 2 === 0 ? "md:order-1" : "md:order-2"}>
                <h3 data-plumb-id={`lorem-ipsum-dolor-${8 + index * 2}`} className="font-display text-[32px] leading-none">{t(`${milestone.key}.title`)}</h3>
                <p className="mt-6 font-sans text-sm leading-[1.43] text-muted-ink">{t(`${milestone.key}.description`)}</p>
              </div>
              <Picture basePath={`/images/about-product/${milestone.image}`} fallbackExtension="png" alt={t(`${milestone.key}.imageAlt`)} width={940} height={1000} sizes="(max-width: 767px) 100vw, 470px" pictureClassName={index % 2 === 0 ? "block md:order-2" : "block md:order-1"} className="aspect-[47/50] size-full rounded-brand object-contain" data-plumb-id={index === 0 ? "image-20" : `image-20-${index + 1}`} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
