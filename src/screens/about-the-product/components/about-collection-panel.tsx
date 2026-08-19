import * as TabsPrimitive from "@radix-ui/react-tabs";

import { Picture } from "@/shared/components/ui/picture";
import { cn } from "@/shared/lib/utils";
import type { CollectionCaviarContent } from "../types/about-the-product.type";

/**
 * Detail panel for the selected caviar (Figma 410:23759, mobile 410:23951).
 *
 * Desktop lays the tin and the plated dish side by side above a two-column
 * text block; mobile stacks tin → notes → dish → service. Both come from the
 * same five children, reordered with `order-*` inside a wrapping flex row.
 *
 * The tin/lid offsets are percentages because Figma expresses them the same
 * way relative to the square: at 500px (desktop) and 396px (mobile) the two
 * frames land within half a percent of each other.
 *
 * Every panel stays mounted (`forceMount`) so that switching caviars never
 * waits on a fetch, and so the outgoing panel is still on screen while the
 * incoming one dissolves in over the top of it. Only the selected panel is in
 * flow — the rest are taken out of it, which keeps each panel at exactly the
 * height its Figma frame specifies instead of padding them all to the tallest.
 *
 * Photographs and copy are swapped on deliberately different timings, because
 * what reads as a dissolve for one reads as a fault for the other. Two tins
 * blended together still look like a tin; two paragraphs blended together look
 * like broken text. So anything that holds the same position across caviars
 * cross-fades, and anything that moves hands over instead — fading out
 * completely before its replacement starts to arrive. Both settle on 320ms, so
 * the panel still reads as one movement.
 */
export function AboutCollectionPanel({
  atTableLabel,
  caviar,
  isActive,
}: {
  atTableLabel: string;
  caviar: CollectionCaviarContent;
  isActive: boolean;
}) {
  /**
   * Cross-fade: the outgoing tin is held opaque underneath for the whole
   * hand-over and only dropped once the incoming one already covers it, so the
   * page never shows through mid-swap. The tin sits at the top of the panel,
   * identically placed for every caviar, so the two always line up.
   */
  const photoFade = isActive
    ? "opacity-100 transition-opacity duration-[320ms] ease-out"
    : "opacity-0 transition-opacity duration-0 delay-[320ms]";

  /**
   * Hand-over: the outgoing copy is gone by 150ms and the incoming copy only
   * begins at 150ms, so the two are never legible at the same time. It lands
   * on 320ms with the photographs.
   */
  const copyFade = isActive
    ? "translate-y-0 opacity-100 transition-[opacity,translate] duration-[170ms] delay-[150ms] ease-out"
    : "translate-y-[6px] opacity-0 transition-[opacity,translate] duration-[150ms] ease-in";

  /**
   * The plated dish belongs to whichever group it can sit still in. Desktop
   * puts it beside the tin, at the same height for every caviar, so it can
   * cross-fade. Mobile stacks it under the copy, where a longer set of notes
   * pushes it up to 72px further down — cross-fading two plates that far apart
   * reads as a double exposure, so there it hands over with the copy instead.
   */
  const dishFade = isActive
    ? "translate-y-0 opacity-100 transition-[opacity,translate] duration-[170ms] delay-[150ms] ease-out lg:delay-0 lg:duration-[320ms]"
    : "translate-y-[6px] opacity-0 transition-[opacity,translate] duration-[150ms] ease-in lg:translate-y-0 lg:delay-[320ms] lg:duration-0";

  return (
    <TabsPrimitive.Content
      forceMount
      value={caviar.id}
      data-node-id="410:23759"
      inert={isActive ? undefined : true}
      className={cn(
        "w-full outline-none",
        isActive ? "relative z-10" : "pointer-events-none absolute inset-x-0 top-0 z-0",
      )}
    >
      <div className="flex w-full flex-col lg:flex-row lg:flex-wrap lg:items-start">
        <div
          className={cn(
            "order-1 flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden rounded-brand bg-warm p-[10px] lg:w-[500px]",
            photoFade,
          )}
        >
          <span className="relative block size-full">
            <Picture
              basePath={caviar.closedTin}
              fallbackExtension="png"
              alt={caviar.tinAlt}
              width={556}
              height={566}
              sizes="(max-width: 1023px) 55vw, 275px"
              pictureClassName="absolute left-[22.6%] top-[11.9%] z-[2] block h-[55.8%] w-[54.8%]"
              className="block size-full object-contain"
            />
            <Picture
              basePath={caviar.openTin}
              fallbackExtension="png"
              alt=""
              aria-hidden="true"
              width={560}
              height={563}
              sizes="(max-width: 1023px) 54vw, 270px"
              pictureClassName="absolute left-[23.1%] top-[33.9%] z-[1] block h-[54.1%] w-[53.8%]"
              className="block size-full object-contain"
            />
          </span>
        </div>

        <Picture
          basePath={caviar.dish}
          fallbackExtension="jpg"
          alt={caviar.dishAlt}
          /* The only image a swap would otherwise have to fetch: the tins are
             the same files the selector strip already pulled in, but each dish
             is unique to its panel and invisible until selected, so lazy never
             fires and the dissolve would land on an empty square. 113KB of
             AVIF for the four unselected panels, left at the browser's own low
             priority for below-the-fold images. */
          loading="eager"
          width={842}
          height={842}
          sizes="(max-width: 1023px) 100vw, 498px"
          pictureClassName={cn("order-4 block aspect-square w-full lg:order-2 lg:w-[calc(100%-500px)]", dishFade)}
          className="block size-full rounded-brand object-cover"
        />

        <div className={cn("order-2 flex w-full flex-col gap-2 px-8 pt-8 lg:order-3", copyFade)}>
          <h3 className="font-display text-[32px] font-medium leading-8 text-ink">{caviar.name}</h3>
          <p className="font-sans text-sm leading-[normal] text-muted-ink">{caviar.latinName}</p>
        </div>

        <div
          className={cn(
            "order-3 flex w-full flex-col gap-3 px-8 pb-8 pt-6 lg:order-4 lg:w-1/2 lg:pl-8 lg:pr-4",
            copyFade,
          )}
        >
          <p className="font-sans text-sm font-bold leading-[normal] text-ink">{caviar.tastingNotes}</p>
          <div className="flex flex-col gap-[18px] font-sans text-sm leading-[normal] text-ink">
            <p>{caviar.description}</p>
            <p>{caviar.descriptionSecondary}</p>
          </div>
        </div>

        <div
          className={cn(
            "order-5 flex w-full flex-col gap-3 p-8 lg:w-1/2 lg:pb-8 lg:pl-4 lg:pr-8 lg:pt-6",
            copyFade,
          )}
        >
          <p className="font-sans text-sm font-bold leading-[normal] text-ink">{atTableLabel}</p>
          <p className="font-sans text-sm leading-[normal] text-ink">{caviar.atTable}</p>
        </div>
      </div>
    </TabsPrimitive.Content>
  );
}
