import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const toggleButtonVariants = cva(
  "inline-flex items-center justify-center rounded-[2px] font-sans font-normal transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      size: {
        m: "h-8 px-4 text-[14px]",
        l: "h-10 px-4 text-[16px]",
        xl: "h-12 px-6 text-[16px]",
      },
      active: {
        true: "bg-navy-darker text-white border-[0.5px] border-transparent",
        false: "bg-white text-black border-[0.5px] border-gray-light hover:bg-beige",
      },
    },
    defaultVariants: {
      size: "m",
      active: false,
    },
  }
)

interface ToggleButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof toggleButtonVariants> {
  asChild?: boolean
}

const ToggleButton = React.forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ className, size, active, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(toggleButtonVariants({ size, active, className }))}
        {...props}
      />
    )
  }
)
ToggleButton.displayName = "ToggleButton"

export { ToggleButton, toggleButtonVariants }
