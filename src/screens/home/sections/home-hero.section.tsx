import { getTranslations } from "next-intl/server";

import { IconMaisonRochevalLogo } from "@/shared/components/icons/maison-rocheval-logo";
import { Picture } from "@/shared/components/ui/picture";

export async function HomeHeroSection() {
  const t = await getTranslations("home.hero");

  return (
    <section
      aria-labelledby="home-title"
      data-slot="home-hero-section"
      data-plumb-id="frame-2085667109"
      className="relative -mt-20 flex h-[100dvh] w-full flex-col items-center justify-between overflow-hidden"
    >
      <div className="absolute inset-0">
        <Picture
          basePath="/images/home/hero-caviar-pearls"
          fallbackExtension="jpg"
          alt={t("imageAlt")}
          priority
          width={1400}
          height={800}
          sizes="100vw"
          pictureClassName="block size-full"
          className="size-full object-cover"
          data-plumb-asset="67cbdac6eacb88d9fe0feed8f11c819741458892"
        />
      </div>

      <div
        className="absolute inset-x-0 top-[56px] lg:top-[96px] z-10 flex h-[200px] flex-col items-center justify-center"
        data-plumb-id="frame-2085667110"
      >
        <h1 id="home-title" className="sr-only">
          {t("title")}
        </h1>
        <IconMaisonRochevalLogo
          className="h-[100px] w-[211px] lg:h-[120px] lg:w-[253px]"
          aria-hidden="true"
          focusable="false"
          data-plumb-id="group-9"
        />
      </div>
    </section>
  );
}
