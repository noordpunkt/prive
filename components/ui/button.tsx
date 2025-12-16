import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base button style: square corners, no shadows, grayscale palette
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-all disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none border border-black/10 dark:border-white/10 rounded-none",
  {
    variants: {
      variant: {
        // Solid black button
        default: "bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:active:bg-neutral-300",
        // Destructive stays grayscale but slightly lighter
        destructive:
          "bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600 dark:bg-neutral-200 dark:text-black dark:hover:bg-neutral-300",
        // Outline: white/black only, no shadow
        outline:
          "bg-white text-black hover:bg-neutral-100 active:bg-neutral-200 dark:bg-black dark:text-white dark:hover:bg-neutral-900",
        // Secondary: mid-grey filled
        secondary:
          "bg-neutral-200 text-black hover:bg-neutral-300 active:bg-neutral-400 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700",
        // Ghost: subtle grey hover
        ghost:
          "bg-transparent text-black hover:bg-neutral-100 active:bg-neutral-200 dark:text-white dark:hover:bg-neutral-900",
        // Link: black text with underline on hover
        link: "bg-transparent border-none text-black underline-offset-4 hover:underline dark:text-white",
      },
      size: {
        default: "h-12 px-6 py-3 has-[>svg]:px-6",
        sm: "h-10 px-5 py-2.5 has-[>svg]:px-5",
        lg: "h-14 px-8 py-4 has-[>svg]:px-8",
        icon: "size-12 p-3",
        "icon-sm": "size-10 p-2.5",
        "icon-lg": "size-14 p-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  const isDisabled = disabled || loading

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size }),
        loading && "relative",
        className
      )}
      style={{ fontFamily: 'var(--font-custom)', fontWeight: 600 }}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <span className="opacity-70">{children}</span>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
