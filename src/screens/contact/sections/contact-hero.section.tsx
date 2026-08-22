import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ContactForm } from "@/screens/contact/components/contact-form";
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
                united_states: t("form.countryOptions.united_states"),
                singapore: t("form.countryOptions.singapore"),
              }}
              errorMessage={t("form.errorMessage")}
              fields={{
                company: t("form.company"),
                country: t("form.country"),
                email: t("form.email"),
                firstName: t("form.firstName"),
                lastName: t("form.lastName"),
                message: t("form.message"),
                phone: t("form.phone"),
                submit: t("form.submit"),
                submitting: t("form.submitting"),
                wholesale: t("form.wholesale"),
              }}
              privacyBeforeLink={t("privacyBeforeLink")}
              privacyLink={t("privacyLink")}
              rateLimitMessage={t("form.rateLimitMessage")}
              successMessage={t("form.successMessage")}
              validation={{
                email: t("form.validation.email"),
                required: t("form.validation.required"),
                selection: t("form.validation.selection"),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
