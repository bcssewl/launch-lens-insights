
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border-subtle",
        success:
          "border-success-border bg-success text-success-foreground hover:bg-success/80",
        warning:
          "border-warning-border bg-warning text-warning-foreground hover:bg-warning/80",
        error:
          "border-error-border bg-error text-error-foreground hover:bg-error/80",
        info:
          "border-info-border bg-info text-info-foreground hover:bg-info/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  statusLabel?: string
}

function Badge({ className, variant, statusLabel, children, ...props }: BadgeProps) {
  return (
    <div 
      className={cn(badgeVariants({ variant }), className)} 
      role={statusLabel ? "status" : undefined}
      aria-label={statusLabel}
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
