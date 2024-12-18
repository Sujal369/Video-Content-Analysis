"use client"

import * as React from "react"

const ChartContainer = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`w-full h-full ${className}`} {...props} />
))
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`bg-background border rounded-md shadow-md p-2 ${className}`}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`text-sm ${className}`} {...props} />
))
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent }

