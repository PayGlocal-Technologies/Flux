"use client";

import { forwardRef, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "./button";
import { cn } from "./utils";

export interface CopyButtonProps extends Omit<ButtonProps, "value" | "onClick" | "children"> {
  /** What reaches the clipboard. */
  value: string;
  /**
   * The idle label, e.g. "Copy Payment Link". Left out, the button is
   * icon-only: a copy icon that turns into a tick.
   */
  children?: ReactNode;
  /** The label while copied. Default "Copied". */
  copiedLabel?: ReactNode;
  /**
   * The accessible name of an icon-only button, e.g. "Copy payment link".
   * Ignored when `children` gives the button its own label.
   */
  label?: string;
  /** A toast on a successful copy, e.g. "Payment link copied". None when left out. */
  toastMessage?: string;
  /**
   * The variant while copied. Defaults to `outline` for a `primary` button, so
   * the green "Copied" never sits on the filled blue, and to `variant` otherwise.
   */
  copiedVariant?: ButtonProps["variant"];
  /** How long the button reads "Copied", in ms. Default 2000. */
  copiedFor?: number;
  /** Called after each successful copy. */
  onCopied?: () => void;
  /** Extra classes on the icon (copy and tick alike). */
  iconClassName?: string;
}

/** The "just copied" look: the label and its tick in green, nothing else. */
const COPIED_CLASSES = "text-emerald-600 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-400";

/**
 * A button that copies `value` and says so: for `copiedFor` ms it reads
 * "Copied" with a green tick, then goes back. The clipboard write, the toast
 * and the timing all live here, so every copy button behaves the same.
 *
 * Only a write that worked says "Copied". A blocked clipboard (an insecure
 * context, or permission denied) leaves the button as it was, as CopyableCell
 * does. A second copy within the window restarts it. The click stops
 * propagating, so copying inside a clickable row never also opens it.
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      value,
      children,
      copiedLabel = "Copied",
      label,
      toastMessage,
      variant = "primary",
      copiedVariant,
      copiedFor = 2000,
      onCopied,
      iconClassName,
      leftIcon,
      className,
      type = "button",
      ...props
    },
    ref
  ) => {
    const [copied, setCopied] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // The tick reverts on a timer, which must not outlive the button.
    useEffect(
      () => () => {
        if (timer.current) clearTimeout(timer.current);
      },
      []
    );

    const copy = async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        return;
      }
      setCopied(true);
      if (toastMessage) toast.success(toastMessage);
      onCopied?.();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), copiedFor);
    };

    const iconOnly = children === undefined || children === null;
    const icon = cn("size-3.5 shrink-0", iconClassName);
    const tick = <Check className={icon} aria-hidden />;

    return (
      <Button
        ref={ref}
        type={type}
        variant={copied ? (copiedVariant ?? (variant === "primary" ? "outline" : variant)) : variant}
        onClick={(e) => void copy(e)}
        leftIcon={iconOnly ? undefined : copied ? tick : leftIcon}
        aria-label={iconOnly ? (copied ? "Copied" : (label ?? "Copy")) : undefined}
        className={cn(
          iconOnly && "h-6 w-6 min-h-0 min-w-0 rounded-md p-0",
          className,
          copied && COPIED_CLASSES
        )}
        {...props}
      >
        {iconOnly ? (
          copied ? (
            tick
          ) : (
            <Copy className={icon} aria-hidden />
          )
        ) : copied ? (
          copiedLabel
        ) : (
          children
        )}
      </Button>
    );
  }
);
CopyButton.displayName = "CopyButton";
