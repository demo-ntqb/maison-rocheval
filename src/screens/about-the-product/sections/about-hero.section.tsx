import { getTranslations } from "next-intl/server";

import { Picture } from "@/shared/components/ui/picture";
import { SplitText } from "@/shared/components/ui/split-text";
import { COLLECTION_IMAGES } from "../constants/about-the-product.constant";

export async function AboutHeroSection() {
  const t = await getTranslations("aboutProduct.hero");

  return (
    <section
      data-slot="about-product-hero"
      data-node-id="409:18438"
      aria-labelledby="about-product-title"
      /* -mt-20 slides the section under the 80px sticky header, which sits
         over the photograph exactly as it does in the Figma frame. */
      className="relative -mt-20 h-svh lg:h-screen w-full overflow-hidden bg-warm"
    >
      <Picture
        basePath={COLLECTION_IMAGES.heroDesktop}
        artDirected={[{ basePath: COLLECTION_IMAGES.heroMobile, media: "(max-width: 767px)" }]}
        fallbackExtension="jpg"
        alt={t("imageAlt")}
        priority
        width={1397}
        height={799}
        sizes="100vw"
        pictureClassName="absolute inset-0 block size-full"
        className="block size-full object-cover object-[52%_53%]"
      />
      <SplitText
        as="h1"
        id="about-product-title"
        data-node-id="409:18441"
        className="relative z-10 px-4 pt-[112px] text-center font-display text-[clamp(1.75rem,9.5vw,2.5rem)] uppercase leading-normal text-ink"
        by="words"
        stagger={40}
      >
        {t("title")}
      </SplitText>
    </section>
  );
}
