import {
  AboutFaqSection,
  AboutHeroSection,
  AboutHistorySection,
  AboutSelectionSection,
} from "@/screens/about-the-brand";
import { setRequestLocale } from "next-intl/server";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col w-full">
      <AboutHeroSection />
      <AboutHistorySection />
      <AboutSelectionSection />
      <AboutFaqSection />
    </div>
  );
}
