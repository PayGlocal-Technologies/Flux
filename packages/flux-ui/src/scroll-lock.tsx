"use client";

import * as React from "react";
import { RemoveScroll } from "react-remove-scroll";

/**
 * Scrolling inside an overlay that sits on top of another overlay.
 *
 * ## The defect this exists to prevent
 *
 * A modal `Dialog` or `Drawer` installs a `react-remove-scroll` lock. That lock
 * listens for `wheel` and `touchmove` on `document` and, for any event whose
 * target is **outside** the locked subtree, calls `preventDefault()` — the
 * "outside or shard event" branch of its `SideEffect`. Radix passes only the
 * dialog's own content as a shard.
 *
 * Every panel a picker opens is portalled to `document.body`, which puts it
 * outside that subtree. So the panel renders, its list has `overflow-y-auto`,
 * and the wheel does nothing. It is invisible in code review, because the
 * component is correct on its own; it only misbehaves under an overlay.
 *
 * ## Why a lock, not an exception
 *
 * The same `SideEffect` returns early unless its own lock is the last one
 * pushed. So the fix is not to poke a hole in the dialog's lock — it is for the
 * panel to push a lock of its own while it is open, which suspends the one
 * underneath and makes the panel's subtree the locked one. When it closes, its
 * lock pops and the dialog's resumes.
 *
 * ## Why not just make the popover `modal`
 *
 * Radix installs a lock of its own for a `modal` popover, which would also fix
 * the wheel — but it comes with a focus trap and with outside clicks being
 * swallowed by the dismiss layer. Every popover already living inside a dialog
 * would start behaving differently for the sake of a scrolling fix. So the lock
 * is pushed directly, by {@link ScrollLockTakeover}, and modality is left
 * alone. `PopoverContent` wraps every panel in it, which covers the pickers and
 * anything an app composes; the hand-rolled `createPortal` panels
 * (`DatePicker`, `TimePicker`) wrap theirs the same way.
 */

/**
 * Whether a `react-remove-scroll` lock is currently held — by a modal Dialog,
 * Drawer, AlertDialog, or another picker.
 *
 * `data-scroll-locked` is set on `<body>` by `react-remove-scroll-bar`, which
 * every such lock goes through, so this is the library's own signal rather
 * than a guess about which overlay is open.
 */
export function isScrollLocked(): boolean {
  return typeof document !== "undefined" && document.body.hasAttribute("data-scroll-locked");
}

/**
 * The same takeover for a panel that portals itself instead of going through
 * Radix. Renders children untouched when no lock is held, so a picker on a
 * plain page behaves exactly as before.
 *
 * `removeScrollBar` is off: the page's scrollbar is already gone, and a second
 * `RemoveScrollBar` re-measures a gap that is now zero and writes it back over
 * the dialog's, shifting the layout while the panel is open. The consequence is
 * that this takeover does **not** bump `data-scroll-locked`; the wrapper's
 * `data-scroll-lock-takeover` is the marker instead, in the DOM for debugging
 * and for tests.
 */
export function ScrollLockTakeover({ children }: { children: React.ReactNode }) {
  // Read once, when the panel mounts — that is the moment it opens.
  const [active] = React.useState(isScrollLocked);
  if (!active) return <>{children}</>;
  return (
    <RemoveScroll removeScrollBar={false} allowPinchZoom data-scroll-lock-takeover="">
      {children}
    </RemoveScroll>
  );
}
