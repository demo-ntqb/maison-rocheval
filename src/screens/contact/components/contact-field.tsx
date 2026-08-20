import type { ReactNode } from "react";

import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";

type ContactFieldProps = {
  children: ReactNode;
  error?: string;
  htmlFor: string;
  label: string;
  plumbId: string;
};

export function ContactField({
  children,
  error,
  htmlFor,
  label,
  plumbId,
}: ContactFieldProps) {
  return (
    <Field className="gap-3" data-plumb-id={plumbId}>
      <FieldLabel
        className="font-display text-base font-normal leading-[19px] text-ink"
        htmlFor={htmlFor}
      >
        {label}
      </FieldLabel>
      {children}
      <FieldError
        className="font-sans text-xs text-red-700"
        id={error ? `${htmlFor}-error` : undefined}
        errors={error ? [{ message: error }] : undefined}
      />
    </Field>
  );
}
