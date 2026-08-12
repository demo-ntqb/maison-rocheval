import * as React from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui";

export interface EditorialSplitProps extends React.ComponentProps<"section"> {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition?: "left" | "right";
  buttonText?: string;
  buttonLink?: string;
  highlightText?: string;
}

export function EditorialSplit({
  title,
  description,
  imageUrl,
  imageAlt,
  imagePosition = "left",
  buttonText,
  buttonLink,
  highlightText,
  className,
  ...props
}: EditorialSplitProps) {
  return (
    <section
      data-slot="editorial-split"
      className={cn(
        "flex w-full max-w-[1000px] flex-col items-center gap-12 lg:flex-row lg:gap-0",
        imagePosition === "right" && "lg:flex-row-reverse",
        className
      )}
      {...props}
    >
      {/* Image Block (w: 470px) */}
      <div className="w-full shrink-0 px-4 sm:px-6 lg:w-[470px] lg:px-0">
        <div className="relative aspect-[470/700] w-full overflow-hidden rounded-sm bg-offwhite">
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

      {/* Content Text Block (w: 530px) */}
      <div className="flex w-full flex-col justify-center px-6 sm:px-12 lg:w-[530px] lg:px-[64px] text-left">
        <div className="flex flex-col gap-6">
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
            <div className="pt-4">
              <Button
                variant="default"
                size="lg"
                className="w-fit px-8 py-3 text-xs tracking-widest min-h-[48px]"
                asChild
              >
                <Link href={buttonLink}>{buttonText}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
