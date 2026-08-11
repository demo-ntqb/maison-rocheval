import { useTranslations } from "next-intl";
import { businessInfo } from "@/shared/constants/site.constant";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="w-full">
      <div className="container-base py-8">
        <p className="body-sm">
          {t("copyright", { year: new Date().getFullYear(), name: businessInfo.name })}
        </p>
      </div>
    </footer>
  );
}
