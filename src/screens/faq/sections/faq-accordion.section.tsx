import { getTranslations } from "next-intl/server";

import { FaqPageAccordion } from "../components/faq-page-accordion";
import type { FaqItem } from "../types/faq.type";

type FaqTranslationItem = FaqItem;

function isFaqTranslationItem(value: unknown): value is FaqTranslationItem {
  return typeof value === "object" && value !== null && "question" in value && "answer" in value;
}

export async function FaqAccordionSection() {
  const t = await getTranslations("faq");
  const rawItems = t.raw("items");

  return (
    <section
      aria-label="Frequently asked questions"
      className="flex w-full justify-center bg-canvas px-4 pb-[200px] pt-[54px] sm:px-6"
    >
      <FaqPageAccordion items={rawItems as FaqTranslationItem[]} />
    </section>
  );
}
