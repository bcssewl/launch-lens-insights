
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const notificationVariants = cva(
  "relative flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300",
  {
    variants: {
      variant: {
        success:
          "border-success-border bg-success-background text-success [&>svg]:text-success",
        warning:
          "border-warning-border bg-warning-background text-warning [&>svg]:text-warning",
        error:
          "border-error-border bg-error-background text-error [&>svg]:text-error",
        info:
          "border-info-border bg-info-background text-info [&>svg]:text-info",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title: string
  description?: string
  onClose?: () => void
  showIcon?: boolean
}

const getIcon = (variant: NotificationProps['variant']) => {
  switch (variant) {
    case 'success':
      return CheckCircle
    case 'warning':
      return AlertTriangle
    case 'error':
      return XCircle
    case 'info':
    default:
      return Info
  }
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ className, variant, title, description, onClose, showIcon = true, ...props }, ref) => {
    const Icon = getIcon(variant)

    return (
      <div
        ref={ref}
        className={cn(notificationVariants({ variant }), className)}
        {...props}
      >
        {showIcon && <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm leading-tight">{title}</h4>
          {description && (
            <p className="mt-1 text-sm opacity-90 leading-relaxed">{description}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-md p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Notification.displayName = "Notification"

export { Notification, notificationVariants }
