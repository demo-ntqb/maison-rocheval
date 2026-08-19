import { getTranslations } from "next-intl/server";

export async function ContactHeroSection() {
  const t = await getTranslations("contact");

  return (
    <section
      aria-labelledby="contact-title"
      className="flex w-full justify-center bg-warm px-4 py-24 sm:px-6 lg:py-[120px]"
    >
      <div className="mx-auto flex max-w-[640px] flex-col items-center gap-6 text-center">
        <h1
          id="contact-title"
          className="font-display text-[clamp(2.5rem,4.6vw,3.375rem)] font-normal uppercase leading-none tracking-[-0.02em]"
        >
          {t("heroTitle")}
        </h1>
        <p className="max-w-[440px] font-sans text-sm leading-[1.43] text-muted-ink">
          {t("heroIntro")}
        </p>
        <a
          href={`mailto:${t("email")}`}
          className="inline-flex min-h-11 items-center font-sans text-sm font-normal underline decoration-gray-light underline-offset-4 hover:text-gray-dark focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {t("emailLabel")}
        </a>
        <p className="font-sans text-xs text-gray-dark">{t("respondNote")}</p>
      </div>
    </section>
  );
}