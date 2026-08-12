import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface AnnouncementBarProps extends React.ComponentProps<"div"> {
  message?: string;
}

export function AnnouncementBar({
  message = "Livraison offerte dès 150€ d'achat en France métropolitaine",
  className,
  ...props
}: AnnouncementBarProps) {
  return (
    <div
      data-slot="announcement-bar"
      className={cn(
        "flex h-[42px] w-full items-center justify-center bg-navy-dark px-4 text-center font-sans text-xs font-light tracking-widest text-white uppercase",
        className
      )}
      {...props}
    >
      {message}
    </div>
  );
}
