import * as React from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";
import { Picture } from "@/shared/components/ui/picture";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSectionProps extends React.ComponentProps<"section"> {
  title?: string;
  subtitle?: string;
  items: FaqItem[];
  logoUrl?: string; // Tùy chọn logo thương hiệu nhỏ đè lên đầu section
  logoBasePath?: string;
  logoFallbackExtension?: "jpg" | "jpeg" | "png";
  logoAlt?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function FaqSection({
  title,
  subtitle,
  items,
  logoUrl,
  logoBasePath,
  logoFallbackExtension = "png",
  logoAlt = "Maison Rocheval Badge",
  buttonText,
  buttonLink,
  className,
  ...props
}: FaqSectionProps) {
  return (
    <section
      data-slot="faq-section"
      className={cn(
        "flex w-full max-w-[1000px] flex-col items-center gap-12 text-center",
        className
      )}
      {...props}
    >
      {/* Top Badge/Logo & Titles */}
      <div className="flex flex-col items-center gap-4 px-4">
        {logoBasePath ? (
          <Picture
            basePath={logoBasePath}
            fallbackExtension={logoFallbackExtension}
            alt={logoAlt}
            width={262}
            height={160}
            sizes="131px"
            pictureClassName="block h-20 w-[131px] overflow-hidden"
            className="size-full object-contain"
          />
        ) : logoUrl ? (
          <div className="relative h-20 w-[131px] overflow-hidden bg-transparent">
            <picture>
              <source srcSet={logoUrl} type="image/webp" />
              <img
                src={logoUrl}
                alt={logoAlt}
                width={262}
                height={160}
                sizes="131px"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </picture>
          </div>
        ) : null}

        {subtitle && (
          <span className="font-sans text-[11px] font-light tracking-widest text-gray-dark uppercase">
            {subtitle}
          </span>
        )}

        {title && (
          <h2 className="font-display text-[32px] font-medium leading-tight text-black">
            {title}
          </h2>
        )}
      </div>

      {/* Accordion List (w: 1000px) */}
      <div className="w-full text-left px-4 sm:px-6 lg:px-0">
        <Accordion type="single" collapsible className="w-full">
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="w-full flex items-center justify-between">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="w-full">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Bottom Text Button */}
      {buttonText && buttonLink && (
        <div className="pt-4">
          <Link
            href={buttonLink}
            className="-my-3 inline-flex min-h-11 items-center font-sans text-xs font-light tracking-widest text-black uppercase underline decoration-gray-light underline-offset-4 hover:text-gray-dark focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {buttonText}
          </Link>
        </div>
      )}
    </section>
  );
}
