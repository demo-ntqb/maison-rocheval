import * as React from "react"

import { cn } from "@/shared/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[119px] w-full rounded-[2px] border-[0.5px] border-stone bg-white px-4 py-3 font-sans text-base font-normal leading-5 text-ink outline-none transition-colors placeholder:text-muted-text focus-visible:border-navy-dark focus-visible:ring-1 focus-visible:ring-navy-dark/20 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-red-700 aria-invalid:ring-1 aria-invalid:ring-red-700/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
