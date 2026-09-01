import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Picture } from "@/shared/components/ui/picture";
import { ROUTES } from "@/shared/constants/route.constant";
import { localizedPath } from "@/shared/lib/metadata";

import { AccessGateForm } from "../components/access-gate-form";

interface AccessGateHeroSectionProps {
  hasError: boolean;
  locale: string;
}

export async function AccessGateHeroSection({ hasError, locale }: AccessGateHeroSectionProps) {
  const t = await getTranslations("accessGate");

  return (
    <section
      aria-labelledby="access-gate-title"
      data-slot="access-gate-hero"
      data-plumb-id="frame-2085667301"
      className="relative -mt-20 h-svh w-full overflow-hidden bg-warm lg:h-screen"
    >
      <Picture
        basePath="/images/access-gate/hero-desktop"
        artDirected={[{ basePath: "/images/access-gate/hero-mobile", media: "(max-width: 767px)" }]}
        fallbackExtension="png"
        alt=""
        aria-hidden="true"
        priority
        width={1400}
        height={800}
        sizes="100vw"
        pictureClassName="absolute inset-0 block size-full"
        className="block size-full object-cover"
      />

      <div className="relative z-10 flex h-full w-full flex-col items-center px-8 pt-[88px] lg:pt-[112px]" data-plumb-id="frame">
        <div className="flex w-full max-w-[364px] flex-col items-center gap-6 text-center lg:max-w-[450px]" data-plumb-id="component-6">
          <div className="flex flex-col items-center gap-4" data-plumb-id="component-7">
            <h1 className="font-display text-[32px] font-normal leading-8 text-ink" data-plumb-id="lorem-ipsum-dolor-2" id="access-gate-title">
              {t("title")}
            </h1>
            <p className="font-sans text-sm leading-5 text-ink" data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a">
              <span className="lg:hidden">{t("description.mobile.before")} </span>
              <span className="hidden lg:inline">{t("description.desktop.before")} </span>
              <Link aria-label={t("description.contactLabel")} className="underline underline-offset-2" href={ROUTES.CONTACT}>
                {t("description.link")}
                <span className="sr-only"> {t("description.contactLinkSuffix")}</span>
              </Link>
              {t("description.after")}
            </p>
          </div>
          <AccessGateForm
            action={localizedPath(locale, ROUTES.SHOP)}
            error={t("form.error")}
            hasError={hasError}
            placeholder={t("form.placeholder")}
            submit={t("form.submit")}
          />
        </div>
      </div>
    </section>
  );
}
