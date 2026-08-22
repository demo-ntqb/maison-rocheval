import { getTranslations } from "next-intl/server";

export async function PrivacyPolicyHeroSection() {
  const t = await getTranslations("privacyPolicy");

  return (
    <section
      aria-labelledby="privacy-policy-title"
      className="flex w-full justify-center bg-canvas px-4 pt-[100px] sm:px-6"
    >
      <div className="mx-auto flex w-full max-w-content flex-col items-center gap-3 text-center">
        <h1
          id="privacy-policy-title"
          className="font-display text-[32px] font-normal leading-8 text-black"
        >
          {t("heroTitle")}
        </h1>
        <p className="font-sans text-sm leading-5 text-ink-soft">{t("lastUpdated")}</p>
        <div className="mt-4 flex w-full flex-col gap-3 text-left font-sans text-sm leading-5 text-black">
          <p>{t("intro1")}</p>
          <p>{t("intro2")}</p>
        </div>
      </div>
    </section>
  );
}
