import type { z } from "zod";

import type { createContactFormSchema } from "../constants/contact.constant";

export type ContactFormProps = {
  countryLabel: string;
  countryOptions: {
    france: string;
    united_states: string;
    singapore: string;
  };
  errorMessage: string;
  fields: {
    company: string;
    country: string;
    email: string;
    firstName: string;
    lastName: string;
    message: string;
    phone: string;
    submit: string;
    submitting: string;
    wholesale: string;
  };
  privacyBeforeLink: string;
  privacyLink: string;
  rateLimitMessage: string;
  successMessage: string;
  validation: {
    email: string;
    required: string;
    selection: string;
  };
};

export type ContactFormValues = z.infer<ReturnType<typeof createContactFormSchema>>;
