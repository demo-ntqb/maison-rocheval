import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Picture } from "@/shared/components/ui/picture";
import { ROUTES } from "@/shared/constants/route.constant";

export async function HomeIntroSection() {
  const t = await getTranslations("home.intro");

  return (
    <section
      aria-labelledby="home-source-title"
      className="flex w-full flex-col items-center bg-canvas px-4 py-[150px] lg:px-0 lg:py-[200px]"
      data-plumb-id="frame-2085667100"
    >
      <div className="flex w-full max-w-content flex-col items-center gap-[200px]" data-plumb-id="frame-2085667106">
        {/* First block: From source to ritual */}
        <div className="flex w-full flex-col items-center gap-[54px]" data-plumb-id="component-6">
          <div className="flex w-full max-w-[640px] flex-col items-center gap-4 px-8 text-center lg:px-0" data-plumb-id="component-7">
            <div className="flex flex-col items-center gap-4" data-plumb-id="frame-2085667118">
              <div data-plumb-id="lorem-ipsum-dolor">
                <h2 id="home-source-title" className="font-display text-[32px] leading-none text-ink" data-plumb-id="lorem-ipsum-dolor-2">
                  {t("title")}
                </h2>
              </div>
              <div className="flex flex-col items-center" data-plumb-id="frame-2085667119">
                <p className="font-sans text-sm leading-[18px] text-ink whitespace-pre-line" data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a">
                  {t("description")}
                </p>
              </div>
            </div>
          </div>
          <Picture
            basePath="/images/home/source-ritual-table"
            fallbackExtension="png"
            alt={t("tableImageAlt")}
            width={1000}
            height={700}
            sizes="(max-width: 1023px) calc(100vw - 32px), 1000px"
            responsiveWidths={[640, 1000]}
            pictureClassName="block w-full overflow-hidden rounded-brand"
            className="aspect-[40/60] lg:aspect-[10/7] h-[600px] lg:h-[700px] w-full rounded-brand object-cover"
            data-plumb-id="rectangle-4878"
            data-plumb-asset="50b64eb13a2a29b737042e921b49ccda9b8771c7"
          />
        </div>

        {/* Second block: Before the Maison */}
        <div className="flex w-full flex-col items-center gap-[54px]" data-plumb-id="component-10">
          <div className="flex max-w-[640px] flex-col items-center gap-8 text-center" data-plumb-id="component-7-2">
            <div className="flex flex-col items-center gap-4" data-plumb-id="frame-2085667118-2">
              <div data-plumb-id="lorem-ipsum-dolor-3">
                <h3 className="font-display text-[32px] leading-none text-ink lg:whitespace-nowrap" data-plumb-id="lorem-ipsum-dolor-4">
                  {t("storyTitle")}
                </h3>
              </div>
              <div className="flex flex-col items-center" data-plumb-id="frame-2085667119-2">
                <p className="font-sans text-sm leading-[18px] text-ink" data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a-2">
                  {t("storyDescription")}
                </p>
              </div>
            </div>
            <Link
              href={ROUTES.ABOUT_BRAND}
              className="-my-3 inline-flex min-h-11 items-center font-sans text-sm leading-5 text-ink underline underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4"
              data-plumb-id="text-button"
            >
              <span className="underline underline-offset-4" data-plumb-id="text-button-2">
                {t("learnMore")}
              </span>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 w-full justify-center" data-plumb-id="frame-2085667098">
            <Picture
              basePath="/images/home/source-chefs"
              fallbackExtension="png"
              alt={t("chefsImageAlt")}
              width={484}
              height={700}
              sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(50vw - 28px), 484px"
              pictureClassName="block overflow-hidden rounded-brand w-full lg:w-[484px]"
              className="aspect-[40/50] lg:aspect-[484/700] h-[500px] lg:h-[700px] w-full rounded-brand object-cover"
              data-plumb-id="image-20"
              data-plumb-asset="3741b23bd4160b01e6b81f329dcac3be628f9a36"
            />
            <Picture
              basePath="/images/home/source-caviar-tasting"
              fallbackExtension="png"
              alt={t("tastingImageAlt")}
              width={484}
              height={700}
              sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(50vw - 28px), 484px"
              pictureClassName="block overflow-hidden rounded-brand w-full lg:w-[484px]"
              className="aspect-[40/50] lg:aspect-[484/700] h-[500px] lg:h-[700px] w-full rounded-brand object-cover"
              data-plumb-id="image-8"
              data-plumb-asset="1b5c22f59782b98f4cb1ad887602bb6a38fe43b1"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
