"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { Check } from "lucide-react";
import { cn } from "./utils";

export type ProgressVariant = "default" | "success" | "warning" | "error";
export type ProgressSize = "xs" | "sm" | "md" | "lg";

export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: ProgressVariant;
  size?: ProgressSize;
  label?: boolean;
}

const variantTrack: Record<ProgressVariant, string> = {
  default: "bg-primary",
  success: "bg-green-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
};

const sizeClasses: Record<ProgressSize, string> = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", size = "md", label, ...props }, ref) => (
  <div className="w-full">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative w-full overflow-hidden rounded-full bg-muted", sizeClasses[size], className)}
      {...props}
      value={value}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 transition-all duration-pg-slow ease-pg-standard", variantTrack[variant])}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
    {label && <p className="mt-1 text-xs text-muted-foreground text-right">{value ?? 0}%</p>}
  </div>
));
Progress.displayName = "Progress";

export type ProgressStepStatus = "complete" | "current" | "upcoming";

export interface ProgressTrackerStep {
  label: string;
  description?: string;
  status: ProgressStepStatus;
}

export interface ProgressTrackerProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: ProgressTrackerStep[];
  /**
   * `inline` is the compact one-line form for a dialog header: a small number
   * beside each label, a short rule between, a finished step in success green.
   * Default `default`, the stacked tracker for a page.
   */
  variant?: "default" | "inline";
}

const ProgressTracker = React.forwardRef<HTMLDivElement, ProgressTrackerProps>(
  ({ className, steps, variant = "default", ...props }, ref) =>
    variant === "inline" ? (
      <ol ref={ref as React.Ref<HTMLOListElement>} aria-label="Steps" className={cn("flex items-center gap-2", className)} {...(props as React.HTMLAttributes<HTMLOListElement>)}>
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <li
              aria-current={step.status === "current" ? "step" : undefined}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                step.status === "upcoming" ? "text-muted-foreground" : "text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  step.status === "complete" && "bg-green-500/15 text-green-700 dark:text-green-400",
                  step.status === "current" && "bg-primary text-primary-foreground",
                  step.status === "upcoming" && "border border-border text-muted-foreground"
                )}
              >
                {step.status === "complete" ? <Check className="size-3" strokeWidth={3} /> : i + 1}
              </span>
              {step.label}
            </li>
            {i < steps.length - 1 && <li aria-hidden="true" className="h-px w-8 bg-border" />}
          </React.Fragment>
        ))}
      </ol>
    ) : (
    <div ref={ref} className={cn("flex items-start", className)} {...props}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5 min-w-0">
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
              step.status === "complete" && "bg-primary border-primary text-primary-foreground",
              step.status === "current" && "bg-primary/10 border-primary text-primary",
              step.status === "upcoming" && "bg-card border-border text-muted-foreground"
            )}>
              {step.status === "complete" ? <Check className="size-4" strokeWidth={2.5} /> : i + 1}
            </div>
            <div className="text-center px-1">
              <p className={cn("text-xs font-medium", step.status === "upcoming" ? "text-muted-foreground" : "text-foreground")}>{step.label}</p>
              {step.description && <p className="text-[11px] text-muted-foreground mt-0.5">{step.description}</p>}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 mt-4 mx-1">
              <div className={cn("h-0.5 w-full rounded-full transition-colors", step.status === "complete" ? "bg-primary" : "bg-border")} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
    )
);
ProgressTracker.displayName = "ProgressTracker";

export { Progress, ProgressTracker };
