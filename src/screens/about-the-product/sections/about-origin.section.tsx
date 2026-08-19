import { getTranslations } from "next-intl/server";

import { Picture } from "@/shared/components/ui/picture";
import { Reveal } from "@/shared/components/ui/reveal";
import { COLLECTION_IMAGES } from "../constants/about-the-product.constant";

export async function AboutOriginSection() {
  const t = await getTranslations("aboutProduct.origin");

  return (
    <section
      data-slot="about-product-origin"
      data-node-id="410:22985"
      aria-labelledby="about-product-origin-title"
      className="w-full bg-canvas pt-[200px]"
    >
      <div className="mx-auto flex w-full max-w-content flex-col items-center gap-[54px] px-4 lg:px-0">
        <Reveal className="flex w-full max-w-[640px] flex-col items-center gap-4 px-8 text-center lg:px-0">
          <h2
            id="about-product-origin-title"
            className="font-display text-section-title text-ink"
          >
            {t("title")}
          </h2>
          <p className="font-sans text-sm leading-5 text-ink">{t("description")}</p>
        </Reveal>

        <Reveal className="w-full" delay={120}>
          <Picture
            basePath={COLLECTION_IMAGES.sturgeonDesktop}
            artDirected={[{ basePath: COLLECTION_IMAGES.sturgeonMobile, media: "(max-width: 767px)" }]}
            fallbackExtension="jpg"
            alt={t("imageAlt")}
            width={1222}
            height={855}
            sizes="(max-width: 1024px) 100vw, 1000px"
            pictureClassName="block w-full"
            className="block aspect-[33/50] w-full rounded-brand object-cover md:aspect-[10/7]"
          />
        </Reveal>
      </div>
    </section>
  );
}
