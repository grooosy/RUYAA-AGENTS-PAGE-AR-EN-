import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300",
        destructive: "bg-red-900 text-red-100 hover:bg-red-800 border border-red-700",
        outline:
          "border-2 border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-gray-100 hover:border-gray-500 transition-all duration-300",
        secondary: "bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-500",
        ghost: "hover:bg-gray-800 hover:text-gray-100 text-gray-300 transition-all duration-200",
        link: "text-gray-400 underline-offset-4 hover:underline hover:text-gray-200",
        primary:
          "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-100 hover:from-gray-600 hover:to-gray-700 border border-gray-500 shadow-lg hover:shadow-xl transition-all duration-300",
        accent:
          "bg-gradient-to-r from-slate-700 to-slate-800 text-slate-100 hover:from-slate-600 hover:to-slate-700 border border-slate-500 shadow-lg hover:shadow-xl transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
