import { getTranslations } from "next-intl/server";

import { Reveal } from "@/shared/components/ui/reveal";
import { SplitText } from "@/shared/components/ui/split-text";
import { AboutVenuesCarousel } from "../components/about-venues-carousel";

const VENUE_META: Record<string, { assetId: string; imageBasePath: string; plumbId: string; url: string }> = {
  willow: {
    assetId: "b287a40ae0d202331b00f3e19a7a2ec9776a3406",
    imageBasePath: "/images/about-brand/venue-company-b",
    plumbId: "frame-2085667156",
    url: "https://www.willowrestaurant.sg/",
  },
  alliance: {
    assetId: "ae5e7f472c12964cd17ddebff6f083e065134990",
    imageBasePath: "/images/about-brand/venue-alliance-figma",
    plumbId: "frame-2085667155",
    url: "https://www.restaurant-alliance.fr/en/",
  },
  sushiSakuta: {
    assetId: "dec8b5460594b1c032dd0c514207685f4e6d03e4",
    imageBasePath: "/images/about-brand/venue-company-c",
    plumbId: "frame-2085667157",
    url: "https://www.sushi-sakuta.com/",
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
      url: meta.url,
    };
  });

  return (
    <section
      data-plumb-id="frame-2085667111"
      aria-labelledby="about-brand-venues-title"
      className="flex w-full justify-center bg-warm py-50 overflow-hidden"
    >
      <div
        data-plumb-id="frame-2085667314"
        className="mx-auto flex w-full flex-col max-w-content gap-13.5 px-4 lg:px-0"
      >
        <div className="w-full flex flex-col items-center gap-4 text-center max-w-160 mx-auto">
          <SplitText
            as="h2"
            id="about-brand-venues-title"
            data-plumb-id="lorem-ipsum-dolor"
            className="font-display text-[32px] leading-none h-8"
            by="words"
            stagger={40}
          >
            {t("title")}
          </SplitText>
          <SplitText
            as="p"
            data-plumb-id="frame-2085667119"
            className="font-sans text-sm leading-[1.43] text-muted-ink"
            by="words"
            stagger={10}
          >
            {t("intro")}
          </SplitText>
        </div>
        <Reveal className="w-full" delay={120}>
          <AboutVenuesCarousel venues={venues} />
        </Reveal>
      </div>
    </section>
  );
}
