"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";

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
        "relative flex h-[42px] w-full items-center justify-between bg-navy-dark py-3 pl-4 pr-2 font-sans text-xs font-normal text-white sm:pl-8 sm:pr-6 sm:text-sm",
        className
      )}
      {...props}
    >
      <span data-plumb-id="we-currently-only-deliver-to-france-and">{message}</span>
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            setIsVisible(false);
          }
        }}
        aria-label={dismissLabel}
        className="-my-px -mr-4 inline-flex size-11 shrink-0 items-center justify-center text-white transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
      >
        <svg data-plumb-id="x" aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
    </div>
  );
}
