import * as React from "react"

import { cn } from "@/shared/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[2px] border-[0.5px] border-stone bg-white px-4 font-sans text-base font-normal leading-5 text-ink outline-none transition-colors placeholder:text-muted-text focus-visible:border-navy-dark focus-visible:ring-1 focus-visible:ring-navy-dark/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-red-700 aria-invalid:ring-1 aria-invalid:ring-red-700/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
