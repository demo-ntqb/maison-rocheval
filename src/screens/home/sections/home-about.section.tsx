import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { HomePicture } from "../components/home-picture";

export async function HomeAboutSection() {
  const t = await getTranslations("home.about");

  return (
    <section
      aria-labelledby="home-quality-title"
      className="flex w-full flex-col items-center bg-warm px-4 py-24 sm:px-6 lg:px-[10px] lg:py-section"
      data-plumb-id="frame-2085667104"
    >
      <div className="flex w-full max-w-content flex-col" data-plumb-id="frame-2085667103">
        <div className="relative flex flex-col lg:h-[835px]" data-plumb-id="frame-2085667147">
          <div className="flex max-w-full flex-col lg:h-[360px] lg:w-[405px]" data-plumb-id="lorem-ipsum-dolor-5">
            <h2
              id="home-quality-title"
              className="relative z-10 max-w-[405px] whitespace-pre-line font-display text-5xl leading-[1.07] text-ink sm:text-6xl lg:text-display-statement"
              data-plumb-id="lorem-ipsum-dolor-6"
            >
              {t("highlight")}
            </h2>
          </div>
          <HomePicture
            basePath="/images/home/selection-sturgeon"
            fallbackExtension="png"
            alt={t("sturgeonImageAlt")}
            width={1440}
            height={810}
            sizes="(max-width: 1023px) calc(100vw - 32px), 450px"
            pictureClassName="mt-10 block overflow-hidden rounded-brand lg:absolute lg:right-0 lg:top-40 lg:mt-0 lg:h-[675px] lg:w-[450px]"
            className="aspect-[2/3] size-full rounded-brand object-cover"
            data-plumb-id="image-20-2"
            data-plumb-asset="3743e3089f6d2565f0b421627b7b0281e2a74614"
          />
        </div>

        <div className="mt-16 flex flex-col items-center lg:-mt-[50px] lg:h-[700px] lg:flex-row" data-plumb-id="component-6-3">
          <HomePicture
            basePath="/images/home/selection-caviar-pearls"
            fallbackExtension="png"
            alt={t("caviarImageAlt")}
            width={480}
            height={480}
            sizes="(max-width: 1023px) calc(100vw - 32px), 470px"
            pictureClassName="block w-full max-w-[470px] overflow-hidden rounded-brand lg:h-[700px]"
            className="aspect-[47/70] size-full rounded-brand object-cover"
            data-plumb-id="image-20-3"
            data-plumb-asset="610416d8c326714084de6a54be9625325f3d566d"
          />

          <div className="flex w-full flex-1 flex-col items-center justify-center py-16 lg:h-[700px] lg:py-0" data-plumb-id="frame-2085667078">
            <div className="flex w-full max-w-[350px] flex-col gap-8" data-plumb-id="component-7-4">
              <div className="flex flex-col gap-4" data-plumb-id="frame-2085667121">
                <div data-plumb-id="lorem-ipsum-dolor-7">
                  <h3 className="font-display text-section-title leading-none text-ink" data-plumb-id="lorem-ipsum-dolor-8">{t("title")}</h3>
                </div>
                <div className="flex flex-col gap-3 font-sans text-sm leading-[18px] text-ink" data-plumb-id="frame-2085667120">
                  <p data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a-3">{t("description")}</p>
                  <p className="font-display text-base font-bold leading-[19px]" data-plumb-id="lorem-ipsum-dolor-sit-amet">{t("speciesTitle")}</p>
                  <p data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a-4">{t("speciesDescription")}</p>
                </div>
              </div>
              <Link
                href="/about-the-product"
                className="inline-flex min-h-11 w-fit items-center font-sans text-sm leading-5 text-ink underline underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <span className="underline underline-offset-4" data-plumb-id="text-button-4">{t("explore")}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
