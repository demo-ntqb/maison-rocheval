import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { HomePicture } from "../components/home-picture";

export async function HomeIntroSection() {
  const t = await getTranslations("home.intro");

  return (
    <section
      aria-labelledby="home-source-title"
      className="flex w-full flex-col items-center bg-canvas px-4 py-24 sm:px-6 lg:px-0 lg:py-section"
      data-plumb-id="frame-2085667100"
    >
      <div className="flex w-full max-w-content flex-col items-center gap-24 lg:gap-[150px]" data-plumb-id="frame-2085667106">
        <div className="flex w-full flex-col items-center gap-[54px]" data-plumb-id="component-7">
          <div className="flex flex-col items-center" data-plumb-id="component-7-2">
            <div className="flex max-w-[500px] flex-col items-center gap-4 text-center" data-plumb-id="frame-2085667118">
              <div data-plumb-id="lorem-ipsum-dolor">
                <h2 id="home-source-title" className="font-display text-section-title leading-none text-ink" data-plumb-id="lorem-ipsum-dolor-2">
                  {t("title")}
                </h2>
              </div>
              <div className="flex flex-col items-center" data-plumb-id="frame-2085667119">
                <p className="font-sans text-sm leading-[18px] text-ink" data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a">{t("description")}</p>
              </div>
            </div>
          </div>
          <HomePicture
            basePath="/images/home/source-ritual-table"
            fallbackExtension="png"
            alt={t("tableImageAlt")}
            width={2000}
            height={1400}
            sizes="(max-width: 1023px) calc(100vw - 32px), 1000px"
            pictureClassName="block w-full overflow-hidden rounded-brand"
            picturePlumbId="group-1000005128"
            className="aspect-[10/7] w-full rounded-brand object-cover"
            data-plumb-id="rectangle-4878"
            data-plumb-asset="50b64eb13a2a29b737042e921b49ccda9b8771c7"
          />
        </div>

        <div className="flex w-full flex-col items-center gap-[54px]" data-plumb-id="component-6-2">
          <div className="flex max-w-[555px] flex-col items-center gap-8 text-center" data-plumb-id="component-7-3">
            <div className="flex max-w-[500px] flex-col items-center gap-4" data-plumb-id="frame-2085667118-2">
              <div data-plumb-id="lorem-ipsum-dolor-3">
                <h3 className="font-display text-section-title leading-none text-ink lg:whitespace-nowrap" data-plumb-id="lorem-ipsum-dolor-4">{t("storyTitle")}</h3>
              </div>
              <div className="flex flex-col items-center" data-plumb-id="frame-2085667119-2">
                <p className="font-sans text-sm leading-[18px] text-ink" data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a-2">{t("storyDescription")}</p>
              </div>
            </div>
            <Link
              href="/about-the-brand"
              className="-my-3 inline-flex min-h-11 items-center font-sans text-sm leading-5 text-ink underline underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span className="underline underline-offset-4" data-plumb-id="text-button-2">{t("learnMore")}</span>
            </Link>
          </div>

          <div className="grid w-full gap-8 sm:grid-cols-2" data-plumb-id="frame-2085667098">
            <HomePicture
              basePath="/images/home/source-chefs"
              fallbackExtension="png"
              alt={t("chefsImageAlt")}
              width={667}
              height={1000}
              sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(50vw - 28px), 484px"
              pictureClassName="block overflow-hidden rounded-brand"
              className="aspect-[484/700] size-full rounded-brand object-cover"
              data-plumb-id="image-20"
              data-plumb-asset="3741b23bd4160b01e6b81f329dcac3be628f9a36"
            />
            <HomePicture
              basePath="/images/home/source-caviar-tasting"
              fallbackExtension="png"
              alt={t("tastingImageAlt")}
              width={962}
              height={1200}
              sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(50vw - 28px), 484px"
              pictureClassName="block overflow-hidden rounded-brand"
              className="aspect-[484/700] size-full rounded-brand object-cover"
              data-plumb-id="image-8"
              data-plumb-asset="1b5c22f59782b98f4cb1ad887602bb6a38fe43b1"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
