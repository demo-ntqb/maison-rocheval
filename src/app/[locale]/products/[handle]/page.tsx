import { setRequestLocale } from "next-intl/server";

import { ProductDetailMainSection } from "@/screens/product-detail";

const productHandles = ["caviar-amur", "caviar-kaluga", "caviar-russian-hybrid", "amour", "expression", "harmonie"] as const;

export function generateStaticParams() {
  return productHandles.map((handle) => ({ handle }));
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; handle: string }> }) {
  const { locale, handle } = await params;
  setRequestLocale(locale);
  return <ProductDetailMainSection handle={handle} />;
}
