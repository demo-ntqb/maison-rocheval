import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  AboutCollectionSection,
  AboutHeroSection,
  AboutOriginSection,
} from "@/screens/about-the-product";
import { COLLECTION_CAVIARS } from "@/screens/about-the-product/constants/about-the-product.constant";
import { ROUTES } from "@/shared/constants/route.constant";
import { SITE_URL } from "@/shared/constants/site.constant";
import {
  generateComingSoonMetadata,
  generateJsonLd,
  generatePageMetadata,
  isComingSoon,
  localizedPath,
} from "@/shared/lib/metadata";

/**
 * `COLLECTION_CAVIARS` uses "expression" (matches its own asset filenames);
 * the live product route uses "lexpression" — see `LEGACY_HANDLES` in
 * `products/[handle]/page.tsx`, which still 301s the shorter form.
 */
const PRODUCT_HANDLES: Record<string, string> = {
  expression: "lexpression",
};

const OG_IMAGE = "/images/about-product/collection/og-hero.jpg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (isComingSoon()) return generateComingSoonMetadata(locale);

  const t = await getTranslations({ locale, namespace: "metadata.aboutProduct" });

  return generatePageMetadata(locale, t("title"), t("description"), {
    canonical: "/about-the-product",
    image: new URL(OG_IMAGE, SITE_URL).toString(),
  });
}

export default async function AboutProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [nav, meta, collection] = await Promise.all([
    getTranslations({ locale, namespace: "header.nav" }),
    getTranslations({ locale, namespace: "metadata.aboutProduct" }),
    getTranslations({ locale, namespace: "aboutProduct.collection" }),
  ]);

  const pageUrl = new URL(localizedPath(locale, ROUTES.ABOUT_PRODUCT), SITE_URL).toString();

  const breadcrumbJsonLd = generateJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: nav("home"), item: new URL(localizedPath(locale, ROUTES.HOME), SITE_URL).toString() },
      { "@type": "ListItem", position: 2, name: nav("collection"), item: pageUrl },
    ],
  });

  // The five caviars as an ItemList of Products, so search engines can read the
  // collection's actual contents rather than just the hero copy around them.
  // name/description echo the <title>/meta description rather than the
  // mid-page "Understanding our collection" heading, so every surface — tab,
  // SERP snippet, and structured data — describes the page the same way.
  const collectionJsonLd = generateJsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: meta("title"),
    description: meta("description"),
    url: pageUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: COLLECTION_CAVIARS.map((caviar, index) => {
        const handle = PRODUCT_HANDLES[caviar.id] ?? caviar.id;
        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: collection(`products.${caviar.id}.name`),
            description: collection(`products.${caviar.id}.tastingNotes`),
            image: new URL(`${caviar.closedTin}.png`, SITE_URL).toString(),
            url: new URL(localizedPath(locale, ROUTES.PRODUCT_DETAIL(handle)), SITE_URL).toString(),
          },
        };
      }),
    },
  });

  return (
    <div className="flex w-full flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: collectionJsonLd }} />
      <AboutHeroSection />
      <AboutOriginSection />
      <AboutCollectionSection />
    </div>
  );
}
