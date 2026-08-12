import * as React from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui";

export interface EditorialFeaturedProps extends React.ComponentProps<"section"> {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  buttonText?: string;
  buttonLink?: string;
  textPosition?: "top" | "bottom";
  highlightText?: string;
}

export function EditorialFeatured({
  title,
  description,
  imageUrl,
  imageAlt,
  buttonText,
  buttonLink,
  textPosition = "top",
  highlightText,
  className,
  ...props
}: EditorialFeaturedProps) {
  return (
    <section
      data-slot="editorial-featured"
      className={cn(
        "flex w-full max-w-[1000px] flex-col gap-12",
        textPosition === "bottom" && "flex-col-reverse",
        className
      )}
      {...props}
    >
      {/* Content Text Block (h: 102px - 154px) */}
      <div className="flex w-full flex-col items-center text-center px-4 sm:px-6">
        <div className="flex max-w-[500px] flex-col gap-4">
          {highlightText && (
            <span className="font-sans text-[11px] font-light tracking-widest text-gray-dark uppercase">
              {highlightText}
            </span>
          )}

          <h2 className="font-display text-[32px] font-medium leading-tight text-black">
            {title}
          </h2>

          <p className="font-sans text-sm font-light leading-relaxed text-gray-dark">
            {description}
          </p>

          {buttonText && buttonLink && (
            <div className="pt-2">
              <Link
                href={buttonLink}
                className="font-sans text-xs font-light tracking-widest text-black hover:text-gray-dark uppercase underline underline-offset-4 decoration-gray-light"
              >
                {buttonText}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Large Featured Image (w: 1000px, h: 700px) */}
      <div className="w-full px-4 sm:px-6 lg:px-0">
        <div className="relative aspect-[1000/700] w-full overflow-hidden rounded-sm bg-offwhite">
          <picture>
            <source srcSet={imageUrl} type="image/webp" />
            <img
              src={imageUrl}
              alt={imageAlt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
