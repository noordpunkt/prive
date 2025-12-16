import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground w-full min-w-0 bg-transparent outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "border-0 border-b border-black/10 dark:border-white/10 pb-2",
        "focus-visible:border-b focus-visible:border-black dark:focus-visible:border-white focus-visible:ring-0",
        "aria-invalid:border-b-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
