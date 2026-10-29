import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-semibold transition-colors [&>svg]:size-3 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline: "border-border text-foreground",
        amber: "border-amber-200/60 bg-amber-50 text-amber-700",
        blue: "border-blue-200/60 bg-blue-50 text-blue-700",
        purple: "border-purple-200/60 bg-purple-50 text-purple-700",
        emerald: "border-emerald-200/60 bg-emerald-50 text-emerald-800",
        rose: "border-rose-200/60 bg-rose-50 text-rose-700",
        dark: "border-white/10 bg-white/10 text-slate-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
