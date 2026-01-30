import * as React from "react"
import { cn } from "@/lib/utils"

const Spinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("animate-spin", className)}
    {...props}
  >
    <svg
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h3zm1.5 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l1.8-1.6z"
      ></path>
    </svg>
  </div>
))
Spinner.displayName = "Spinner"

export { Spinner }
