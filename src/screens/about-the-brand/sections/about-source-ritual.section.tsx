import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { IconMaisonRochevalSymbol } from "@/shared/components/icons/maison-rocheval-symbol";
import { Picture } from "@/shared/components/ui/picture";
import { Reveal } from "@/shared/components/ui/reveal";
import { SplitText } from "@/shared/components/ui/split-text";
import { ROUTES } from "@/shared/constants/route.constant";

export async function AboutSourceRitualSection() {
  const t = await getTranslations("aboutBrand.sourceToRitual");

  return (
    <section
      data-plumb-id="frame-2085667110-2"
      aria-labelledby="about-brand-source-title"
      className="flex w-full justify-center bg-canvas-soft py-[200px] px-4"
    >
      <div
        data-plumb-id="frame-2085667169"
        className="flex w-full max-w-content flex-col items-center gap-10"
      >
        <div className="flex w-full flex-col items-center gap-10">
          <Reveal
            data-plumb-id="frame-2085667299"
            className="flex items-center gap-8 text-ink"
            aria-hidden="true"
          >
            <IconMaisonRochevalSymbol className="h-8 w-7" />
            <IconMaisonRochevalSymbol className="h-8 w-7" />
            <IconMaisonRochevalSymbol className="h-8 w-7" />
          </Reveal>

          <div
            data-plumb-id="component-7"
            className="mx-auto flex max-w-[640px] flex-col items-center gap-4 text-center"
          >
            <SplitText
              as="h2"
              data-plumb-id="lorem-ipsum-dolor-10"
              id="about-brand-source-title"
              className="font-display text-[32px] leading-none"
              by="words"
              stagger={40}
            >
              {t("title")}
            </SplitText>
            <SplitText
              as="p"
              className="font-sans text-sm leading-[1.43] text-muted-ink"
              by="words"
              stagger={10}
            >
              {t("intro")}
            </SplitText>
            <SplitText
              as="p"
              className="font-sans text-sm leading-[1.43] text-muted-ink"
              by="words"
              stagger={10}
            >
              {t("description")}
            </SplitText>
            <Link
              href={ROUTES.ABOUT_PRODUCT}
              className="inline-flex min-h-11 items-center font-sans text-xs uppercase underline underline-offset-4"
              data-plumb-id="text-button"
            >
              <SplitText
                as="span"
                className="underline underline-offset-4"
                by="words"
                stagger={10}
              >
                {t("cta")}
              </SplitText>
            </Link>
          </div>
        </div>

        <Reveal delay={120} className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
          <Picture
            basePath="/images/about-brand/source-to-ritual-preparation"
            fallbackExtension="jpg"
            alt={t("preparationAlt")}
            loading="lazy"
            responsiveWidths={[480, 640, 1000]}
            sizes="(max-width: 767px) 100vw, 484px"
            width={484}
            height={700}
            className="aspect-396/500 md:aspect-484/700 w-full rounded-brand object-cover object-[53%_center]"
            data-plumb-id="image-20"
            data-plumb-asset="67cbdac6eacb88d9fe0feed8f11c819741458892"
          />
          <Picture
            basePath="/images/about-brand/source-to-ritual-service"
            fallbackExtension="jpg"
            alt={t("serviceAlt")}
            loading="lazy"
            responsiveWidths={[480, 640, 1000]}
            sizes="(max-width: 767px) 100vw, 484px"
            width={484}
            height={700}
            className="aspect-396/500 md:aspect-484/700 w-full rounded-brand object-cover object-[50%_center]"
            data-plumb-id="image-8"
            data-plumb-asset="eb4f65ca5e0021129e04a702672d9f927e8c30fc"
          />
        </Reveal>
      </div>
    </section>
  );
}
