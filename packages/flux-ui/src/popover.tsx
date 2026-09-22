"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "./utils";
import { ScrollLockTakeover } from "./scroll-lock";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 6, collisionPadding = 12, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    {/* Every popover panel is portalled to `document.body`, which puts it
        outside a Dialog's or Drawer's scroll lock — and that lock cancels the
        wheel for everything outside itself, so a scrollable panel silently
        refuses to scroll. The takeover is a no-op when no lock is held, so a
        popover on a plain page behaves exactly as before, and unlike making the
        popover `modal` it changes nothing about focus or outside clicks. See
        `scroll-lock.tsx`. */}
    <ScrollLockTakeover>
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
    </ScrollLockTakeover>
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
