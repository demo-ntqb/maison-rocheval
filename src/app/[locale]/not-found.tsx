import { redirect } from "next/navigation";

import { ROUTES } from "@/shared/constants/route.constant";

export default function NotFound() {
  redirect(ROUTES.HOME);
}
