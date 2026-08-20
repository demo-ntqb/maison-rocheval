import { getTranslations } from "next-intl/server";

import type { RouteLocale } from "@/i18n/route-locale";
import { ROUTES } from "@/shared/constants/route.constant";
import { IconMaisonRochevalLogo } from "@/shared/components/icons/maison-rocheval-logo";
import { Button } from "@/shared/components/ui/button";
import { localizedPath } from "@/shared/lib/metadata";
import Link from "next/link";

export async function NotFoundHeroSection({ locale }: { locale: RouteLocale }) {
  const t = await getTranslations({ locale, namespace: "notFound.hero" });
  const homeHref = localizedPath(locale, ROUTES.HOME);

  return (
    <section
      aria-labelledby="not-found-title"
      data-slot="not-found-hero-section"
      className="flex h-dvh w-full flex-col items-center justify-center gap-10 bg-ink px-4 text-center"
    >
      <IconMaisonRochevalLogo
        className="h-auto w-[169px] text-canvas"
        aria-hidden="true"
        focusable="false"
      />

      <div className="flex flex-col items-center gap-4">
        <p aria-hidden="true" className="font-display text-display-statement leading-none text-canvas/40">
          {t("eyebrow")}
        </p>
        <h1 id="not-found-title" className="font-display text-section-title font-normal text-canvas">
          <span className="sr-only">{t("brand")} — </span>
          {t("heading")}
        </h1>
        <p className="max-w-sm text-sm text-canvas/70">{t("description")}</p>
      </div>

      <Button asChild variant="outline" className="border-canvas bg-transparent text-canvas hover:bg-canvas hover:text-ink">
        <Link href={homeHref} prefetch={false}>{t("cta")}</Link>
      </Button>
    </section>
  );
}
