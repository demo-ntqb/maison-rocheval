import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/shared/lib/utils"

interface TextButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean
}

const TextButton = React.forwardRef<HTMLButtonElement, TextButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-sans text-[14px] font-normal uppercase underline underline-offset-[25%] text-black hover:text-gray-heavy transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
TextButton.displayName = "TextButton"

export { TextButton }
