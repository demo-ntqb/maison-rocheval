import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PrivacyPolicyContentSection, PrivacyPolicyHeroSection } from "@/screens/privacy-policy";
import { ROUTES } from "@/shared/constants/route.constant";
import { generatePageMetadata } from "@/shared/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: "metadata.privacyPolicy" });

  return generatePageMetadata(locale, t("title"), t("description"), {
    canonical: ROUTES.PRIVACY_POLICY,
  });
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex w-full flex-col bg-canvas" data-screen="privacy-policy">
      <PrivacyPolicyHeroSection />
      <PrivacyPolicyContentSection />
    </div>
  );
}
