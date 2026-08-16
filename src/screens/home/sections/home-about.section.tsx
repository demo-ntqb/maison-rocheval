import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Picture } from "@/shared/components/ui/picture";

export async function HomeAboutSection() {
  const t = await getTranslations("home.about");

  return (
    <section
      aria-labelledby="home-quality-title"
      className="flex w-full flex-col items-center bg-warm py-[150px] lg:px-[10px] lg:py-[200px]"
      data-plumb-id="frame-2085667104"
    >
      <div className="flex w-full max-w-content flex-col gap-[54px] lg:gap-[100px]" data-plumb-id="frame-2085667103">
        {/* Title statement block */}
        <div className="flex w-full flex-col lg:max-w-[628px] px-4 lg:px-0" data-plumb-id="lorem-ipsum-dolor-5">
          <h2
            id="home-quality-title"
            className="font-display text-[54px] lg:text-[84px] leading-[1.07] text-ink uppercase whitespace-pre-line"
            data-plumb-id="lorem-ipsum-dolor-6"
          >
            {t("highlight")}
          </h2>
        </div>

        {/* Overlapping images & text block container */}
        <div className="flex w-full flex-col" data-plumb-id="frame-2085667298">
          {/* Sturgeon image block (Desktop: w 1000, h 400; Mobile: w 396, h 300) */}
          <div className="w-full h-[300px] lg:h-[400px] flex justify-end overflow-hidden" data-plumb-id="frame-2085667147">
            <Picture
              basePath="/images/home/selection-sturgeon"
              fallbackExtension="png"
              alt={t("sturgeonImageAlt")}
              width={700}
              height={400}
              sizes="(max-width: 1023px) calc(100vw - 32px), 700px"
              pictureClassName="block overflow-hidden rounded-brand w-[600px] lg:w-[700px] h-[300px] lg:h-[400px]"
              className="size-full rounded-brand object-cover"
              data-plumb-id="image-873"
              data-plumb-asset="3743e3089f6d2565f0b421627b7b0281e2a74614"
            />
          </div>

          {/* Caviar image & Text block (Figma overlap gap -54px) */}
          <div className="flex flex-col lg:flex-row w-full items-center lg:items-start -mt-[54px] z-10" data-plumb-id="component-6-2">
            <Picture
              basePath="/images/home/selection-caviar-pearls"
              fallbackExtension="png"
              alt={t("caviarImageAlt")}
              width={470}
              height={700}
              sizes="(max-width: 1023px) calc(100vw - 32px), 470px"
              pictureClassName="block overflow-hidden rounded-brand w-[300px] lg:w-[470px] h-[380px] lg:h-[700px] self-start lg:self-auto"
              className="size-full rounded-brand object-cover"
              data-plumb-id="image-20-2"
              data-plumb-asset="610416d8c326714084de6a54be9625325f3d566d"
            />

            <div className="flex w-full lg:w-[530px] flex-col items-center justify-center py-16 lg:h-[700px] lg:py-0" data-plumb-id="frame-2085667078">
              <div className="flex w-full max-w-[332px] lg:max-w-[400px] flex-col gap-8" data-plumb-id="frame-2085667142">
                <div className="flex flex-col gap-8 lg:gap-8" data-plumb-id="component-7-3">
                  <div className="flex flex-col gap-4 lg:gap-4" data-plumb-id="frame-2085667121">
                    <div data-plumb-id="lorem-ipsum-dolor-7">
                      <h3 className="font-display text-[32px] leading-none text-ink" data-plumb-id="lorem-ipsum-dolor-8">
                        {t("title")}
                      </h3>
                    </div>
                    <div className="flex flex-col gap-3 font-sans text-sm leading-[18px] text-ink" data-plumb-id="frame-2085667120">
                      <p data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a-3">{t("description")}</p>
                      <p className="font-display text-base font-bold leading-[19px]" data-plumb-id="lorem-ipsum-dolor-sit-amet">
                        {t("speciesTitle")}
                      </p>
                      <p data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a-4">{t("speciesDescription")}</p>
                    </div>
                  </div>
                  <Link
                    href="/about-the-product"
                    className="inline-flex min-h-11 w-fit items-center font-sans text-sm leading-5 text-ink underline underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4"
                    data-plumb-id="text-button-3"
                  >
                    <span className="underline underline-offset-4" data-plumb-id="text-button-4">
                      {t("explore")}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
