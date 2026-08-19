import * as TabsPrimitive from "@radix-ui/react-tabs";

import { Picture } from "@/shared/components/ui/picture";
import type { CollectionCaviarContent } from "../types/about-the-product.type";

/**
 * One caviar in the selector strip (Figma 409:18498 / 409:18506 / 409:18514).
 *
 * Both tins are in the DOM and fetched together, so hovering (or selecting)
 * only has to move them: the lid slides up to the top of the 113px well and
 * the open tin comes out from behind it to settle 34px down. No image is
 * requested at hover time and nothing fades, so the reveal cannot stutter.
 *
 * At rest the open tin is parked concentrically behind the lid, held at 95%
 * because the lid cut-out carries ~1.5% of transparent margin while the open
 * tin fills its frame edge to edge — without it a sliver of gold rim shows
 * past the lid. It is also `invisible` until the card is hovered or selected:
 * the lid is a picture, not a guarantee, and while it is still loading the
 * caviar underneath would otherwise show through. `visibility` transitions
 * discretely and stays visible for the whole outgoing transition, so the flip
 * always happens while the tin is tucked behind the lid, never in view.
 */
export function AboutCollectionCard({ caviar }: { caviar: CollectionCaviarContent }) {
  return (
    <TabsPrimitive.Trigger
      value={caviar.id}
      data-caviar={caviar.id}
      data-node-id="410:22998"
      className="group/card cursor-pointer flex w-[150px] shrink-0 snap-center flex-col items-center gap-3 rounded-brand border-[0.5px] border-stone bg-canvas px-3 py-6 transition-colors duration-300 hover:bg-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink data-[state=active]:bg-warm"
    >
      <span className="relative block h-[113px] w-full">
        <Picture
          basePath={caviar.closedTin}
          fallbackExtension="png"
          alt=""
          aria-hidden="true"
          width={556}
          height={566}
          sizes="80px"
          pictureClassName="absolute left-1/2 top-0 z-[2] block h-[82px] w-[80px] -translate-x-1/2 translate-y-[15.5px] transition-[translate] duration-500 ease-out group-hover/card:translate-y-0 group-data-[state=active]/card:translate-y-0"
          className="block size-full object-contain"
        />
        <Picture
          basePath={caviar.openTin}
          fallbackExtension="png"
          alt=""
          aria-hidden="true"
          width={560}
          height={563}
          sizes="79px"
          pictureClassName="invisible absolute left-1/2 top-[34px] z-[1] block size-[79px] -translate-x-1/2 -translate-y-[16.25px] scale-95 transition-[translate,scale,visibility] duration-500 ease-out group-hover/card:visible group-hover/card:translate-y-0 group-hover/card:scale-100 group-data-[state=active]/card:visible group-data-[state=active]/card:translate-y-0 group-data-[state=active]/card:scale-100"
          className="block size-full object-contain"
        />
      </span>
      <span className="flex w-full flex-col items-center gap-1 text-center">
        <span className="font-display text-sm font-bold leading-[18px] text-ink">{caviar.name}</span>
        <span className="font-sans text-xs leading-[14px] text-ink">{caviar.note}</span>
      </span>
    </TabsPrimitive.Trigger>
  );
}
