import { setRequestLocale } from "next-intl/server";

import { ComingSoonHeroSection } from "@/screens/coming-soon";

export default async function ComingSoon({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex w-full flex-col" data-screen="coming-soon">
      <ComingSoonHeroSection />
    </div>
  );
}
