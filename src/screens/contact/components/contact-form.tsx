"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Link } from "@/i18n/navigation";
import { IconCaretDown } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { PhoneInput } from "@/shared/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { ROUTES } from "@/shared/constants/route.constant";

import { submitContactForm } from "../actions/contact.action";
import {
  controlClassName,
  COUNTRY_VALUES,
  createContactFormSchema,
} from "../constants/contact.constant";
import type { ContactFormProps, ContactFormValues } from "../types/contact.type";

import { ContactField } from "./contact-field";

export function ContactForm({
  countryLabel,
  countryOptions,
  errorMessage,
  fields,
  privacyBeforeLink,
  privacyLink,
  rateLimitMessage,
  successMessage,
  validation,
}: ContactFormProps) {
  const [submitStatus, setSubmitStatus] = useState<
    "error" | "idle" | "rate-limited" | "success"
  >("idle");
  const [isPending, startTransition] = useTransition();
  const contactFormSchema = useMemo(
    () => createContactFormSchema(validation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validation.email, validation.required, validation.selection],
  );
  const form = useForm<ContactFormValues>({
    defaultValues: {
      company: "",
      email: "",
      firstName: "",
      lastName: "",
      message: "",
      phone: "",
      country: "" as ContactFormValues["country"],
      wholesale: false,
    },
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = (values: ContactFormValues) => {
    setSubmitStatus("idle");
    startTransition(async () => {
      const result = await submitContactForm(values);
      if (result.status === "success") {
        setSubmitStatus("success");
        form.reset();
        setTimeout(() => form.clearErrors(), 0);
      } else {
        setSubmitStatus(result.status);
      }
    });
  };

  return (
    <form
      className="flex w-full flex-col items-center gap-8"
      data-plumb-id="frame-2085667176"
      id="contact-form"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div
        className="grid w-full grid-cols-2 gap-6 lg:gap-8"
        data-plumb-id="frame-2085667319"
      >
        <ContactField
          error={form.formState.errors.firstName?.message}
          htmlFor="firstName"
          label={fields.firstName}
          plumbId="component-45"
        >
          <Input
            autoComplete="given-name"
            aria-describedby={form.formState.errors.firstName ? "firstName-error" : undefined}
            aria-invalid={Boolean(form.formState.errors.firstName)}
            aria-required="true"
            className={controlClassName}
            id="firstName"
            required
            {...form.register("firstName")}
          />
        </ContactField>
        <ContactField
          error={form.formState.errors.lastName?.message}
          htmlFor="lastName"
          label={fields.lastName}
          plumbId="component-46"
        >
          <Input
            autoComplete="family-name"
            aria-describedby={form.formState.errors.lastName ? "lastName-error" : undefined}
            aria-invalid={Boolean(form.formState.errors.lastName)}
            aria-required="true"
            className={controlClassName}
            id="lastName"
            required
            {...form.register("lastName")}
          />
        </ContactField>
      </div>

      <ContactField
        error={form.formState.errors.email?.message}
        htmlFor="email"
        label={fields.email}
        plumbId="component-45-2"
      >
        <Input
          autoComplete="email"
          aria-describedby={form.formState.errors.email ? "email-error" : undefined}
          aria-invalid={Boolean(form.formState.errors.email)}
          aria-required="true"
          className={controlClassName}
          id="email"
          required
          type="email"
          {...form.register("email")}
        />
      </ContactField>

      <ContactField
        error={form.formState.errors.country?.message}
        htmlFor="country"
        label={fields.country}
        plumbId="component-46-2"
      >
        <Controller
          control={form.control}
          name="country"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value ?? ""}>
              <SelectTrigger
                aria-invalid={Boolean(form.formState.errors.country)}
                aria-describedby={form.formState.errors.country ? "country-error" : undefined}
                aria-required="true"
                className="pr-4 [&>svg]:size-4 [&>svg]:text-ink [&>svg:last-child]:hidden"
                id="country"
              >
                <SelectValue placeholder={countryLabel} />
                <IconCaretDown
                  aria-hidden="true"
                  className="pointer-events-none size-4 shrink-0 text-ink"
                />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_VALUES.map((val) => (
                  <SelectItem key={val} value={val}>
                    {countryOptions[val]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </ContactField>

      <ContactField
        error={form.formState.errors.company?.message}
        htmlFor="company"
        label={fields.company}
        plumbId="component-47"
      >
        <Input
          autoComplete="organization"
          className={controlClassName}
          id="company"
          {...form.register("company")}
        />
      </ContactField>

      <ContactField htmlFor="phone" label={fields.phone} plumbId="frame-2085667320">
        <Controller
          control={form.control}
          name="phone"
          render={({ field }) => (
            <PhoneInput
              id="phone"
              value={field.value}
              onChange={field.onChange}
              aria-invalid={Boolean(form.formState.errors.phone)}
              aria-describedby={form.formState.errors.phone ? "phone-error" : undefined}
              onlyCountries={["fr", "us", "sg"]}
            />
          )}
        />
      </ContactField>

      <ContactField
        error={form.formState.errors.message?.message}
        htmlFor="message"
        label={fields.message}
        plumbId="component-48"
      >
        <Textarea
          className="min-h-[119px] lg:min-h-[169px] resize-y"
          aria-describedby={form.formState.errors.message ? "message-error" : undefined}
          aria-invalid={Boolean(form.formState.errors.message)}
          aria-required="true"
          id="message"
          required
          {...form.register("message")}
        />
      </ContactField>

      <div className="flex w-full flex-col gap-6" data-plumb-id="frame-2085667187">
        <Controller
          control={form.control}
          name="wholesale"
          render={({ field }) => (
            <Field className="flex-row items-center gap-3" orientation="horizontal">
              <Checkbox
                checked={field.value}
                id="wholesale"
                onCheckedChange={field.onChange}
              />
              <FieldLabel
                className="font-sans text-sm leading-[18px] text-ink-soft cursor-pointer"
                htmlFor="wholesale"
              >
                {fields.wholesale}
              </FieldLabel>
            </Field>
          )}
        />
        <p className="font-sans text-sm font-normal leading-[1.43] text-ink-soft">
          {privacyBeforeLink}{" "}
          <Link
            className="underline underline-offset-2"
            href={ROUTES.PRIVACY_POLICY}
            rel="noopener noreferrer"
            target="_blank"
          >
            {privacyLink}
          </Link>
          .
        </p>
      </div>

      {submitStatus !== "idle" && (
        <p
          aria-live="polite"
          className={`w-full font-sans font-medium text-sm ${submitStatus === "success" ? "text-ink" : "text-red-700"
            }`}
          role="status"
        >
          {submitStatus === "success" && successMessage}
          {submitStatus === "rate-limited" && rateLimitMessage}
          {submitStatus === "error" && errorMessage}
        </p>
      )}

      <Button
        className="h-12 w-[177px] bg-navy-dark py-2 text-base"
        data-plumb-id="component-35"
        disabled={isPending}
        size="lg"
        type="submit"
      >
        {isPending ? fields.submitting : fields.submit}
      </Button>
    </form>
  );
}
