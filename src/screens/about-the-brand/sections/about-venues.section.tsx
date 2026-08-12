import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Picture } from "@/shared/components/ui/picture";

const venues = [
  { key: "alliance", image: "venue-alliance", width: 968, height: 1400 },
  { key: "milo", image: "venue-milo", width: 968, height: 1400 },
] as const;

export async function AboutVenuesSection() {
  const t = await getTranslations("aboutBrand.venues");

  return (
    <section data-plumb-id="frame-2085667086" aria-labelledby="about-brand-venues-title" className="flex min-h-[1399px] flex-col items-center justify-center bg-warm px-[10px] py-24 lg:py-[200px]">
      <h2 id="about-brand-venues-title" className="sr-only">{t("title")}</h2>
      <div className="mx-auto grid w-full max-w-[1000px] gap-14 px-6 md:grid-cols-2 md:gap-8 md:px-0">
        {venues.map((venue) => (
          <article key={venue.key}>
            <div data-plumb-id={venue.key === "alliance" ? "frame-2085667162" : "frame-2085667161"} className="relative flex h-[min(700px,145vw)] flex-col items-center justify-between overflow-hidden p-[54px]">
              <Picture
                basePath={`/images/about-brand/${venue.image}`}
                fallbackExtension="jpg"
                alt={t(`${venue.key}.imageAlt`)}
                width={venue.width}
                height={venue.height}
                sizes="(max-width: 767px) 100vw, 484px"
                pictureClassName="absolute inset-0 block size-full"
                className="size-full object-cover"
              />
              <p data-plumb-id={venue.key} className="relative z-10 text-center font-display text-[32px] font-medium leading-none text-canvas">{t(`${venue.key}.name`)}</p>
            </div>
            <div className="pt-8">
              <h3 className="font-display text-[32px] leading-none">{t(`${venue.key}.name`)}</h3>
              <p className="mt-5 font-display text-base font-bold">{t(`${venue.key}.subtitle`)}</p>
              <p className="mt-4 max-w-[360px] font-sans text-sm leading-[1.43] text-muted-ink">{t(`${venue.key}.description`)}</p>
              <Link href="/about-the-brand" className="mt-8 inline-flex min-h-11 items-center font-sans text-xs uppercase tracking-[0.12em] underline underline-offset-4">
                {t("visit")}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
