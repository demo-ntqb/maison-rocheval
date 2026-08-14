import { getTranslations } from "next-intl/server";

import { Picture } from "@/shared/components/ui/picture";

export async function AboutSelectionSection() {
  const t = await getTranslations("aboutProduct.quality");

  return (
    <section
      data-plumb-id="frame-2085667073"
      aria-labelledby="quality-title"
      className="bg-warm py-20 lg:py-[200px]"
    >
      <div
        data-plumb-id="frame-2085667071"
        className="mx-auto flex w-full max-w-[1000px] flex-col gap-16 px-6 md:gap-20 lg:gap-[100px] lg:px-0"
      >
        {/* Header Row */}
        <div
          data-plumb-id="frame-2085667144"
          className="flex flex-col justify-between gap-8 md:flex-row md:items-end md:gap-[100px]"
        >
          <div data-plumb-id="lorem-ipsum-dolor" className="max-w-[700px]">
            <h2
              data-plumb-id="lorem-ipsum-dolor-2"
              id="quality-title"
              className="font-display text-[44px] uppercase leading-[1.07] text-brand-black md:text-[64px] lg:text-[84px]"
            >
              {t("title")}
            </h2>
          </div>
          <div data-plumb-id="frame-2085667145" className="w-full md:max-w-[250px]">
            <p
              data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a"
              className="font-sans text-sm leading-[1.43] text-muted-ink"
            >
              {t("description")}
            </p>
          </div>
        </div>

        {/* Consideration Row */}
        <article
          data-plumb-id="component-7-2"
          className="flex flex-col-reverse items-center justify-between gap-10 md:flex-row md:gap-0"
        >
          <div
            data-plumb-id="frame-2085667004"
            className="flex w-full items-center justify-center md:w-[530px]"
          >
            <div
              data-plumb-id="frame-2085667143"
              className="flex w-full max-w-[350px] flex-col gap-8 md:gap-[54px]"
            >
              <Picture
                data-plumb-id="chatgpt-image-jul-30-2026-02-46-36-pm-1"
                basePath="/images/about-product/sturgeon-illustration"
                fallbackExtension="png"
                alt={t("consideration.illustrationAlt")}
                width={185}
                height={80}
                sizes="185px"
                pictureClassName="block w-[185px]"
                className="h-auto w-[185px] object-contain"
              />
              <div
                data-plumb-id="component-7-3"
                className="flex flex-col gap-4"
              >
                <h3
                  data-plumb-id="lorem-ipsum-dolor-4"
                  className="font-display text-[32px] leading-none text-brand-black"
                >
                  {t("consideration.title")}
                </h3>
                <div
                  data-plumb-id="frame-2085667120"
                  className="flex flex-col gap-3"
                >
                  <p
                    data-plumb-id="lorem-ipsum-dolor-sit-amet"
                    className="font-display text-base font-bold leading-normal text-brand-black"
                  >
                    {t("consideration.subtitle")}
                  </p>
                  <p
                    data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a-2"
                    className="font-sans text-sm leading-[1.43] text-muted-ink"
                  >
                    {t("consideration.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Picture
            data-plumb-id="image-20"
            basePath="/images/about-product/quality-careful-consideration"
            fallbackExtension="jpg"
            alt={t("consideration.imageAlt")}
            width={940}
            height={1400}
            sizes="(max-width: 767px) 100vw, 470px"
            pictureClassName="block w-full md:w-[470px]"
            className="aspect-[47/70] w-full rounded-[2px] object-cover md:w-[470px]"
          />
        </article>

        {/* Salting Row */}
        <article
          data-plumb-id="component-6"
          className="flex flex-col items-center justify-between gap-10 md:flex-row md:gap-0"
        >
          <Picture
            data-plumb-id="image-20-2"
            basePath="/images/about-product/quality-salting-process"
            fallbackExtension="jpg"
            alt={t("salting.imageAlt")}
            width={940}
            height={1400}
            sizes="(max-width: 767px) 100vw, 470px"
            pictureClassName="block w-full md:w-[470px]"
            className="aspect-[47/70] w-full rounded-[2px] object-cover md:w-[470px]"
          />
          <div
            data-plumb-id="frame-2085667078"
            className="flex w-full items-center justify-center md:w-[530px]"
          >
            <div
              data-plumb-id="frame-2085667142"
              className="flex w-full max-w-[350px] flex-col gap-4"
            >
              <div
                data-plumb-id="component-7-4"
                className="flex flex-col gap-4"
              >
                <h3
                  data-plumb-id="lorem-ipsum-dolor-6"
                  className="font-display text-[32px] leading-none text-brand-black"
                >
                  {t("salting.title")}
                </h3>
                <div
                  data-plumb-id="frame-2085667120-2"
                  className="flex flex-col gap-3"
                >
                  <p
                    data-plumb-id="lorem-ipsum-dolor-sit-amet-2"
                    className="font-display text-base font-bold leading-normal text-brand-black"
                  >
                    {t("salting.subtitle")}
                  </p>
                  <p
                    data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a-3"
                    className="font-sans text-sm leading-[1.43] text-muted-ink"
                  >
                    {t("salting.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

