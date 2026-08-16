import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { IconMaisonRochevalLogo } from "@/shared/components/icons/maison-rocheval-logo";
import { Button } from "@/shared/components/ui/button";

export async function NotFoundHeroSection() {
  const t = await getTranslations("notFound.hero");

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
        <Link href="/" prefetch={false}>{t("cta")}</Link>
      </Button>
    </section>
  );
}
