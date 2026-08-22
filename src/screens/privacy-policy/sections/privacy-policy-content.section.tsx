import { getTranslations } from "next-intl/server";

import type { PrivacyPolicySectionItem } from "../types/privacy-policy.type";

export async function PrivacyPolicyContentSection() {
  const t = await getTranslations("privacyPolicy");
  const sections = t.raw("sections") as PrivacyPolicySectionItem[];

  return (
    <section
      aria-label="Privacy policy details"
      className="flex w-full justify-center bg-canvas px-4 pb-[200px] pt-[54px] sm:px-6"
    >
      <div className="flex w-full max-w-content flex-col divide-y divide-stone">
        {sections.map((item, index) => {
          const sectionId = `privacy-policy-section-${index + 1}`;

          return (
            <div key={sectionId} className="flex flex-col gap-4 py-8 first:pt-0 last:pb-0">
              <h2 id={sectionId} className="font-display text-lg font-normal leading-6 text-black lg:text-xl">
                {item.title}
              </h2>
              <div
                className="flex flex-col gap-3 font-sans text-sm leading-[1.43] text-ink-soft [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li_ul]:mt-2 [&_strong]:font-medium [&_strong]:text-black [&_table]:my-1 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-stone [&_th]:p-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-black [&_td]:border [&_td]:border-stone [&_td]:p-2"
                dangerouslySetInnerHTML={{ __html: item.body }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
