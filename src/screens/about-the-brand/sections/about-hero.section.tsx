import { getTranslations } from "next-intl/server";

import { MichelinRating } from "@/shared/components/ui/michelin-rating";
import { Picture } from "@/shared/components/ui/picture";

export async function AboutHeroSection() {
  const t = await getTranslations("aboutBrand.hero");

  return (
    <section
      aria-labelledby="about-brand-title"
      data-slot="about-hero-section"
      data-plumb-id="frame-2085667109"
      className="relative -mt-20 flex h-screen flex-col items-center justify-between overflow-hidden bg-ink text-canvas"
    >
      <div className="absolute inset-0">
        <Picture
          basePath="/images/about-brand/hero-artisan-caviar"
          fallbackExtension="jpg"
          alt={t("imageAlt")}
          priority
          width={2800}
          height={1600}
          sizes="100vw"
          responsiveWidths={[840, 1440]}
          pictureClassName="block size-full"
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/65" aria-hidden="true" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1400px] flex-col px-6 pb-[54px] pt-28 lg:px-[54px]">
        <h1
          id="about-brand-title"
          data-plumb-id="about-maison-rocheval"
          className="absolute inset-x-0 top-[104px] text-center font-display text-[clamp(2.5rem,4.6vw,4rem)] font-normal uppercase leading-none tracking-[-0.02em]"
        >
          {t("title")}
        </h1>

        <div className="mt-auto grid items-end gap-8 md:grid-cols-[1fr_532px]">
          <MichelinRating data-plumb-id="frame-2085667021" count={3} className="gap-4" starClassName="size-8 text-canvas" />
          <div data-plumb-id="frame-2085667044" className="grid gap-8 sm:grid-cols-[250px_250px]">
            <h2 data-plumb-id="lorem-ipsum-dolor-2" className="font-display text-2xl leading-[1.33]">{t("statement")}</h2>
            <p data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a" className="font-sans text-sm leading-[1.43] text-canvas/90">{t("description")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
