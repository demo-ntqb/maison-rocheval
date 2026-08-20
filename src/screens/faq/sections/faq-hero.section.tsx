import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/shared/constants/route.constant";

export async function FaqHeroSection() {
  const t = await getTranslations("faq");

  return (
    <section
      aria-labelledby="faq-title"
      className="flex w-full justify-center bg-canvas px-4 pt-[100px] sm:px-6"
    >
      <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-[54px] text-center">
        <picture className="block h-[74px] w-[121px] overflow-hidden">
          <source srcSet="/images/faq/faq-caviar.avif" type="image/avif" />
          <source srcSet="/images/faq/faq-caviar.webp" type="image/webp" />
          <img
            src="/images/faq/faq-caviar.png"
            alt=""
            aria-hidden="true"
            width={121}
            height={74}
            sizes="121px"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </picture>
        <div className="flex w-full max-w-[650px] flex-col items-center gap-3 px-0 text-center max-sm:px-8">
        <h1
          id="faq-title"
          className="font-display text-[32px] font-normal leading-8 text-black"
        >
          {t("heroTitle")}
        </h1>
        <p className="font-sans text-sm leading-5 text-black">
          {t.rich("heroIntro", {
            link: (chunks) => (
              <Link href={ROUTES.CONTACT} className="underline underline-offset-2">
                {chunks}
              </Link>
            ),
          })}
        </p>
        </div>
      </div>
    </section>
  );
}
