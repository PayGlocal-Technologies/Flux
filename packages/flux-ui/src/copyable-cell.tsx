"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { cn } from "./utils";

export interface CopyableCellProps {
  /**
   * The full value. This is what reaches the clipboard, the tooltip and the
   * accessible name — always, even when `display` shortens what is on screen.
   * Shortening what is shown must never shorten what the user walks away with.
   */
  value?: string | null;
  /** What to render instead of `value` — an elided form, typically. */
  display?: string;
  /** The noun in the tooltip and the toast: "Transaction ID copied". */
  label?: string;
  /**
   * Makes the value the handle that opens the row, rendered as a link. Without
   * it the value is plain text that can still be copied.
   *
   * The copy button stops propagation, so an id that opens a row does not also
   * open it when copied.
   */
  onClick?: () => void;
  /** Render the value in the primary colour. */
  accent?: boolean;
  monospace?: boolean;
  /** What an absent value renders as. Default the em dash every grid uses. */
  fallback?: string;
  /**
   * - `inline` (default) — the value, with its own copy button beside it.
   * - `cell` — the **whole** element is the copy target and the value
   *   underlines on hover. For a fixed-width column where a separate button
   *   would cost more room than the value it copies.
   *
   * `cell` ignores `onClick`: a cell cannot both copy and open the row on the
   * same click.
   */
  variant?: "inline" | "cell";
  /**
   * Keep the copy button invisible until the row (or any `group` ancestor) is
   * hovered, or the button itself is focused. Opacity only — it keeps its
   * space, so revealing it never shifts the row.
   *
   * Defaults to `true`, which is what a table wants: twelve permanent copy
   * buttons are twelve pieces of chrome competing with the data. Pass `false`
   * for a detail field, where there is no row to hover and the control would
   * simply never appear. Pointer-coarse devices have no hover to give, so it
   * stays visible there regardless.
   */
  revealOnHover?: boolean;
  /**
   * Announce the copy with a toast. Off for a field whose tick and tooltip are
   * feedback enough, and where a toast per copy would be noise.
   */
  showToast?: boolean;
  /** Extra classes on the value itself, e.g. a muted secondary placement. */
  valueClassName?: string;
  className?: string;
}

/**
 * The canonical identifier cell: a value plus a copy button that fades in on
 * the row's hover.
 *
 * Reveal-on-hover is the point. A table of twelve ids with twelve permanent
 * copy buttons is twelve pieces of chrome competing with the data; the row the
 * pointer is on is the only one whose button is useful.
 *
 * It relies on the row's own `group` class, which every `DataTable` `<tr>`
 * already carries. Outside a DataTable row, pass `className="group"` on an
 * ancestor or the button stays hidden.
 */
export function CopyableCell({
  value,
  display,
  label = "Value",
  onClick,
  accent = false,
  monospace = false,
  fallback = "—",
  variant = "inline",
  revealOnHover = true,
  showToast = true,
  valueClassName,
  className,
}: CopyableCellProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The tick reverts on a timer, so an unmount mid-flight must not leave it
  // running against a gone component.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  if (!value) return <span className="text-muted-foreground">{fallback}</span>;

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (showToast) toast.success(`${label} copied`);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked — an insecure context, or permission denied. Copying
      // an id is not worth an error toast over; the value is still on screen.
    }
  };

  /**
   * Copying is never also a request to open the record the value belongs to,
   * so the event stops here. DataTable's own `onRowClick` already skips a
   * click on a button; this also covers rows made clickable some other way.
   */
  const copy = (e: MouseEvent) => {
    e.stopPropagation();
    void copyValue();
  };

  const text = cn(
    "min-w-0 truncate font-medium",
    accent ? "text-primary" : "text-foreground",
    monospace && "font-mono",
    valueClassName
  );

  /** Names the full value when the screen only shows part of it. */
  const elided = display !== undefined && display !== value;
  const copyHint = copied ? "Copied" : elided ? `Copy ${value}` : `Copy ${label}`;

  if (variant === "cell") {
    // The whole box copies, so there is no separate button to reach for — in a
    // narrow column that button costs more width than the value it copies. The
    // value underlines on hover to say the box is the target; the icon is a
    // marker, not a second control, which is why it is not focusable.
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              onClick={copy}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                e.stopPropagation();
                void copyValue();
              }}
              aria-label={copied ? "Copied to clipboard" : `Copy ${value}`}
              className={cn(
                "group/copy flex min-w-0 cursor-pointer items-center gap-1 rounded-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                className
              )}
            >
              <span className={cn(text, "flex-1 group-hover/copy:underline")}>
                {display ?? value}
              </span>
              {copied ? (
                <Check className="h-3 w-3 shrink-0 text-muted-foreground" />
              ) : (
                <Copy
                  className={cn(
                    "h-3 w-3 shrink-0 text-muted-foreground",
                    revealOnHover &&
                      "opacity-0 transition-opacity group-hover/copy:opacity-100 group-focus-visible/copy:opacity-100 [@media(hover:none)]:opacity-100"
                  )}
                />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {copied ? "Copied" : "Copy"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("group/copy flex min-w-0 items-center gap-1", className)}>
      {onClick ? (
        // A bare <button>, deliberately, where the rest of flux would reach for
        // `Button variant="link"`. That variant hard-codes `text-[15px]`, and
        // the obvious override — `text-[inherit]` — does not beat it: Tailwind
        // and tailwind-merge read `text-[<non-length>]` as a COLOUR, so the
        // size class survives and the cell renders 2px larger than every other
        // cell in the row. Preflight already gives a bare button `font: inherit`,
        // so this simply inherits the cell's size at whatever density the table
        // is using, which is what a cell should do.
        <button
          type="button"
          onClick={onClick}
          title={value}
          className={cn(
            "cursor-pointer bg-transparent p-0 text-left underline-offset-4",
            "hover:underline focus-visible:underline focus-visible:outline-none",
            text
          )}
        >
          {display ?? value}
        </button>
      ) : (
        <span className={text} title={value}>
          {display ?? value}
        </span>
      )}

      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              onClick={copy}
              aria-label={`Copy ${label}`}
              // `group-hover` is the DataTable row; `group-hover/copy` covers a
              // cell used outside one, where hovering the value itself should
              // still reveal the button.
              className={cn(
                "h-5 w-5 min-h-0 min-w-0 shrink-0 rounded-md p-0 text-muted-foreground",
                revealOnHover && [
                  "opacity-0 transition-opacity",
                  // `group-hover` is the DataTable row; `group-hover/copy`
                  // covers a cell used outside one, where hovering the value
                  // itself should still reveal the button.
                  "focus-visible:opacity-100 group-hover:opacity-100 group-hover/copy:opacity-100",
                  // No hover to wait for on a touch device, so it simply shows.
                  "[@media(hover:none)]:opacity-100",
                ]
              )}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {copyHint}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
