"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "./utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(
  (
    { className, align = "center", sideOffset = 6, collisionPadding = 12, ...props },
    ref
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        // Keep a gutter between the popover and the viewport edge, so a
        // content-bounded panel (see `--radix-popover-content-available-height`
        // below) stops short of the fold rather than sitting flush against it.
        collisionPadding={collisionPadding}
        className={cn(
          "z-[120] w-72 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg outline-none",
          "data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-150",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
