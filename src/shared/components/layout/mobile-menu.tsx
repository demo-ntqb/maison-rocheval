"use client";

import { Link } from "@/i18n/navigation";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
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
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[min(88vw,360px)] border-r border-canvas/10 bg-navy-dark p-0 text-canvas"
      >
        <SheetHeader className="border-b border-canvas/10 p-6">
          <SheetTitle className="font-display text-xl text-canvas">Maison Rocheval</SheetTitle>
        </SheetHeader>
        <nav aria-label={menuLabel} className="flex flex-col px-6 py-4">
          {links.map((item) => (
            <SheetClose key={item.id} asChild>
              <Link
                href={item.href}
                className="flex min-h-12 items-center border-b border-canvas/10 font-sans text-base text-canvas"
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
