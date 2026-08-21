"use client";

import { IconX } from "@/shared/components/icons";
import { cn } from "@/shared/lib/utils";
import * as React from "react";
import { useState } from "react";

export interface AnnouncementBarProps extends React.ComponentProps<"div"> {
  dismissLabel: string;
  message: string;
}

export function AnnouncementBar({
  dismissLabel,
  message,
  className,
  ...props
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      data-plumb-id="frame-2085667211"
      data-slot="announcement-bar"
      className={cn(
        "relative flex items-center w-full bg-navy-dark py-4 px-3 font-sans font-normal text-white sm:py-2 sm:pl-8 sm:pr-4 text-sm",
        className
      )}
      {...props}
    >
      <div data-plumb-id="we-currently-only-deliver-to-france-and" className="flex-auto">{message}</div>
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            setIsVisible(false);
          }
        }}
        aria-label={dismissLabel}
        className="flex size-8 shrink-0 p-1.5 text-white transition-opacity hover:opacity-80 self-start"
      >
        <IconX data-plumb-id="x" aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}
