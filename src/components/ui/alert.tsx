import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-[11px] font-medium leading-snug [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-foreground",
        destructive: "border-rose-200/80 bg-rose-50 text-rose-900 [&>svg]:text-rose-600",
        warning: "border-amber-200/80 bg-amber-50 text-amber-900 [&>svg]:text-amber-600",
        success: "border-emerald-200/80 bg-emerald-50 text-emerald-900 [&>svg]:text-emerald-600",
        info: "border-sky-200/80 bg-sky-50 text-sky-900 [&>svg]:text-sky-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-bold", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-[11px] leading-snug", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
