import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface MichelinRatingProps extends React.ComponentProps<"div"> {
  count?: number; // Mặc định là 3 ngôi sao Michelin
  starClassName?: string;
}

export function MichelinRating({
  count = 3,
  className,
  starClassName,
  ...props
}: MichelinRatingProps) {
  return (
    <div
      data-slot="michelin-rating"
      className={cn("flex items-center gap-4", className)}
      {...props}
    >
      {Array.from({ length: count }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 30 32"
          className={cn("size-[30px] shrink-0 fill-current text-white", starClassName)}
          aria-hidden="true"
        >
          {/* Michelin Star flower SVG path */}
          <path d="M15 2c-.62 0-1.18.36-1.42.92l-2.02 4.74-4.74-2.02c-.56-.24-1.2-.1-1.6.3-.4.4-.54 1.04-.3 1.6l2.02 4.74-4.74 2.02c-.56.24-.92.8-.92 1.42s.36 1.18.92 1.42l4.74 2.02-2.02 4.74c-.24.56-.1 1.2.3 1.6.4.4 1.04.54 1.6.3l4.74-2.02 2.02 4.74c.24.56.8.92 1.42.92s1.18-.36 1.42-.92l2.02-4.74 4.74 2.02c.56.24 1.2.1 1.6-.3.4-.4.54-1.04.3-1.6l-2.02-4.74 4.74-2.02c.56-.24.92-.8.92-1.42s-.36-1.18-.92-1.42l-4.74-2.02 2.02-4.74c.24-.56.1-1.2-.3-1.6-.4-.4-1.04-.54-1.6-.3l-4.74 2.02-2.02-4.74c-.24-.56-.8-.92-1.42-.92zm0 9c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5z" />
        </svg>
      ))}
    </div>
  );
}
