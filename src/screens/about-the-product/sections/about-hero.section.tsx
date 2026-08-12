import { getTranslations } from "next-intl/server";

import { MichelinRating } from "@/shared/components/ui/michelin-rating";
import { Picture } from "@/shared/components/ui/picture";

export async function AboutHeroSection() {
  const t = await getTranslations("aboutProduct.hero");

  return (
    <section data-slot="about-product-hero" data-plumb-id="frame-2085667110" aria-labelledby="about-product-title" className="relative -mt-20 flex h-screen flex-col items-center justify-between overflow-hidden bg-ink text-canvas">
      <Picture basePath="/images/about-product/hero-caviar-collection" fallbackExtension="jpg" alt={t("imageAlt")} priority width={2800} height={1600} sizes="100vw" pictureClassName="absolute inset-0 block size-full" className="size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/70" aria-hidden="true" />
      <h1 id="about-product-title" data-plumb-id="our-collection-2" className="relative z-10 mt-[104px] text-center font-display text-[clamp(2.75rem,4.6vw,4rem)] uppercase leading-none">{t("title")}</h1>
      <div className="relative z-10 grid w-full max-w-[1400px] items-end gap-8 px-6 pb-[54px] md:grid-cols-[1fr_532px] lg:px-[54px]">
        <MichelinRating count={3} className="gap-4" starClassName="size-8 text-canvas" />
        <div className="grid gap-8 sm:grid-cols-[250px_250px]">
          <h2 className="font-display text-2xl leading-[1.33]">{t("statement")}</h2>
          <p className="font-sans text-sm leading-[1.43]">{t("description")}</p>
        </div>
      </div>
    </section>
  );
}
