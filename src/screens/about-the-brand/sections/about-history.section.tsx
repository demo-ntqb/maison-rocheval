import { getTranslations } from "next-intl/server";

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
        className="flex w-full max-w-content flex-col items-stretch gap-y-10 md:flex-row md:items-center md:gap-[54px]"
      >
        <div
          data-plumb-id="frame-2085667324"
          className="relative w-full overflow-hidden md:bg-navy-dark md:p-6 md:rounded-[2px] md:max-w-[543px] md:h-187 md:flex-[0_0_54.3%]"
        >
          <Picture
            basePath="/images/about-brand/story-source"
            fallbackExtension="jpg"
            alt={t("imageAlt")}
            loading="lazy"
            responsiveWidths={[480, 640, 1000]}
            sizes="(max-width: 767px) 100vw, 495px"
            width={495}
            height={700}
            className="aspect-365/516 md:aspect-495/700 w-full md:h-full object-cover object-[54.3%_0%]"
            data-plumb-id="image-20"
            data-plumb-asset="779e209f89a170e6f256e88be293be9e8d0d17b0"
          />
        </div>

        <div
          data-plumb-id="frame-2085667078"
          className="flex w-full md:flex-1"
        >
          <div
            data-plumb-id="frame-2085667142"
            className="flex w-full flex-col gap-3  lg:max-w-[350px]"
          >
            <h2
              data-plumb-id="lorem-ipsum-dolor"
              className="font-display text-[32px] leading-none"
            >
              {t("title")}
            </h2>
            <div data-plumb-id="component-7" className="flex flex-col gap-3">
              <p
                data-plumb-id="lorem-ipsum-dolor-3"
                id="about-brand-story-title"
                className="font-display text-base font-bold leading-normal"
              >
                {t("eyebrow")}
              </p>
              <div className="flex flex-col gap-3 font-sans text-sm leading-[1.43] text-muted-ink">
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
