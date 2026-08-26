import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { IconMaisonRochevalLogo } from "@/shared/components/icons/maison-rocheval-logo";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { CAVIAR_COLLECTION } from "@/shared/constants/collection.constant";
import { ROUTES } from "@/shared/constants/route.constant";
import { navigation } from "@/shared/constants/site.constant";

interface FooterProps {
  locale: string;
}

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });

  const caviarLinks = CAVIAR_COLLECTION.map((caviar) => {
    return {
      id: caviar.id,
      href: `${ROUTES.ABOUT_PRODUCT}?tab=${caviar.id}`,
      title: t(`nav.${caviar.translationKey}`),
      plumbId: caviar.plumbId,
    };
  });

  return (
    <TooltipProvider>
      <footer className="flex w-full flex-col items-center gap-13.5 bg-warm px-8 py-13.5 text-ink lg:px-0 lg:py-25 lg:gap-16" data-plumb-id="footer">
        <div className="flex w-full max-w-content flex-col justify-between gap-8 lg:min-h-75 lg:flex-row lg:gap-16" data-plumb-id="frame-2085667113">
          <div className="flex w-full flex-col border-b-[0.5px] border-stone pb-8 lg:max-w-70 lg:border-b-0 lg:pb-0" data-plumb-id="frame-2085666973">
            <div className="flex flex-col gap-8" data-plumb-id="frame-2085667166">
              <div className="flex flex-col gap-3" data-plumb-id="frame-2085667118">
                <strong className="font-display text-sm font-bold leading-4.25" data-plumb-id="contact">
                  {t("contact")}
                </strong>
                <div className="flex flex-col font-sans text-sm leading-4.5" data-plumb-id="frame-2085667148">
                  <span className="flex flex-col gap-1" data-plumb-id="email-support-maisonrocheval-com">
                    <span>{t("emailLabel")}</span>
                  </span>
                </div>
              </div>
              <Button
                asChild
                className="w-29 text-xs"
              >
                <Link href={ROUTES.CONTACT}>
                  <span data-plumb-id="enquire-more">{t("enquireButton")}</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-row flex-wrap gap-13.5 w-full lg:grid lg:grid-cols-3 lg:max-w-139.75 lg:gap-25" data-plumb-id="frame-2085666976">
            <div className="flex flex-col gap-4" data-plumb-id="frame-2085666973-2">
              <strong className="font-display text-base font-bold leading-4.75">
                <span data-plumb-id="caviar">{t("menu.caviar")}</span>
              </strong>
              <ul className="flex flex-col gap-4 font-sans text-sm leading-4.5" data-plumb-id="frame-2085667148-2">
                {caviarLinks.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="flex py-1 lg:py-0 items-center transition-opacity hover:opacity-60">
                      <span data-plumb-id={link.plumbId}>{link.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4" data-plumb-id="frame-2085666974">
              <strong className="font-display text-base font-bold leading-4.75">
                <span data-plumb-id="maison-rocheval">{t("menu.brand")}</span>
              </strong>
              <ul className="flex flex-col gap-4 font-sans text-sm leading-4.5" data-plumb-id="frame-2085667148-3">
                {navigation.footer.brand.map((link, index) => {
                  const isShop = link.id === "shop";

                  return (
                    <li key={link.id}>
                      {isShop ? (
                        <>
                          {/* Desktop version with shadcn tooltip */}
                          <div className="hidden lg:inline-block">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  aria-disabled="true"
                                  className="flex py-1 lg:py-0 items-center text-ink opacity-40 cursor-not-allowed focus-visible:outline-none"
                                  data-plumb-id="shop"
                                >
                                  {t(`nav.${link.id}`)}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent
                                hideArrow
                                side="bottom"
                              >
                                {t("comingSoonTooltip")}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          {/* Mobile version */}
                          <div className="flex lg:hidden py-1 items-center text-ink opacity-40 cursor-default">
                            <span data-plumb-id="shop-coming-soon">
                              {t("shopComingSoon")}
                            </span>
                          </div>
                        </>
                      ) : (
                        <Link
                          href={link.href}
                          className="flex py-1 lg:py-0 items-center transition-opacity hover:opacity-60"
                        >
                          <span data-plumb-id={index === 0 ? "the-maison" : "shop"}>
                            {t(`nav.${link.id}`)}
                          </span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex flex-col gap-4" data-plumb-id="frame-2085666975">
              <strong className="font-display text-base font-bold leading-4.75">
                <span data-plumb-id="customer-care">{t("menu.care")}</span>
              </strong>
              <ul className="flex flex-col gap-4 font-sans text-sm leading-4.5" data-plumb-id="frame-2085667148-4">
                {navigation.footer.care.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="flex py-1 lg:py-0 items-center transition-opacity hover:opacity-60">
                      <span data-plumb-id={link.id === "faq" ? "faq" : link.id === "contact" ? "contact-2" : link.id}>{t(`nav.${link.id}`)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <IconMaisonRochevalLogo className="h-16 w-33.75" aria-label="Maison Rocheval Paris" data-plumb-id="group" />
      </footer>
    </TooltipProvider>
  );
}
