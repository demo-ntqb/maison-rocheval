import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { MichelinRating } from "@/shared/components/ui/michelin-rating";
import { Picture } from "@/shared/components/ui/picture";
import { ROUTES } from "@/shared/constants/route.constant";

export async function AboutRitualSection() {
  const t = await getTranslations("aboutBrand.ritual");

  return (
    <section data-plumb-id="frame-2085667081" aria-labelledby="about-brand-ritual-title" className="flex min-h-[2520px] flex-row items-center justify-center bg-warm px-[10px] py-24 lg:py-[200px]">
      <div className="mx-auto w-full max-w-[1000px] px-6 md:px-0">
        <div className="flex items-end justify-between gap-8">
          <h2 data-plumb-id="lorem-ipsum-dolor-14" id="about-brand-ritual-title" className="font-display text-[clamp(3.25rem,6vw,5.25rem)] uppercase leading-none">{t("title")}</h2>
          <p className="pb-2 font-sans text-sm">{t("statement")}</p>
        </div>

        <Picture
          basePath="/images/about-brand/ritual-chefs-celebration"
          fallbackExtension="jpg"
          alt={t("heroImageAlt")}
          width={2000}
          height={1400}
          sizes="(max-width: 1000px) 100vw, 1000px"
          pictureClassName="mt-16 block w-full overflow-hidden"
          className="aspect-[10/7] size-full object-cover"
        />

        <div className="mx-auto mt-24 max-w-[650px] text-center">
          <MichelinRating count={3} className="justify-center gap-3" starClassName="size-8 text-ink" />
          <h3 data-plumb-id="lorem-ipsum-dolor-16" className="mt-8 font-display text-[32px] leading-none">{t("subtitle")}</h3>
          <div className="mt-7 space-y-5 font-sans text-sm leading-[1.43] text-muted-ink">
            <p>{t("paragraph1")}</p>
            <p>{t("paragraph2")}</p>
          </div>
          <Link href={ROUTES.ABOUT_PRODUCT} className="mt-8 inline-flex min-h-11 items-center font-sans text-xs uppercase tracking-[0.12em] underline underline-offset-4">
            {t("collection")}
          </Link>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <Picture
            basePath="/images/about-brand/ritual-source-inspection"
            fallbackExtension="jpg"
            alt={t("sourceImageAlt")}
            width={968}
            height={1400}
            sizes="(max-width: 767px) 100vw, 484px"
            pictureClassName="block h-[min(700px,145vw)] overflow-hidden"
            className="size-full object-cover"
          />
          <Picture
            basePath="/images/about-brand/ritual-caviar-service"
            fallbackExtension="jpg"
            alt={t("serviceImageAlt")}
            width={968}
            height={1400}
            sizes="(max-width: 767px) 100vw, 484px"
            pictureClassName="block h-[min(700px,145vw)] overflow-hidden"
            className="size-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
