import { createProductFacts } from "../lib/about-the-product.utils";
import type { AboutUnderstandProductFactsProps } from "../types/about-the-product.type";

export function AboutUnderstandProductFacts({
  labels,
  product,
}: AboutUnderstandProductFactsProps) {
  const facts = createProductFacts(labels, product);

  return (
    <dl
      data-plumb-id="frame-2085667060"
      className="flex flex-col gap-4 p-8 font-sans text-sm"
    >
      {facts.map(({ rowPlumbId, labelPlumbId, valuePlumbId, label, value }) => (
        <div
          key={rowPlumbId}
          data-plumb-id={rowPlumbId}
          className="flex min-h-[34px] items-center justify-between gap-[41px] border-b-[0.5px] border-divider-subtle pb-4"
        >
          <dt
            data-plumb-id={labelPlumbId}
            className="shrink-0 font-normal uppercase text-ink"
          >
            {label}
          </dt>
          <dd
            data-plumb-id={valuePlumbId}
            className="text-right font-light text-ink"
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
