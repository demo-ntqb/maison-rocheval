import type { z } from "zod";

import type { createContactFormSchema } from "../constants/contact.constant";

export type ContactFormProps = {
  countryLabel: string;
  countryOptions: {
    france: string;
    united_states: string;
    singapore: string;
  };
  fields: {
    company: string;
    country: string;
    email: string;
    firstName: string;
    lastName: string;
    message: string;
    phone: string;
    wholesale: string;
  };
  privacyBeforeLink: string;
  privacyLink: string;
  validation: {
    email: string;
    required: string;
    selection: string;
  };
};

export type ContactFormValues = z.infer<ReturnType<typeof createContactFormSchema>>;
