
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:text-text-disabled [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:ring-offset-focus-ring-offset",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-sm transition-all duration-200",
        destructive:
          "bg-error text-error-foreground hover:bg-error/90 active:bg-error/80 shadow-sm transition-all duration-200",
        outline:
          "border border-border-subtle bg-surface-elevated text-text-primary hover:bg-surface-elevated-2 hover:text-text-primary active:bg-surface transition-all duration-200 focus-visible:border-focus-ring",
        secondary:
          "bg-surface-elevated text-text-primary hover:bg-surface-elevated-2 active:bg-surface border border-border-subtle transition-all duration-200 focus-visible:border-focus-ring",
        ghost: "text-text-secondary hover:bg-surface-elevated hover:text-text-primary active:bg-surface transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline focus-visible:underline",
      },
      size: {
        default: "h-10 px-4 py-2 min-h-[44px]",
        sm: "h-9 rounded-md px-3 min-h-[36px]",
        lg: "h-11 rounded-md px-8 min-h-[44px]",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    // If loading is true, we never use asChild to avoid conflicts
    if (loading) {
      return (
        <button
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={loading || props.disabled}
          aria-disabled={loading || props.disabled}
          aria-describedby={loading ? `${props.id || 'button'}-loading` : undefined}
          {...props}
        >
          <div 
            className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" 
            role="status"
            aria-label="Loading"
          />
          <span className="sr-only" id={`${props.id || 'button'}-loading`}>
            Loading, please wait
          </span>
          {children}
        </button>
      )
    }

    // If asChild is true and not loading, use Slot
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    // Default button behavior
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled}
        aria-disabled={props.disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
