import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#1f2d24] text-white shadow-sm hover:bg-[#314e3b] hover:shadow-md",
        emerald:
          "bg-[#28734d] text-white shadow-sm hover:bg-[#358e5e] hover:shadow-md",
        primary:
          "bg-[#4ca873] text-[#0d1c13] shadow-md hover:bg-[#5bc287] font-bold",
        secondary:
          "bg-[#edf5ef] text-[#1e6138] border border-[#d2e5d6] hover:bg-[#e2f1e6]",
        outline:
          "border border-[#cfddd0] bg-white text-[#243a2c] shadow-2xs hover:border-[#79b790] hover:bg-[#f2f8f3]",
        ghost:
          "text-[#485b50] hover:bg-[#eef4ef] hover:text-[#17241c]",
        darkGhost:
          "text-[#d7f1df] hover:bg-white/10 hover:text-white",
        destructive:
          "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
        link:
          "text-[#206642] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9.5 px-4 py-2 text-xs sm:text-sm",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-sm sm:text-base",
        icon: "size-9 rounded-lg",
        iconSm: "size-7.5 rounded-lg text-xs",
        iconXs: "size-6 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
