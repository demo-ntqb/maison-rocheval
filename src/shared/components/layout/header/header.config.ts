import { ROUTES } from "@/shared/constants/route.constant";

export type HeaderRouteConfig = {
  variant: "transparent" | "solid";
  heroTone?: "light" | "dark";
  announcement?: boolean;
};

const HEADER_ROUTE_CONFIG: Record<string, HeaderRouteConfig> = {
  [ROUTES.HOME]: {
    variant: "transparent",
    heroTone: "dark",

  },
  [ROUTES.ABOUT_BRAND]: {
    variant: "transparent",
    heroTone: "light",
  },
  [ROUTES.ABOUT_PRODUCT]: {
    variant: "transparent",
    heroTone: "light",
  },
  [ROUTES.PRODUCTS]: {
    variant: "transparent",
    heroTone: "light",
    announcement: true,
  },
  [ROUTES.CONTACT]: {
    variant: "transparent",
    heroTone: "light",
  },
  [ROUTES.FAQ]: {
    variant: "transparent",
    heroTone: "light",
  },
};

function isRouteOrChild(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function getHeaderRouteConfig(pathname: string): HeaderRouteConfig {
  const matchedRoute = Object.keys(HEADER_ROUTE_CONFIG).find((route) =>
    isRouteOrChild(pathname, route)
  );

  const config = matchedRoute ? HEADER_ROUTE_CONFIG[matchedRoute] : undefined;

  return (
    config ?? {
      variant: "solid",
      announcement: false,
    }
  );
}
