import { getTranslations } from "next-intl/server";

export async function FaqHeroSection() {
  const t = await getTranslations("faq");

  return (
    <section
      aria-labelledby="faq-title"
      className="flex w-full justify-center bg-canvas px-4 pb-10 pt-16 sm:px-6 lg:pb-14 lg:pt-24"
    >
      <div className="mx-auto flex max-w-[640px] flex-col items-center gap-4 text-center">
        <h1
          id="faq-title"
          className="font-display text-[clamp(2.5rem,4.6vw,3.375rem)] font-normal uppercase leading-none tracking-[-0.02em]"
        >
          {t("heroTitle")}
        </h1>
        <p className="max-w-[440px] font-sans text-sm leading-[1.43] text-muted-ink">
          {t("heroIntro")}
        </p>
      </div>
    </section>
  );
}