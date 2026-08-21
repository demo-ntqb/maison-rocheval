import { Slot } from "@radix-ui/react-slot"
import * as React from "react"

import { cn } from "@/shared/lib/utils"

interface IconButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-[4px] bg-transparent text-gray-icon hover:bg-beige hover:text-black active:bg-beige-dark active:text-black transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-6 [&_svg]:pointer-events-none [&_svg]:shrink-0",
          className
        )}
        {...props}
      />
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton }
