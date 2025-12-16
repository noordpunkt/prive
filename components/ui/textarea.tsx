import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground min-h-[80px] w-full min-w-0 bg-transparent text-base outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "border-0 border-b border-black/10 dark:border-white/10 pb-2",
        "focus-visible:border-b focus-visible:border-black dark:focus-visible:border-white focus-visible:ring-0",
        "aria-invalid:border-b-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

