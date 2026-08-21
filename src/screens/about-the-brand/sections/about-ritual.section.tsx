import { getTranslations } from "next-intl/server";

import { Picture } from "@/shared/components/ui/picture";
import { Reveal } from "@/shared/components/ui/reveal";
import { SplitText } from "@/shared/components/ui/split-text";

export async function AboutRitualSection() {
  const t = await getTranslations("aboutBrand.ritual");

  return (
    <section
      data-plumb-id="frame-2085667081"
      aria-labelledby="about-brand-ritual-title"
      className="flex w-full justify-center bg-warm py-[200px] px-4"
    >
      <div
        data-plumb-id="frame-2085667122"
        className="flex w-full max-w-content flex-col gap-[54px]"
      >
        <div className="flex w-full flex-col md:flex-row items-center md:items-end justify-between gap-4">
          <SplitText
            as="h2"
            data-plumb-id="lorem-ipsum-dolor-2"
            id="about-brand-ritual-title"
            className="font-display text-[clamp(3.25rem,6vw,5.25rem)] uppercase leading-[1.07]"
            by="words"
            stagger={40}
          >
            {t("title")}
          </SplitText>
          <SplitText
            as="p"
            data-plumb-id="lorem-ipsum-dolor-4"
            className="flex-1 pb-2 text-center md:text-right font-display text-[24px] leading-[1.33]"
            by="words"
            stagger={10}
          >
            {t("statement")}
          </SplitText>
        </div>

        <Reveal delay={120}>
          <Picture
            basePath="/images/about-brand/ritual-table-mobile"
            fallbackExtension="jpg"
            artDirected={[
              {
                basePath: "/images/about-brand/ritual-table-desktop",
                media: "(min-width: 500px)",
              },
            ]}
            alt={t("heroImageAlt")}
            loading="lazy"
            responsiveWidths={[640, 1000, 1400]}
            sizes="(max-width: 1000px) 100vw, 1000px"
            width={1000}
            height={972}
            className="aspect-396/700 md:aspect-1000/972 w-full object-cover"
            data-plumb-id="rectangle-4878-2"
            data-plumb-asset="c9671fa8e74583759e4aff7319996026f43c0655"
          />
        </Reveal>
      </div>
    </section>
  );
}
