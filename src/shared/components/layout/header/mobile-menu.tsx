"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { IconX } from "@/shared/components/icons/ic-x";
import { IconMaisonRochevalLogo } from "@/shared/components/icons/maison-rocheval-logo";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { navigation } from "@/shared/constants/site.constant";

interface MobileMenuProps {
  links: Array<{
    href: (typeof navigation.main)[number]["href"];
    id: string;
    label: string;
  }>;
  menuLabel: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function MobileMenu({ links, menuLabel, onOpenChange, open }: MobileMenuProps) {
  const t = useTranslations("header");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        showCloseButton={false}
        className="w-full !h-[100dvh] border-none bg-beige p-0 text-black shadow-none rounded-[2px] flex flex-col"
      >
        <SheetTitle className="sr-only">{menuLabel}</SheetTitle>

        {/* Close Bar — frame-2085667313 */}
        <div
          data-plumb-id="frame-2085667313"
          className="flex h-14 w-full items-center border-b-[0.5px] border-stone bg-beige"
        >
          <SheetClose asChild>
            <button
              type="button"
              className="inline-flex size-14 items-center justify-start pl-4 text-black focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer"
              aria-label={t("closeMenu")}
            >
              <IconX className="size-6" aria-hidden="true" />
            </button>
          </SheetClose>
        </div>

        {/* Navigation Content — frame-2085667019 */}
        <div
          data-plumb-id="frame-2085667019"
          className="flex flex-col items-center px-4 py-8 gap-4 bg-beige flex-1 overflow-y-auto"
        >
          {/* Logo Area — frame-1000005129 */}
          <div
            data-plumb-id="frame-1000005129"
            className="py-4 flex justify-center w-full"
          >
            <SheetClose asChild>
              <Link href="/" className="inline-flex justify-center transition-opacity hover:opacity-70">
                <IconMaisonRochevalLogo
                  className="w-33.75 h-auto text-black"
                  aria-hidden="true"
                />
                <span className="sr-only">Maison Rocheval</span>
              </Link>
            </SheetClose>
          </div>

          {/* Navigation links */}
          <nav aria-label={menuLabel} className="flex flex-col items-center gap-4 w-full">
            {links.map((item) => (
              <div
                key={item.id}
                data-plumb-id={item.id === "about" ? "frame-2085667314" : item.id === "collection" ? "frame-2085667315" : undefined}
                className="flex items-center justify-center min-h-10 px-4 w-full"
              >
                <SheetClose asChild>
                  <Link
                    href={item.href}
                    className="font-sans text-base font-normal text-black transition-colors hover:opacity-70"
                    data-plumb-id={item.id === "about" ? "the-maison" : item.id === "collection" ? "the-collection" : undefined}
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              </div>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
