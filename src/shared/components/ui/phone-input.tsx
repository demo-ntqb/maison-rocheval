"use client";

import IntlTelInput from "@intl-tel-input/react";
import "intl-tel-input/styles";
import * as React from "react";

type PhoneInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  placeholder?: string;
  onlyCountries?: React.ComponentProps<typeof IntlTelInput>["onlyCountries"];
};

export function PhoneInput({
  value,
  onChange,
  id,
  disabled,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
  placeholder,
  onlyCountries,
}: PhoneInputProps) {
  return (
    <div className="w-full" data-slot="phone-input">
      <IntlTelInput
        initialCountry="sg"
        separateDialCode
        disabled={disabled}
        value={value}
        onlyCountries={onlyCountries}
        onChangeNumber={(number) => {
          onChange?.(number);
        }}
        loadUtils={() => import("intl-tel-input/utils")}
        inputProps={{
          id,
          name: "phone",
          autoComplete: "tel",
          "aria-invalid": ariaInvalid,
          "aria-describedby": ariaDescribedby,
          placeholder: placeholder || "",
        }}
      />
    </div>
  );
}
