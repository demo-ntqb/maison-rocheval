import { getTranslations } from "next-intl/server";

import { Picture } from "@/shared/components/ui/picture";
import { SplitText } from "@/shared/components/ui/split-text";

export async function AboutHeroSection() {
  const t = await getTranslations("aboutBrand.hero");

  return (
    <section
      aria-labelledby="about-brand-title"
      data-slot="about-hero-section"
      data-plumb-id="frame-2085667109"
      className="relative -mt-20 flex min-h-dvh flex-col overflow-hidden bg-ink"
    >
      <div className="absolute inset-0">
        <Picture
          basePath="/images/about-brand/hero-maison-lake-desktop"
          artDirected={[{ basePath: "/images/about-brand/hero-maison-lake-mobile", media: "(max-width: 767px)" }]}
          fallbackExtension="jpg"
          alt={t("imageAlt")}
          priority
          responsiveWidths={[640, 1000, 1400, 1920]}
          sizes="100vw"
          width={1400}
          height={800}
          className="size-full object-cover"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-350 flex-col px-6 pt-28 lg:px-13.5">
        <SplitText
          as="h1"
          id="about-brand-title"
          data-plumb-id="the-maison"
          className="text-center font-display text-[clamp(2.5rem,4.6vw,3.375rem)] font-normal uppercase leading-none tracking-[-0.02em]"
          by="words"
          stagger={40}
        >
          {t("title")}
        </SplitText>
      </div>
    </section>
  );
}

