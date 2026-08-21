"use client"

import * as AccordionPrimitive from "@radix-ui/react-accordion"
import * as React from "react"

import { cn } from "@/shared/lib/utils"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { IconMinus } from "@/shared/components/icons/ic-minus"
import { IconPlus } from "@/shared/components/icons/ic-plus"

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  indicator = "chevron",
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  indicator?: "chevron" | "plus";
}) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger cursor-pointer relative flex flex-1 items-start justify-between py-10 text-left font-display text-[20px] font-normal leading-[1.4] text-(--palette-black) no-underline transition-opacity hover:no-underline hover:opacity-70 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-(--palette-black) border-b border-[#e1e1e1]",
          className
        )}
        {...props}
      >
        {children}
        {indicator === "plus" ? (
          <>
            <IconPlus
              aria-hidden="true"
              data-slot="accordion-trigger-icon"
              className="mt-0.75 size-4.5 shrink-0 text-gray-icon group-aria-expanded/accordion-trigger:hidden"
            />
            <IconMinus
              aria-hidden="true"
              data-slot="accordion-trigger-icon"
              className="mt-0.75 hidden size-4.5 shrink-0 text-gray-icon group-aria-expanded/accordion-trigger:block"
            />
          </>
        ) : (
          <>
            <ChevronDownIcon data-slot="accordion-trigger-icon" className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden" />
            <ChevronUpIcon data-slot="accordion-trigger-icon" className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline" />
          </>
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="group/accordion-content overflow-hidden font-sans text-[14px] leading-[1.43] text-(--palette-gray-dark) data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          "py-10 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
