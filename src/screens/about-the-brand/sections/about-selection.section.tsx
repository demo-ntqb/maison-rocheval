import * as React from "react";
import { getTranslations } from "next-intl/server";

import { Picture } from "@/shared/components/ui/picture";

export async function AboutSelectionSection() {
  const t = await getTranslations("aboutBrand.selection");

  return (
    <section data-plumb-id="frame-2085667080" aria-labelledby="about-brand-selection-title" className="flex min-h-[1392px] flex-col items-center justify-center bg-canvas py-24 lg:py-[200px]">
      <div className="mx-auto w-full max-w-[1000px] px-6 md:px-0">
        <div className="mx-auto max-w-[760px] text-center">
          <h2 data-plumb-id="lorem-ipsum-dolor-10" id="about-brand-selection-title" className="font-display text-[32px] leading-none">{t("title")}</h2>
          <p className="mx-auto mt-6 max-w-[590px] font-sans text-sm leading-[1.43] text-muted-ink">{t("description")}</p>
        </div>
        <Picture
          basePath="/images/about-brand/selection-caviar-chefs"
          fallbackExtension="jpg"
          alt={t("imageAlt")}
          width={2000}
          height={1400}
          sizes="(max-width: 1000px) 100vw, 1000px"
          pictureClassName="mt-10 block h-auto w-full overflow-hidden"
          className="aspect-[10/7] size-full rounded-brand object-cover"
          data-plumb-id="rectangle-4878"
        />
        <div className="mt-16 grid gap-8 md:grid-cols-3 lg:grid-cols-[300px_300px_300px] lg:justify-between lg:gap-0">
          <h3 data-plumb-id="lorem-ipsum-dolor-12" className="font-display text-2xl leading-[1.17]">{t("caption")}</h3>
          <p data-plumb-id="colour-grain-texture-firmness-and-moistu" className="font-sans text-sm leading-[18px] text-ink">{t("detail1")}</p>
          <p data-plumb-id="on-the-palate-flavour-unfolds-in-layers" className="font-sans text-sm leading-[18px] text-ink">{t("detail2")}</p>
        </div>
      </div>
    </section>
  );
}
