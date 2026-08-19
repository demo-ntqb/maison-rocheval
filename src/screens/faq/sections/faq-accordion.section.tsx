import { getTranslations } from "next-intl/server";

import { FaqSection } from "@/shared/components/composite/faq-section";

export async function FaqAccordionSection() {
  const t = await getTranslations("faq");
  const items = Array.from({ length: 5 }, (_, index) => ({
    id: `faq-${index + 1}`,
    question: t(`items.${index}.question`),
    answer: t(`items.${index}.answer`),
  }));

  return (
    <div className="flex w-full justify-center bg-canvas pb-24 lg:pb-[120px]">
      <FaqSection items={items} />
    </div>
  );
}