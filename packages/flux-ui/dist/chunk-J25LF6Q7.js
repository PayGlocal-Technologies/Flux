"use client";

// src/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/elevation.ts
var elevation = {
  /**
   * Flat surfaces that sit ON the page and are delineated by their border:
   * Card, chart surfaces, Alert, SectionMessage, Spotlight, Skeleton.
   *
   * `shadow-xs` (one 2px blur at 5% black): the lightest lift that still reads
   * as a surface on the page, half the weight of `shadow-sm`. Chosen over
   * `shadow-none` deliberately, so cards keep a hint of depth beyond their
   * border. A call site that needs fully flat or a stronger lift passes
   * `shadow-none` / `shadow-sm` through `className`; tailwind-merge lets it win.
   */
  surface: "shadow-xs",
  /**
   * Button-shaped things: Button, IconButton, ButtonGroup segments, the
   * pagination page buttons, a table's row CTA. Just enough lift to read as
   * pressable. Ghost and link variants stay flat and do not use this.
   */
  control: "shadow-sm",
  /**
   * Anything you type into or pick from: Input, Textarea, every select
   * trigger, the date and time pickers, OTP boxes, Checkbox, Radio.
   *
   * Deliberately flat. A field is a well, not a raised object, and a form of
   * ten shadowed controls reads as clutter. Emitted as an explicit
   * `shadow-none` rather than by omitting the class so that a caller passing
   * `shadow-sm` through `className` still wins under tailwind-merge.
   */
  field: "shadow-none",
  /**
   * Things that genuinely float above the page, where depth is the signal that
   * says "this is detached and dismissible". Kept heavier than `surface` on
   * purpose — flattening these is what makes a dropdown look painted on.
   */
  tooltip: "shadow-md",
  popover: "shadow-lg",
  drawer: "shadow-xl",
  modal: "shadow-2xl"
};

// src/button.tsx
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var variantClasses = {
  primary: `bg-primary text-primary-foreground border border-primary ${elevation.control} hover:bg-[var(--primary-hover)]`,
  secondary: `bg-muted text-foreground border border-border ${elevation.control} hover:bg-muted/85 dark:bg-muted/35 dark:text-foreground dark:border-border dark:hover:bg-muted/55`,
  ghost: "bg-transparent text-foreground border border-transparent hover:bg-muted focus-visible:bg-muted/80 active:bg-muted/90",
  danger: `bg-red-600 text-white border border-red-600 ${elevation.control} hover:bg-red-700`,
  outline: `bg-card text-foreground border border-border ${elevation.control} hover:bg-muted`,
  link: "h-auto min-h-0 rounded-md border border-transparent bg-transparent px-2 py-2 font-medium text-primary shadow-none underline-offset-4 hover:bg-primary/5 hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:no-underline"
};
var linkSizes = {
  sm: "text-[13px]",
  md: "text-sm",
  lg: "text-[15px]"
};
var LINK_DEFAULT_SIZE = "text-[15px]";
var sizes = {
  sm: "h-9 min-h-9 px-3.5 text-xs gap-1.5 rounded-lg",
  md: "h-10 min-h-10 px-5 text-sm gap-2 rounded-lg",
  lg: "h-[3.25rem] min-h-[3.25rem] px-10 text-[15px] gap-2.5 rounded-xl"
};
var Button = forwardRef(
  ({
    variant = "primary",
    // No default here: a link tells "no size given" apart from "md" (see linkSizes).
    size: sizeProp,
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className,
    disabled,
    ...props
  }, ref) => {
    const size = sizeProp ?? "md";
    return /* @__PURE__ */ jsxs(
      "button",
      {
        ref,
        disabled: disabled || isLoading,
        className: cn(
          "inline-flex items-center justify-center font-medium transition-colors duration-pg-fast ease-pg-standard",
          // A button's label never wraps. Without this, a narrow button breaks
          // the line between an icon and its text — and an icon passed as a
          // child rather than through `leftIcon` sits inside the same span, so
          // it wraps with the words. Pass `whitespace-normal` in `className`
          // for the rare button that really should wrap.
          "whitespace-nowrap",
          variant !== "link" && "disabled:cursor-not-allowed disabled:opacity-50",
          variant === "link" && "justify-center",
          variant !== "link" && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
          variantClasses[variant],
          variant !== "link" && sizes[size],
          variant === "link" && (sizeProp ? linkSizes[sizeProp] : LINK_DEFAULT_SIZE),
          className
        ),
        ...props,
        children: [
          isLoading ? /* @__PURE__ */ jsx(
            Loader2,
            {
              className: cn(
                "animate-spin",
                size === "sm" ? "size-3.5" : size === "lg" ? "size-[1.125rem]" : "size-3.5"
              )
            }
          ) : leftIcon,
          /* @__PURE__ */ jsx("span", { className: cn(isLoading && "opacity-70"), children }),
          !isLoading && rightIcon
        ]
      }
    );
  }
);
Button.displayName = "Button";

// src/separator.tsx
import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { jsx as jsx2 } from "react/jsx-runtime";
var Separator = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx2(
  SeparatorPrimitive.Root,
  {
    ref,
    decorative,
    orientation,
    className: cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    ),
    ...props
  }
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export {
  cn,
  elevation,
  Button,
  Separator
};
//# sourceMappingURL=chunk-J25LF6Q7.js.map