import * as React from "react";
import { getTranslations } from "next-intl/server";

import { Picture } from "@/shared/components/ui/picture";

export async function AboutHistorySection() {
  const t = await getTranslations("aboutBrand.story");

  return (
    <section data-plumb-id="frame-2085667087" aria-labelledby="about-brand-story-title" className="flex min-h-[1100px] flex-col items-center justify-center bg-canvas px-[10px] py-24 lg:py-[200px]">
      <div data-plumb-id="component-6-2" className="mx-auto grid w-full max-w-[1000px] items-center gap-14 px-6 md:grid-cols-[45%_1fr] md:gap-8 md:px-0 lg:grid-cols-[470px_530px] lg:gap-0">
        <Picture
          basePath="/images/about-brand/brand-story-founder"
          fallbackExtension="jpg"
          alt={t("imageAlt")}
          width={940}
          height={1400}
          sizes="(max-width: 767px) 100vw, 470px"
          pictureClassName="block h-[min(700px,149vw)] w-full overflow-hidden"
          className="size-full object-cover"
          data-plumb-id="image-20"
        />
        <div data-plumb-id="frame-2085667142" className="mx-auto flex w-full max-w-[350px] flex-col">
          <p data-plumb-id="lorem-ipsum-dolor-4" className="font-display text-[32px] leading-none">{t("eyebrow")}</p>
          <h2 data-plumb-id="lorem-ipsum-dolor-sit-amet" id="about-brand-story-title" className="mt-8 font-display text-base font-bold leading-[1.2]">{t("title")}</h2>
          <div className="mt-8 space-y-5 font-sans text-sm leading-[1.43] text-muted-ink">
            <p>{t("paragraph1")}</p>
            <p>{t("paragraph2")}</p>
            <p>{t("paragraph3")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
