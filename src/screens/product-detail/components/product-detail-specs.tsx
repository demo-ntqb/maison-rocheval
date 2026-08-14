"use client";

import { useTranslations } from "next-intl";

import { RichText } from "@shopify/hydrogen-react";

import { Link } from "@/i18n/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import type { CatalogProductDetail } from "@/shared/lib/shopify/catalog-mapper";

function SpecRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="font-display text-xs font-normal uppercase tracking-wider text-black">{label}</dt>
      <dd className="text-right font-sans text-xs text-black font-light">{value}</dd>
    </div>
  );
}

function isRichTextAst(data?: string): boolean {
  if (!data) return false;
  try {
    const parsed: unknown = JSON.parse(data);
    return Boolean(
      parsed &&
      typeof parsed === "object" &&
      "type" in parsed &&
      parsed.type === "root" &&
      "children" in parsed &&
      Array.isArray(parsed.children),
    );
  } catch {
    return false;
  }
}

function SpecRichText({ data, className }: { data: string; className?: string }) {
  if (!data) return null;
  if (!isRichTextAst(data)) {
    return <span className={className || "whitespace-pre-line"}>{data}</span>;
  }

  return (
    <RichText
      data={data}
      as="div"
      className={className}
      components={{
        link: ({ node }) => (
          <Link
            href={node.url}
            className="text-palette-accent underline transition-opacity hover:opacity-80"
          >
            {node.children}
          </Link>
        ),
        list: ({ node }) => <ul className="my-1 list-disc space-y-1 pl-4">{node.children}</ul>,
        listItem: ({ node }) => <li className="leading-relaxed">{node.children}</li>,
        paragraph: ({ node }) => <p className="mb-2 leading-relaxed">{node.children}</p>,
        heading: ({ node }) => (
          <p className="mb-2 leading-relaxed">
            <strong className="font-medium text-black">{node.children}</strong>
          </p>
        ),
        text: ({ node }) => {
          let content: React.ReactNode = node.value;
          if (node.bold) content = <strong className="font-medium text-black">{content}</strong>;
          if (node.italic) content = <em className="italic">{content}</em>;
          return content;
        },
      }}
    />
  );
}

function SpecBlock({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  if (!value && !children) return null;
  return (
    <div className="flex flex-col gap-2">
      <dt className="font-display text-xs uppercase tracking-wider text-black">{label}</dt>
      <dd className="font-sans text-xs text-black font-light leading-relaxed">
        {children ? children : <SpecRichText data={value!} />}
      </dd>
    </div>
  );
}

export function ProductDetailSpecs({ product }: { product: CatalogProductDetail }) {
  const t = useTranslations("productDetail.specs");

  const hasSpecification = Boolean(
    product.description ||
    product.specs?.pearlSize ||
    product.specs?.salt ||
    product.specs?.color ||
    product.specs?.tastingNotes ||
    product.specs?.ingredients ||
    product.specs?.nutritionalData,
  );

  const hasServing = Boolean(
    product.shelfLife ||
    product.storage ||
    product.serving,
  );

  const hasDelivery = Boolean(
    product.delivery?.shipping ||
    product.delivery?.duration,
  );

  const hasGifting = Boolean(
    product.gifting?.box ||
    product.gifting?.message ||
    product.gifting?.addOns,
  );

  if (!hasSpecification && !hasServing && !hasDelivery && !hasGifting) {
    return null;
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={hasSpecification ? ["specification"] : []}
      className="w-full gap-4"
    >
      {/* Specification */}
      {hasSpecification ? (
        <AccordionItem value="specification">
          <AccordionTrigger className="pb-4 pt-0 font-display text-base font-bold uppercase tracking-wider">
            {t("specificationTitle")}
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-6 py-4">
            {product.description ? (
              <SpecRichText
                data={product.description}
                className="font-sans text-xs leading-relaxed text-black/80"
              />
            ) : null}
            <dl className="flex flex-col gap-6">
              <SpecRow label={t("pearlSize")} value={product.specs?.pearlSize} />
              <SpecRow label={t("salt")} value={product.specs?.salt} />
              <SpecRow label={t("color")} value={product.specs?.color} />
              <SpecRow label={t("tastingNotes")} value={product.specs?.tastingNotes} />
              <SpecBlock label={t("ingredients")} value={product.specs?.ingredients} />
              <SpecBlock label={t("nutritionalData")} value={product.specs?.nutritionalData} />
            </dl>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {/* Serving Info */}
      {hasServing ? (
        <AccordionItem value="serving">
          <AccordionTrigger className="pb-4 pt-0 font-display text-base font-bold uppercase tracking-wider">
            {t("servingTitle")}
          </AccordionTrigger>
          <AccordionContent className="py-4">
            <dl className="flex flex-col gap-6">
              <SpecBlock label={t("shelfLife")} value={product.shelfLife} />
              {product.storage ? <SpecBlock label={t("storage")} value={product.storage} /> : null}
              <SpecBlock label={t("recommendation")} value={product.serving} />
            </dl>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {/* Delivery Info */}
      {hasDelivery ? (
        <AccordionItem value="delivery">
          <AccordionTrigger className="pb-4 pt-0 font-display text-base font-bold uppercase tracking-wider">
            {t("deliveryTitle")}
          </AccordionTrigger>
          <AccordionContent className="py-4">
            <dl className="flex flex-col gap-6">
              <SpecBlock label={t("shipping")} value={product.delivery?.shipping} />
              <SpecBlock label={t("duration")} value={product.delivery?.duration} />
            </dl>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {/* Gifting */}
      {hasGifting ? (
        <AccordionItem value="gifting">
          <AccordionTrigger className="pb-4 pt-0 font-display text-base font-bold uppercase tracking-wider">
            {t("giftingTitle")}
          </AccordionTrigger>
          <AccordionContent className="py-4">
            <dl className="flex flex-col gap-6">
              <SpecBlock label={t("box")} value={product.gifting?.box} />
              <SpecBlock label={t("message")} value={product.gifting?.message} />
              <SpecBlock label={t("addOns")} value={product.gifting?.addOns} />
            </dl>
          </AccordionContent>
        </AccordionItem>
      ) : null}
    </Accordion>
  );
}
