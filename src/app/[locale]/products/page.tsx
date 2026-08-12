import {
  ShopFaqSection,
  ShopFeaturedSection,
  ShopHeroSection,
  ShopProductsSection,
} from "@/screens/shop";
import { setRequestLocale } from "next-intl/server";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col w-full bg-white">
      <ShopHeroSection />
      <ShopProductsSection />
      <ShopFeaturedSection />
      <ShopFaqSection />
    </div>
  );
}
