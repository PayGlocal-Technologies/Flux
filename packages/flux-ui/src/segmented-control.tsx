"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "./utils";

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  /**
   * `destructive` paints the option red while it is selected: for a choice
   * whose consequence is a block or a removal (Deny beside Allow).
   */
  tone?: "default" | "destructive";
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  options: readonly SegmentedControlOption<T>[];
  /** The chosen value. `""` (or one no option has) leaves every segment off. */
  value: T | "";
  onValueChange: (value: T) => void;
  /** Accessible name of the group. */
  label: string;
  /** `sm` sits inside a list row; `md` beside a form field. Default `md`. */
  size?: "sm" | "md";
  disabled?: boolean;
  /** Marks the group invalid, for a required choice left unmade. */
  invalid?: boolean;
  className?: string;
}

const sizes = {
  sm: { root: "h-7 p-0.5", item: "h-6 px-2 text-[11px] max-md:h-10 max-md:px-3 max-md:text-xs" },
  md: { root: "h-9 p-0.5", item: "h-8 px-3 text-xs max-md:h-10" },
};

/**
 * A pill strip for picking one value from two to four: Allow / Deny, Read /
 * All, Both / Self / Child.
 *
 * It looks like the `Tabs` pill, but it is a radio group underneath, because
 * it sets a value rather than switching a view: screen readers announce "radio
 * button, 2 of 3" and the arrow keys move the choice. For switching what is
 * shown beside it, use `SegmentedTabs`.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  label,
  size = "md",
  disabled,
  invalid,
  className,
}: SegmentedControlProps<T>) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      aria-label={label}
      aria-invalid={invalid || undefined}
      disabled={disabled}
      orientation="horizontal"
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-border bg-muted/40",
        invalid && "border-destructive",
        sizes[size].root,
        className
      )}
    >
      {options.map((option) => (
        <RadioGroupPrimitive.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium text-muted-foreground transition-colors",
            "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:opacity-50",
            option.tone === "destructive"
              ? "data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground data-[state=checked]:shadow-sm"
              : "data-[state=checked]:bg-card data-[state=checked]:text-foreground data-[state=checked]:shadow-sm",
            sizes[size].item
          )}
        >
          {option.label}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
