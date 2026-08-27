import { Link } from "@/i18n/navigation";
import { IconCaretRight } from "@/shared/components/icons/ic-caret-right";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { ROUTES } from "@/shared/constants/route.constant";
import type { ProductCategory } from "@/shared/constants/catalog.constant";

/** Figma: a 24px tall row of 12px uppercase crumbs, caret-separated. */
const CRUMB_CLASS = "flex h-6 items-center px-1 font-sans text-xs leading-5 uppercase text-black";

export interface ProductDetailBreadcrumbProps {
  category: ProductCategory;
  categoryLabel: string;
  shopLabel: string;
  title: string;
}

export function ProductDetailBreadcrumb({
  category,
  categoryLabel,
  shopLabel,
  title,
}: ProductDetailBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-0">
        <BreadcrumbItem className="gap-0">
          <BreadcrumbLink asChild>
            <Link href={ROUTES.PRODUCTS} className={`${CRUMB_CLASS} gap-1`}>
              {shopLabel}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="-ml-2 [&>svg]:size-4">
          <IconCaretRight />
        </BreadcrumbSeparator>
        <BreadcrumbItem className="gap-0">
          <BreadcrumbLink asChild>
            <Link href={ROUTES.PRODUCT_CATEGORY(category)} className={`${CRUMB_CLASS} gap-1`}>
              {categoryLabel}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="-ml-2 [&>svg]:size-4">
          <IconCaretRight />
        </BreadcrumbSeparator>
        <BreadcrumbItem className="gap-0">
          <BreadcrumbPage className={`${CRUMB_CLASS} font-medium`}>{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
