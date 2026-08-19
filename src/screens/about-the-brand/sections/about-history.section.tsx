import { getTranslations } from "next-intl/server";

import { IconMaisonRochevalSymbol } from "@/shared/components/icons/maison-rocheval-symbol";
import { Picture } from "@/shared/components/ui/picture";

export async function AboutHistorySection() {
  const t = await getTranslations("aboutBrand.story");

  return (
    <section
      data-plumb-id="frame-2085667087"
      aria-labelledby="about-brand-story-title"
      className="flex w-full justify-center bg-canvas-soft px-2.5 py-[200px]"
    >
      <div
        data-plumb-id="component-9"
        className="flex w-full max-w-content flex-col items-stretch gap-y-10 md:flex-row md:items-center md:gap-0"
      >
        <div
          data-plumb-id="image-20-wrap"
          className="relative w-full overflow-hidden md:max-w-[470px] md:flex-[0_0_47%]"
        >
          <Picture
            basePath="/images/about-brand/story-source"
            fallbackExtension="jpg"
            alt={t("imageAlt")}
            loading="lazy"
            responsiveWidths={[480, 640, 1000]}
            sizes="(max-width: 767px) 100vw, 470px"
            width={626}
            height={417}
            className="aspect-[.671] w-full object-cover object-[47%_0%]"
            data-plumb-id="image-20"
            data-plumb-asset="779e209f89a170e6f256e88be293be9e8d0d17b0"
          />
          <div
            data-plumb-id="group"
            className="pointer-events-none absolute left-[42%] top-[40%] flex h-[150px] w-[128px] -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            aria-hidden="true"
          >
            <IconMaisonRochevalSymbol className="h-[150px] w-[88px] text-white" />
          </div>
        </div>

        <div
          data-plumb-id="frame-2085667078"
          className="flex w-full justify-center md:flex-1 md:justify-end"
        >
          <div
            data-plumb-id="frame-2085667142"
            className="flex w-full max-w-[350px] flex-col gap-[54px]"
          >
            <p
              data-plumb-id="lorem-ipsum-dolor"
              className="font-display text-[32px] leading-none"
            >
              {t("eyebrow")}
            </p>
            <div data-plumb-id="component-7" className="flex flex-col gap-8">
              <h2
                data-plumb-id="lorem-ipsum-dolor-3"
                id="about-brand-story-title"
                className="font-display text-[32px] leading-[1] tracking-normal"
              >
                {t("title")}
              </h2>
              <div className="flex flex-col gap-5 font-sans text-sm leading-[1.43] text-muted-ink">
                <p data-plumb-id="colour-grain-texture-firmness-and-moistu-2">
                  {t("paragraph1")}
                </p>
                <p data-plumb-id="colour-grain-texture-firmness-and-moistu-3">
                  {t("paragraph2")}
                </p>
                <p data-plumb-id="colour-grain-texture-firmness-and-moistu-4">
                  {t("paragraph3")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
