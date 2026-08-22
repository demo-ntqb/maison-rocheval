import { getTranslations } from "next-intl/server";

import { Picture } from "@/shared/components/ui/picture";
import { Reveal } from "@/shared/components/ui/reveal";
import { SplitText } from "@/shared/components/ui/split-text";

export async function AboutSelectionSection() {
  const t = await getTranslations("aboutBrand.selection");

  return (
    <section
      data-plumb-id="frame-2085667080"
      aria-labelledby="about-brand-selection-title"
      className="flex w-full justify-center bg-canvas-soft py-[200px] px-4"
    >
      <div
        data-plumb-id="frame-2085667090"
        className="flex w-full max-w-content flex-col gap-10"
      >
        <div className="mx-auto flex max-w-[640px] flex-col items-center gap-4 text-center">
          <SplitText
            as="h2"
            data-plumb-id="lorem-ipsum-dolor-10"
            id="about-brand-selection-title"
            className="font-display text-[32px] leading-none"
            by="words"
            stagger={40}
          >
            {t("title")}
          </SplitText>
          <SplitText
            as="p"
            className="mx-auto max-w-[590px] font-sans text-sm leading-[1.43] text-muted-ink"
            by="words"
            stagger={10}
          >
            {t("description")}
          </SplitText>
        </div>

        <Reveal delay={120}>
          <Picture
            basePath="/images/about-brand/harvest-sturgeon-desktop"
            artDirected={[
              {
                basePath: "/images/about-brand/harvest-sturgeon-mobile",
                media: "(max-width: 767px)",
              },
            ]}
            fallbackExtension="jpg"
            alt={t("imageAlt")}
            loading="lazy"
            responsiveWidths={[640, 1000]}
            sizes="(max-width: 1000px) 100vw, 1000px"
            width={1000}
            height={700}
            className="aspect-2/3 md:aspect-10/7 w-full rounded-brand object-cover object-[center_22%]"
            data-plumb-id="rectangle-4878"
            data-plumb-asset="76c1cde6a925e94a7e9ebb37fd450bcf8aeffa17"
          />
        </Reveal>

        <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-[200px_1fr_1fr] md:gap-x-[54px]">
          <SplitText
            as="h3"
            data-plumb-id="lorem-ipsum-dolor-3"
            className="font-display text-[24px] leading-[1.33]"
            by="words"
            stagger={40}
          >
            {t("caption")}
          </SplitText>
          <SplitText
            as="p"
            data-plumb-id="colour-grain-texture-firmness-and-moistu"
            className="font-sans text-sm leading-[18px]"
            by="words"
            stagger={10}
          >
            {t("detail1")}
          </SplitText>
          <SplitText
            as="p"
            data-plumb-id="on-the-palate-flavour-unfolds-in-layers"
            className="font-sans text-sm leading-[18px]"
            by="words"
            stagger={10}
          >
            {t("detail2")}
          </SplitText>
        </div>
      </div>
    </section>
  );
}
