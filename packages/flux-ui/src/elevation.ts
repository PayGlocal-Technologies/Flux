/**
 * Elevation — the one place flux decides what casts a shadow.
 *
 * Shadows used to be typed inline at ~60 call sites, which is how the library
 * drifted: a Card, an Alert and a Skeleton card are the same kind of surface,
 * but nothing held them to the same value, and "the default card shadow" was
 * whatever the last person wrote. These constants are that default, named.
 *
 * They are plain Tailwind utility strings rather than CSS custom properties on
 * purpose. flux ships no stylesheet — consuming apps compile its classes via
 * `@source ".../flux-ui/src"` — so a `--shadow-*` token would have to be
 * redeclared in every app's globals.css and would silently resolve to nothing
 * in any app that forgot. A literal class here is scanned like any other and
 * needs no app-side setup.
 *
 * Changing a value here restyles every component that uses it. That is the point.
 */
export const elevation = {
  /**
   * Flat surfaces that sit ON the page and are delineated by their border:
   * Card, chart surfaces, DataTableCard, Alert, SectionMessage, Skeleton.
   * This is the shadow on the mca-home revenue card, and the reference the
   * rest of the library was pulled onto.
   */
  surface: "shadow-sm",

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
  modal: "shadow-2xl",
} as const;
