"use client";

import { useState } from "react";

/**
 * Figma truncates the intro copy mid-sentence and appends an inline
 * "see more" affordance, so the collapsed state is a word-boundary trim
 * rather than a CSS line clamp (which cannot host an inline control).
 */
const PREVIEW_LENGTH = 130;

function trimToWord(text: string, limit: number): string {
  const sliced = text.slice(0, limit);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced).trimEnd();
}

export interface ProductDetailSummaryProps {
  /** Gift sets list what is in the box beneath the copy. */
  composition?: readonly string[];
  description: string;
  /** Caviar leads the copy with its tasting profile, set in bold. */
  notes?: string;
  seeLessLabel: string;
  seeMoreLabel: string;
  subtitle?: string;
  title: string;
}

export function ProductDetailSummary({
  composition = [],
  description,
  notes,
  seeLessLabel,
  seeMoreLabel,
  subtitle,
  title,
}: ProductDetailSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const isTruncatable = description.length > PREVIEW_LENGTH;
  const visibleDescription = expanded || !isTruncatable
    ? description
    : `${trimToWord(description, PREVIEW_LENGTH)}… `;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-[3px]">
        <h1 className="font-display text-[32px] font-bold leading-normal text-black">{title}</h1>
        {subtitle ? (
          <p className="font-sans text-sm leading-5 text-muted-ink">{subtitle}</p>
        ) : null}
      </div>

      <div className="h-px w-full bg-line" />

      <div className="flex flex-col gap-3">
        {notes ? (
          <p className="font-sans text-sm font-bold leading-normal text-black">{notes}</p>
        ) : null}

        <p className="font-sans text-sm font-light leading-5 text-black">
          {visibleDescription}
          {isTruncatable ? (
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((current) => !current)}
              className="cursor-pointer font-medium underline-offset-2 hover:underline"
            >
              {expanded ? ` ${seeLessLabel}` : seeMoreLabel}
            </button>
          ) : null}
        </p>

        {composition.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {composition.map((item) => (
              <li key={item} className="flex items-center gap-2 px-1">
                <span aria-hidden="true" className="h-0.5 w-1 shrink-0 rounded-full bg-navy-darker" />
                <span className="font-sans text-sm font-light leading-5 text-black">{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
