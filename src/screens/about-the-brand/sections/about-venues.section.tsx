import { getTranslations } from "next-intl/server";

import { Reveal } from "@/shared/components/ui/reveal";
import { AboutVenuesCarousel } from "../components/about-venues-carousel";

const VENUE_META: Record<string, { assetId: string; imageBasePath: string; plumbId: string }> = {
  willow: {
    assetId: "b287a40ae0d202331b00f3e19a7a2ec9776a3406",
    imageBasePath: "/images/about-brand/venue-company-b",
    plumbId: "frame-2085667156",
  },
  alliance: {
    assetId: "ae5e7f472c12964cd17ddebff6f083e065134990",
    imageBasePath: "/images/about-brand/venue-alliance-figma",
    plumbId: "frame-2085667155",
  },
  sushiSakuta: {
    assetId: "dec8b5460594b1c032dd0c514207685f4e6d03e4",
    imageBasePath: "/images/about-brand/venue-company-c",
    plumbId: "frame-2085667157",
  },
};

export async function AboutVenuesSection() {
  const t = await getTranslations("aboutBrand.venues");
  const venues = (["willow", "alliance", "sushiSakuta"] as const).map((key) => {
    const meta = VENUE_META[key];
    return {
      alt: t(`${key}.imageAlt`),
      assetId: meta.assetId,
      city: t(`${key}.city`),
      description: t(`${key}.description`),
      imageBasePath: meta.imageBasePath,
      name: t(`${key}.name`),
      plumbId: meta.plumbId,
      stars: Number(t(`${key}.stars`)),
    };
  });

  return (
    <section
      data-plumb-id="frame-2085667111"
      aria-labelledby="about-brand-venues-title"
      className="flex w-full justify-center bg-warm py-[200px]"
    >
      <div
        data-plumb-id="frame-2085667314"
        className="flex w-full flex-col max-w-container gap-[54px]"
      >
        <Reveal className="w-full flex flex-col items-center gap-4 text-center px-4 max-w-[640px] mx-auto">
          <h2
            id="about-brand-venues-title"
            data-plumb-id="lorem-ipsum-dolor"
            className="font-display text-[32px] leading-none"
          >
            {t("title")}
          </h2>
          <p
            data-plumb-id="frame-2085667119"
            className="font-sans text-sm leading-[1.43] text-muted-ink"
          >
            {t("intro")}
          </p>
        </Reveal>
        <Reveal className="w-full" delay={120}>
          <AboutVenuesCarousel venues={venues} />
        </Reveal>
      </div>
    </section>
  );
}
