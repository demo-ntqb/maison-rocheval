import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { IconMaisonRochevalLogo } from "@/shared/components/icons/maison-rocheval-logo";
import { navigation } from "@/shared/constants/site.constant";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="flex w-full flex-col items-center gap-16 bg-warm px-4 py-24 text-ink sm:px-6 lg:px-0 lg:py-[100px]" data-plumb-id="component-6-5">
        <div className="flex w-full max-w-content flex-col justify-between gap-16 lg:h-[300px] lg:flex-row" data-plumb-id="frame-2085667113">
          <div className="flex w-full max-w-[280px] flex-col" data-plumb-id="frame-2085666973">
            <div className="flex flex-col gap-8" data-plumb-id="frame-2085667166">
              <div className="flex h-20 w-[249px] flex-col gap-3" data-plumb-id="frame-2085667118-4">
                <strong className="font-display text-sm font-bold leading-[17px]" data-plumb-id="contact">
                  {t("contact")}
                </strong>
                <div className="flex h-[51px] flex-col font-sans text-xs leading-[15px]" data-plumb-id="frame-2085667148">
                  <span className="flex h-[51px] flex-col justify-between" data-plumb-id="email-support-maisonrocheval-com">
                    <span>{t("emailLabel")}</span>
                    <span>{t("respondNote")}</span>
                  </span>
                </div>
              </div>
              <Link
                href="/contact"
                className="-my-[6.5px] inline-flex min-h-11 w-fit items-center justify-center rounded-brand bg-navy-dark px-5 font-sans text-xs text-canvas transition-colors hover:bg-ink"
              >
                <span data-plumb-id="enquire-more">{t("enquireButton")}</span>
              </Link>
            </div>
          </div>

          <div className="grid w-full gap-12 sm:grid-cols-3 lg:max-w-[559px] lg:gap-[100px]" data-plumb-id="frame-2085666976">
            <div className="flex flex-col gap-4" data-plumb-id="frame-2085666973-2">
              <strong className="font-display text-base font-bold leading-[19px]">
                <span data-plumb-id="caviar">{t("menu.caviar")}</span>
              </strong>
              <ul className="flex flex-col gap-1 font-sans text-sm leading-[18px] lg:gap-4" data-plumb-id="frame-2085667148-2">
                {navigation.footer.caviar.map((link, index) => (
                  <li key={link.id}>
                    <Link href={link.href} className="flex min-h-11 items-center transition-opacity hover:opacity-60 lg:min-h-0">
                      <span data-plumb-id={["patrimoine", "heritage", "reserve", "assemblage", "source", "all-caviar"][index]}>{t(`nav.${link.id}`)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4" data-plumb-id="frame-2085666974">
              <strong className="font-display text-base font-bold leading-[19px]">
                <span data-plumb-id="maison-rocheval">{t("menu.brand")}</span>
              </strong>
              <ul className="flex flex-col gap-1 font-sans text-sm leading-[18px] lg:gap-4" data-plumb-id="frame-2085667148-3">
                {navigation.footer.brand.map((link, index) => (
                  <li key={link.id}>
                    <Link href={link.href} className="flex min-h-11 items-center transition-opacity hover:opacity-60 lg:min-h-0">
                      <span data-plumb-id={index === 0 ? "our-brand-2" : "our-collection-2"}>{t(`nav.${link.id}`)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4" data-plumb-id="frame-2085666975">
              <strong className="font-display text-base font-bold leading-[19px]">
                <span data-plumb-id="customer-care">{t("menu.care")}</span>
              </strong>
              <ul className="flex flex-col gap-1 font-sans text-sm leading-[18px] lg:gap-4" data-plumb-id="frame-2085667148-4">
                {navigation.footer.care.map((link, index) => (
                  <li key={link.id}>
                    <Link href={link.href} className="flex min-h-11 items-center transition-opacity hover:opacity-60 lg:min-h-0">
                      <span data-plumb-id={index === 0 ? "faq" : "contact-2"}>{t(`nav.${link.id}`)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      <IconMaisonRochevalLogo className="h-16 w-[135px]" aria-label="Maison Rocheval Paris" data-plumb-id="group-17" />
    </footer>
  );
}
