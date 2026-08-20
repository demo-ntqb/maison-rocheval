"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/shared/lib/utils"
import { CheckIcon } from "lucide-react"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-[14px] shrink-0 items-center justify-center rounded-none border-[0.5px] border-muted-text transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-navy-dark focus-visible:ring-1 focus-visible:ring-navy-dark/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-700 aria-invalid:ring-1 aria-invalid:ring-red-700/20 data-checked:border-navy-dark data-checked:bg-navy-dark data-checked:text-white data-[state=checked]:border-navy-dark data-[state=checked]:bg-navy-dark data-[state=checked]:text-white",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-2.5"
      >
        <CheckIcon
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
