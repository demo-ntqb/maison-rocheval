import { useTranslations } from "next-intl";

export function HomeHeroSection() {
  const t = useTranslations("home.hero");

  return (
    <section className="section container-base">
      <h1 className="h1">{t("title")}</h1>
      <p className="body-lg mt-4">{t("description")}</p>
    </section>
  );
}
