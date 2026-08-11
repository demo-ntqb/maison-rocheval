import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { navigation } from "@/shared/constants/site.constant";

export function Header() {
  const t = useTranslations("header");
  const tCommon = useTranslations("common");

  return (
    <header className="w-full">
      <div className="container-base flex h-14 items-center justify-between">
        <Link href="/" className="label">
          {tCommon("siteName")}
        </Link>
        <nav aria-label="Main" className="flex items-center gap-6">
          {navigation.main.map((item) => (
            <Link key={item.id} href={item.href} className="link-navigation">
              {t(`nav.${item.id}`)}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
