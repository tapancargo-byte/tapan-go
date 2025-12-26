import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "relative overflow-hidden group",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground shadow-elevation-1",
          "hover:bg-primary/90 hover:shadow-elevation-2 hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-elevation-1",
        ],
        destructive: [
          "bg-destructive text-destructive-foreground shadow-elevation-1",
          "hover:bg-destructive/90 hover:shadow-elevation-2 hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-elevation-1",
        ],
        outline: [
          "border border-input bg-background/50 backdrop-blur-sm shadow-elevation-1",
          "hover:bg-accent hover:text-accent-foreground hover:border-accent/50",
          "hover:shadow-elevation-2 hover:-translate-y-0.5",
        ],
        secondary: [
          "bg-secondary text-secondary-foreground shadow-elevation-1",
          "hover:bg-secondary/80 hover:shadow-elevation-2 hover:-translate-y-0.5",
        ],
        ghost: [
          "hover:bg-accent hover:text-accent-foreground",
          "hover:shadow-elevation-1 hover:-translate-y-0.5",
        ],
        link: [
          "text-primary underline-offset-4 hover:underline",
          "hover:text-primary/80",
        ],
        premium: [
          "btn-premium",
          "hover:-translate-y-1 hover:scale-105",
        ],
        glass: [
          "glass-panel text-foreground",
          "hover:shadow-glass-lg hover:-translate-y-0.5",
          "border-white/10 hover:border-white/20",
        ],
        gradient: [
          "bg-gradient-to-r from-primary-400 via-primary-500 to-accent-500",
          "text-primary-foreground shadow-elevation-2",
          "hover:shadow-elevation-3 hover:-translate-y-1 hover:scale-105",
          "bg-size-200 hover:bg-pos-0",
        ],
        success: [
          "bg-success text-success-foreground shadow-success",
          "hover:bg-success/90 hover:shadow-success hover:shadow-lg",
          "hover:-translate-y-0.5",
        ],
        warning: [
          "bg-warning text-warning-foreground shadow-warning",
          "hover:bg-warning/90 hover:shadow-warning hover:shadow-lg",
          "hover:-translate-y-0.5",
        ],
        info: [
          "bg-info text-info-foreground shadow-info",
          "hover:bg-info/90 hover:shadow-info hover:shadow-lg",
          "hover:-translate-y-0.5",
        ],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
      loading: {
        true: "cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const ButtonPremium = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        
        <div className={cn(
          "flex items-center gap-2",
          loading && "opacity-0"
        )}>
          {leftIcon && (
            <span className="flex-shrink-0">
              {leftIcon}
            </span>
          )}
          
          {children}
          
          {rightIcon && (
            <span className="flex-shrink-0">
              {rightIcon}
            </span>
          )}
        </div>
        
        {/* Shimmer effect for premium variant */}
        {variant === "premium" && (
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
        )}
      </Comp>
    )
  }
)
ButtonPremium.displayName = "ButtonPremium"

// Button Group Component
interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  size?: VariantProps<typeof buttonVariants>["size"]
  variant?: VariantProps<typeof buttonVariants>["variant"]
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex",
          orientation === "horizontal" 
            ? "flex-row [&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg [&>button:not(:first-child)]:border-l-0"
            : "flex-col [&>button]:rounded-none [&>button:first-child]:rounded-t-lg [&>button:last-child]:rounded-b-lg [&>button:not(:first-child)]:border-t-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ButtonGroup.displayName = "ButtonGroup"

// Icon Button Component
interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon"> {
  icon: React.ReactNode
  label?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, size = "icon", ...props }, ref) => {
    return (
      <ButtonPremium
        ref={ref}
        size={size}
        aria-label={label}
        {...props}
      >
        {icon}
      </ButtonPremium>
    )
  }
)
IconButton.displayName = "IconButton"

// Floating Action Button
interface FABProps extends ButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ className, position = "bottom-right", size = "lg", variant = "premium", ...props }, ref) => {
    const positionClasses = {
      "bottom-right": "fixed bottom-6 right-6",
      "bottom-left": "fixed bottom-6 left-6",
      "top-right": "fixed top-6 right-6",
      "top-left": "fixed top-6 left-6",
    }

    return (
      <ButtonPremium
        ref={ref}
        className={cn(
          positionClasses[position],
          "rounded-full shadow-elevation-3 hover:shadow-elevation-4 z-50",
          className
        )}
        size={size}
        variant={variant}
        {...props}
      />
    )
  }
)
FloatingActionButton.displayName = "FloatingActionButton"

export { 
  ButtonPremium, 
  ButtonGroup, 
  IconButton, 
  FloatingActionButton,
  buttonVariants 
}

