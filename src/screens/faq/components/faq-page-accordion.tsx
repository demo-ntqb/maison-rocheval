"use client";

import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import type { FaqItem } from "../types/faq.type";

export function FaqPageAccordion({ items }: { items: FaqItem[] }) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  return (
    <Accordion
      type="multiple"
      value={openItems}
      onValueChange={setOpenItems}
      className="w-full max-w-[1000px]"
    >
      {items.map((item, index) => (
        <AccordionItem key={`${item.question}-${index}`} value={`faq-${index + 1}`}>
          <AccordionTrigger
            indicator="plus"
            className="gap-4 border-b border-stone py-6 pr-4 font-display text-[18px] font-normal leading-8 text-black transition-[padding-bottom,border-color] duration-300 ease-out data-[state=open]:border-b-transparent data-[state=open]:pb-0 lg:py-10 lg:text-[20px] lg:data-[state=open]:pb-0"
          >
            <span className="min-w-0">{item.question}</span>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1 pb-6 pt-1 font-sans text-sm leading-5 text-gray-heavy group-data-[state=open]/accordion-content:border-b group-data-[state=open]/accordion-content:border-stone lg:pb-10 lg:pt-2">
            <div className="flex flex-col gap-2 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:list-disc [&_ul]:pl-4 [&_strong]:font-medium [&_.text-stone]:text-[var(--palette-stone)]" dangerouslySetInnerHTML={{ __html: item.answer }} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
