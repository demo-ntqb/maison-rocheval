import { IconMichelinStar } from "@/shared/components/icons";
import { cn } from "@/shared/lib/utils";
import * as React from "react";

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
        <IconMichelinStar
          key={index}
          className={cn("w-[30px] h-[32px] shrink-0 fill-current text-white", starClassName)}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
