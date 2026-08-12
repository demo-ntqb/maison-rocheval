import * as React from "react";

import { Link } from "@/i18n/navigation";
import { Picture } from "@/shared/components/ui/picture";
import { cn } from "@/shared/lib/utils";

export interface Product {
  id: string;
  handle: string;
  title: string;
  imageBasePath: string;
  imageAlt: string;
  eyebrow: string;
  species: string;
  profile: string;
  description: string;
}

export interface ProductCardProps extends React.ComponentProps<"article"> {
  product: Product;
  priority?: boolean;
  size?: "sm" | "md";
}

export function ProductCard({ product, priority = false, size = "md", className, ...props }: ProductCardProps) {
  return (
    <article className={cn("flex w-full flex-col border border-line bg-canvas p-6 text-center", size === "sm" ? "max-w-[284px]" : "max-w-[312px]", className)} {...props}>
      <Link href={`/products/${product.handle}`} className="block aspect-square w-full">
        <Picture basePath={product.imageBasePath} fallbackExtension="png" alt={product.imageAlt} priority={priority} width={600} height={600} sizes="(max-width: 639px) 80vw, 312px" pictureClassName="block size-full" className="size-full object-contain" />
      </Link>
      <p className="mt-5 font-sans text-xs">{product.eyebrow}</p>
      <Link href={`/products/${product.handle}`} className="mt-2 min-h-11"><h3 className="font-display text-xl font-bold">{product.title}</h3></Link>
      <p className="font-display text-sm">{product.species}</p>
      <div className="my-5 border-t border-line" />
      <p className="font-display text-sm">{product.profile}</p>
      <p className="mt-3 line-clamp-3 font-sans text-xs leading-[1.4] text-muted-ink">{product.description}</p>
    </article>
  );
}
