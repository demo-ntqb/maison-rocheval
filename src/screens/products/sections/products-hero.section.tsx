import { getTranslations } from "next-intl/server";

export async function ProductsHeroSection() {
  const t = await getTranslations("products.hero");

  return (
    <section className="sr-only" aria-labelledby="products-page-title">
      <h1 id="products-page-title">{t("title")}</h1>
    </section>
  );
}
