import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ContactForm } from "@/screens/contact/components/contact-form";
import { Button } from "@/shared/components/ui/button";
import { Picture } from "@/shared/components/ui/picture";
import { ROUTES } from "@/shared/constants/route.constant";

export async function ContactHeroSection() {
  const t = await getTranslations("contact");

  return (
    <section
      aria-labelledby="contact-title"
      className="flex w-full justify-center bg-white"
      data-plumb-id="shop"
    >
      <div
        className="flex w-full flex-col items-center px-4 pb-[200px] pt-[100px]"
        data-plumb-id="frame-2085667045"
      >
        <div
          className="flex w-full max-w-[500px] flex-col items-center gap-[54px]"
          data-plumb-id="frame-2085667164"
        >
          <Picture
            alt={t("imageAlt")}
            basePath="/images/contact/contact-caviar"
            className="h-full w-full object-cover"
            data-plumb-asset="f732404e70437716f159cad01b617b4ff1721e02"
            fallbackExtension="png"
            height={74}
            loading="eager"
            pictureClassName="h-[74px] w-[121px] overflow-hidden"
            width={121}
          />

          <div
            className="flex w-full flex-col items-center gap-[54px]"
            data-plumb-id="component-6"
          >
            <div
              className="flex w-full flex-col items-center px-8 text-center lg:px-0"
              data-plumb-id="frame-2085667332"
            >
              <div
                className="flex w-full flex-col items-center gap-8"
                data-plumb-id="component-7"
              >
                <div
                  className="flex w-full flex-col items-center gap-4"
                  data-plumb-id="frame-2085667118"
                >
                  <h1
                    className="font-display text-[32px] font-normal leading-8 text-ink"
                    data-plumb-id="lorem-ipsum-dolor-2"
                    id="contact-title"
                  >
                    {t("title")}
                  </h1>
                  <p
                    className="w-full font-sans text-sm font-normal leading-[1.43] text-ink"
                    data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a"
                  >
                    {t("introBeforeFaq")} {" "}
                    <Link className="underline underline-offset-2" href={ROUTES.FAQ}>
                      {t("faqLink")}
                    </Link>{" "}
                    {t("introAfterFaq")}
                  </p>
                </div>
              </div>
            </div>

            <ContactForm
              countryLabel={t("form.countryPlaceholder")}
              countryOptions={{
                france: t("form.countryOptions.france"),
                singapore: t("form.countryOptions.singapore"),
              }}
              fields={{
                company: t("form.company"),
                country: t("form.country"),
                email: t("form.email"),
                firstName: t("form.firstName"),
                lastName: t("form.lastName"),
                message: t("form.message"),
                phone: t("form.phone"),
                wholesale: t("form.wholesale"),
              }}
              privacyBeforeLink={t("privacyBeforeLink")}
              privacyLink={t("privacyLink")}
              validation={{
                email: t("form.validation.email"),
                required: t("form.validation.required"),
                selection: t("form.validation.selection"),
              }}
            />

            <Button
              className="h-12 w-[177px] bg-navy-dark py-2 text-base"
              data-plumb-id="component-35"
              form="contact-form"
              size="lg"
              type="submit"
            >
              {t("form.submit")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
