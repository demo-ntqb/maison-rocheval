import { getTranslations } from "next-intl/server";

export async function AboutRitualSection() {
  const t = await getTranslations("aboutBrand.ritual");

  return (
    <section
      data-plumb-id="frame-2085667081"
      aria-labelledby="about-brand-ritual-title"
      className="flex w-full justify-center bg-warm py-[200px]"
    >
      <div
        data-plumb-id="frame-2085667122"
        className="flex w-full max-w-content flex-col gap-[54px]"
      >
        <div className="flex w-full flex-col items-end justify-center gap-4 md:flex-row md:gap-4">
          <h2
            data-plumb-id="lorem-ipsum-dolor-2"
            id="about-brand-ritual-title"
            className="font-display text-[clamp(3.25rem,6vw,5.25rem)] uppercase leading-[1.07]"
          >
            {t("title")}
          </h2>
          <p
            data-plumb-id="lorem-ipsum-dolor-4"
            className="flex-1 pb-2 text-right font-display text-[24px] leading-[1.33]"
          >
            {t("statement")}
          </p>
        </div>

        <img
          src="/images/about-brand/ritual-table.png"
          alt={t("heroImageAlt")}
          loading="lazy"
          decoding="async"
          width={1499}
          height={1049}
          sizes="(max-width: 1000px) 100vw, 1000px"
          className="aspect-square w-full object-cover"
          data-plumb-id="rectangle-4878-2"
          data-plumb-asset="c9671fa8e74583759e4aff7319996026f43c0655"
        />
      </div>
    </section>
  );
}
