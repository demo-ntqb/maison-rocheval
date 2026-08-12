import { getTranslations } from "next-intl/server";

import { IconMaisonRochevalLogo } from "@/shared/components/icons/maison-rocheval-logo";
import { MichelinRating } from "@/shared/components/ui/michelin-rating";
import { HomePicture } from "../components/home-picture";

export async function HomeHeroSection() {
  const t = await getTranslations("home.hero");

  return (
    <section
      aria-labelledby="home-title"
      data-slot="home-hero-section"
      data-plumb-id="frame-2085667109"
      data-plumb-asset="085abeb6efd175dc24d63837b2ba7c11e815ccab"
      className="relative -mt-20 flex h-screen w-full flex-col items-center justify-between overflow-hidden bg-ink"
    >
      <div className="absolute inset-0">
        <HomePicture
          basePath="/images/home/hero-caviar-pearls"
          fallbackExtension="jpg"
          alt={t("imageAlt")}
          priority
          width={2800}
          height={1600}
          sizes="100vw"
          pictureClassName="block size-full"
          className="size-full object-cover"
          data-plumb-asset="085abeb6efd175dc24d63837b2ba7c11e815ccab"
        />
        <div className="home-hero-overlay absolute inset-0" aria-hidden="true" />
      </div>

      <div
        className="absolute inset-x-0 top-24 z-10 flex h-[254px] flex-col items-center justify-center"
        data-plumb-id="frame"
      >
        <h1 id="home-title" className="sr-only">
          {t("title")}
        </h1>
        <IconMaisonRochevalLogo
          className="h-auto w-[min(317px,78vw)] text-canvas"
          aria-hidden="true"
          focusable="false"
          data-plumb-id="group-9"
        />
      </div>

      <div
        className="absolute inset-x-0 bottom-0 z-10 flex h-[140px] items-end justify-center p-[54px]"
        data-plumb-id="frame-2085667092"
      >
        <MichelinRating count={3} className="gap-[15.5px]" starClassName="h-8 w-[30px] text-canvas" data-plumb-id="frame-2085667021" />
      </div>
    </section>
  );
}
