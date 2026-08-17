import {
  HomeAboutSection,
  HomeHeroSection,
  HomeIntroSection,
  HomeProductsSection,
} from "@/screens/home";
import { setRequestLocale } from "next-intl/server";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex w-full flex-col" data-screen="home">
      <HomeHeroSection />
      <HomeIntroSection />
      <HomeAboutSection />
      <HomeProductsSection locale={locale} />
    </div>
  );
}
