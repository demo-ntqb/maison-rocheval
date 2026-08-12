import React from "react";
import { getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";
import { Link } from "@/i18n/navigation";
import { navigation, businessInfo } from "@/shared/constants/site.constant";

async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer() {
  const [t, currentYear] = await Promise.all([
    getTranslations("footer"),
    getCurrentYear(),
  ]);

  return (
    <footer className="w-full bg-beige text-black border-t border-black/5" data-plumb-id="footer">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Main Section */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-start">
          {/* Left Column: Contact & Action */}
          <div className="lg:col-span-4 flex flex-col gap-6" data-plumb-id="frame-2085667166">
            <div className="flex flex-col gap-3" data-plumb-id="frame-2085667118">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider" data-plumb-id="contact">
                {t("contact")}
              </h3>
              <div className="flex flex-col gap-1 font-sans text-sm font-light text-black/80" data-plumb-id="frame-2085667148">
                <span className="font-medium" data-plumb-id="email-support-maisonrocheval-com">
                  {t("emailLabel")}
                </span>
                <span className="text-xs text-black/60">
                  {t("respondNote")}
                </span>
              </div>
            </div>
            
            <Link
              href="/contact"
              className="inline-flex w-fit items-center justify-center rounded-sm bg-navy-dark px-6 py-2.5 text-xs font-medium tracking-wider text-white uppercase transition-colors hover:bg-black/90"
              data-plumb-id="frame-2085667116"
            >
              {t("enquireButton")}
            </Link>
          </div>

          {/* Right Column: Menu Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8" data-plumb-id="frame-2085666976">
            {/* Column 1: Caviar */}
            <div className="flex flex-col gap-4" data-plumb-id="frame-2085666973">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider">
                {t("menu.caviar")}
              </h4>
              <ul className="flex flex-col gap-2 font-sans text-sm font-light text-black/70">
                {navigation.footer.caviar.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="hover:text-black transition-colors">
                      {t(`nav.${link.id}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Brand */}
            <div className="flex flex-col gap-4" data-plumb-id="frame-2085666974">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider">
                {t("menu.brand")}
              </h4>
              <ul className="flex flex-col gap-2 font-sans text-sm font-light text-black/70">
                {navigation.footer.brand.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="hover:text-black transition-colors">
                      {t(`nav.${link.id}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Customer Care */}
            <div className="flex flex-col gap-4" data-plumb-id="frame-2085666975">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider">
                {t("menu.care")}
              </h4>
              <ul className="flex flex-col gap-2 font-sans text-sm font-light text-black/70">
                {navigation.footer.care.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="hover:text-black transition-colors">
                      {t(`nav.${link.id}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-black/5 flex flex-col items-center gap-6" data-plumb-id="group">
          {/* Large Decorative Text Logo */}
          <div className="text-center group select-none">
            <span className="font-display text-2xl sm:text-3xl font-medium tracking-[0.3em] text-black">
              MAISON ROCHEVAL
            </span>
          </div>

          <p className="font-sans text-[11px] font-light tracking-widest text-black/40 uppercase">
            {t("copyright", { year: currentYear, name: businessInfo.name })}
          </p>
        </div>
      </div>
    </footer>
  );
}
