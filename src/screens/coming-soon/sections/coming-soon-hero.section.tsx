import { getTranslations } from "next-intl/server";

import { IconMaisonRochevalLogo } from "@/shared/components/icons/maison-rocheval-logo";
import { Picture } from "@/shared/components/ui/picture";

const DESKTOP_MEDIA = "(min-width: 768px)";

export async function ComingSoonHeroSection() {
  const t = await getTranslations("comingSoon.hero");

  return (
    <section
      aria-labelledby="coming-soon-title"
      data-slot="coming-soon-hero-section"
      className="relative flex h-dvh w-full flex-col items-center justify-between overflow-hidden bg-canvas py-[54px] md:pb-[120px] md:pt-[84px]"
    >
      <Picture
        basePath="/images/coming-soon/hero-mobile"
        fallbackExtension="jpg"
        artDirected={[
          { basePath: "/images/coming-soon/hero-desktop", media: DESKTOP_MEDIA },
        ]}
        alt={t("imageAlt")}
        priority
        width={856}
        height={1600}
        sizes="100vw"
        pictureClassName="absolute inset-0 block"
        className="size-full object-cover"
      />

      <IconMaisonRochevalLogo
        className="relative h-auto w-[169px] text-ink"
        aria-hidden="true"
        focusable="false"
      />

      <h1
        id="coming-soon-title"
        className="relative font-display text-section-title font-normal text-canvas uppercase"
      >
        <span className="sr-only">{t("brand")} — </span>
        {t("message")}
      </h1>
    </section>
  );
}
