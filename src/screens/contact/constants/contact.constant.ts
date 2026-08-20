import { z } from "zod";

export const COUNTRY_VALUES = ["france", "singapore"] as const;

export const createContactFormSchema = (validation: {
  email: string;
  required: string;
  selection: string;
}) =>
  z.object({
    firstName: z.string().trim().min(1, validation.required),
    lastName: z.string().trim().min(1, validation.required),
    email: z.string().trim().email(validation.email),
    country: z.enum(COUNTRY_VALUES, validation.selection),
    company: z.string().trim(),
    phone: z.string().trim(),
    message: z.string().trim().min(1, validation.required),
    wholesale: z.boolean(),
  });

export const controlClassName = "";
