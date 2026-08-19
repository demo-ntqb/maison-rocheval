import { getTranslations } from "next-intl/server";

import { HomeHeroStage } from "../components/home-hero-stage";

export async function HomeHeroSection() {
  const t = await getTranslations("home.hero");

  return <HomeHeroStage imageAlt={t("imageAlt")} title={t("title")} />;
}
