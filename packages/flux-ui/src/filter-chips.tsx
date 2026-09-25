"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { DatePicker } from "./date-picker";
import { Input } from "./input";
import { Tabs, TabsList, TabsTrigger } from "./tabs";
import { IconButton } from "./icon-button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Separator } from "./separator";
import { formatMonthLabel, MONTHS_SHORT } from "./format-datetime";

/**
 * Bounds a popover by the space that is actually below (or above) the trigger,
 * rather than by a fixed pixel cap.
 *
 * A chip near the bottom of a long page has very little room beneath it, and a
 * `max-h-64` list plus a search box plus an Apply/Clear footer can easily run
 * past the fold — the last few options, and often Apply itself, end up
 * unreachable. Radix measures that space and publishes it as
 * `--radix-popover-content-available-height`; capping the content to it makes
 * the panel shrink to fit and its list scroll instead.
 *
 * The content becomes a flex column so the footer stays pinned to the bottom
 * while only the list scrolls. Panels pair this with `FILTER_SCROLL_AREA`.
 */
const POPOVER_FIT = "flex max-h-[var(--radix-popover-content-available-height)] flex-col overflow-hidden";

/**
 * The scrolling half of a fitted popover: it takes whatever height is left over
 * once the fixed chrome has been laid out, never more than its own cap.
 * `min-h-0` is what lets a flex child shrink below its content height at all.
 */
const FILTER_SCROLL_AREA = "min-h-0 flex-1 overflow-y-auto";

import { cn } from "./utils";
import { elevation } from "./elevation";

export interface FilterChipOption {
  value: string;
  label: string;
  /** Optional leading glyph — a flag, a brand mark, a status dot. */
  icon?: ReactNode;
  /** Secondary text to the right, e.g. a matching count. */
  hint?: string;
}

// ── Group: one chip open at a time, without the flash ─────────────────────────

type FilterChipGroupContextValue = {
  openKey: string | null;
  setOpen: (key: string, open: boolean) => void;
  /**
   * True exactly once, for the chip that was closed to make way for another —
   * and clears itself on read. See `useFilterChipState`'s `onCloseAutoFocus`.
   */
  consumeHandoff: (key: string) => boolean;
};

const FilterChipGroupContext = createContext<FilterChipGroupContextValue | null>(null);

/**
 * Wraps a row of filter chips so only one popover is open at a time — and,
 * crucially, so switching between two chips does not make the second one flash.
 *
 * The flash comes from every chip sharing one `openChip` value while Radix
 * reports the two halves of the switch as separate events: the chip being
 * *opened* fires `onOpenChange(true)` and the chip being *dismissed* fires
 * `onOpenChange(false)`. A naive `setOpenChip(open ? key : null)` lets whichever
 * event lands second win, so when the dismissal lands second it wipes out the
 * chip that just opened — it mounts, paints, and unmounts.
 *
 * The fix is that a close only counts if the chip closing is still the one on
 * screen. A stale dismissal from the chip the user just left is then a no-op,
 * whatever order the events arrive in. This lives here rather than in each
 * toolbar because it is invisible until it is wrong, and it was wrong in every
 * toolbar that hand-rolled it.
 */
export function FilterChipGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  /**
   * Mirrors `openKey` for synchronous reads. A switch is decided inside an
   * event handler, where the `openKey` from this render may already be stale.
   */
  const openKeyRef = useRef<string | null>(null);
  const frameRef = useRef<number | null>(null);
  /** The chip closed by a handoff, awaiting its close-auto-focus. */
  const handoffFromRef = useRef<string | null>(null);

  const apply = useCallback((next: string | null) => {
    openKeyRef.current = next;
    setOpenKey(next);
  }, []);

  /**
   * Opening a chip while another is open is a **handoff, not a swap**: the
   * outgoing chip closes now and the incoming one opens on the next frame, so
   * the two popovers never exist at the same moment.
   *
   * Simply reassigning `openKey` looks equivalent and is not. It mounts the new
   * popover inside the very click that closed the old one, which leaves the new
   * layer registering its dismissal listeners mid-event and able to catch the
   * tail of that same interaction — it opens, paints, and dismisses itself.
   * Deferring by a frame puts the mount cleanly after the click, so there is
   * nothing left of the previous interaction for it to react to.
   *
   * A close is still immediate, and only counts if the chip closing is the one
   * actually on screen — a stale close from the chip just left is a no-op
   * whatever order the events arrive in.
   */
  const setOpen = useCallback(
    (key: string, open: boolean) => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      if (!open) {
        // A stale close from the chip just left is a no-op, whatever order the
        // events arrive in.
        if (openKeyRef.current === key) apply(null);
        return;
      }

      if (openKeyRef.current !== null && openKeyRef.current !== key) {
        handoffFromRef.current = openKeyRef.current;
        apply(null);
        frameRef.current = requestAnimationFrame(() => {
          frameRef.current = null;
          apply(key);
        });
        return;
      }

      apply(key);
    },
    [apply]
  );

  // A handoff in flight when the toolbar unmounts must not fire into nothing.
  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    []
  );

  const consumeHandoff = useCallback((key: string) => {
    if (handoffFromRef.current !== key) return false;
    handoffFromRef.current = null;
    return true;
  }, []);

  const value = useMemo(
    () => ({ openKey, setOpen, consumeHandoff }),
    [openKey, setOpen, consumeHandoff]
  );

  return (
    <FilterChipGroupContext.Provider value={value}>
      <div className={cn("flex flex-wrap items-center gap-2", className)}>{children}</div>
    </FilterChipGroupContext.Provider>
  );
}

/**
 * Open state for one chip. Inside a {@link FilterChipGroup} the group owns it
 * so opening this chip closes its siblings; outside one, the chip keeps its own
 * state, so a lone chip works with no wrapper.
 *
 * Every chip below calls this rather than taking `open` / `onOpenChange` props,
 * which is what stops a call site from reintroducing the flicker by wiring the
 * state up itself. A chip that genuinely needs outside control can still pass
 * `open` / `onOpenChange` — a mounted-but-hidden twin of a chip, say — and
 * those win.
 */
export function useFilterChipState(
  key: string,
  controlled?: { open?: boolean; onOpenChange?: (open: boolean) => void }
): {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Spread onto the chip's `PopoverContent`. See below. */
  onCloseAutoFocus: (event: Event) => void;
} {
  const group = useContext(FilterChipGroupContext);
  const [localOpen, setLocalOpen] = useState(false);

  const isControlled = controlled?.open !== undefined;

  const onOpenChange = useCallback(
    (next: boolean) => {
      controlled?.onOpenChange?.(next);
      if (isControlled) return;
      if (group) group.setOpen(key, next);
      else setLocalOpen(next);
    },
    [controlled, isControlled, group, key]
  );

  const open = isControlled ? controlled!.open! : group ? group.openKey === key : localOpen;

  /**
   * Stops a chip closed by a **handoff** from pulling focus back to its own
   * trigger, which would land outside the chip now opening and make Radix
   * dismiss it — the flash.
   *
   * Radix restores focus on close unless the popover was dismissed by an
   * outside interaction. A handoff is neither: the group closes the chip
   * programmatically, so as far as Radix is concerned this is an ordinary close
   * and the trigger should get focus back. It should not — the user's attention
   * has moved to another chip.
   *
   * Escape and Apply still restore focus, because neither is a handoff.
   */
  const onCloseAutoFocus = useCallback(
    (event: Event) => {
      if (group?.consumeHandoff(key)) {
        event.preventDefault();
      }
    },
    [group, key]
  );

  return { open, onOpenChange, onCloseAutoFocus };
}

/** The `open` / `onOpenChange` pair every chip accepts for outside control. */
export interface FilterChipControl {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// ── Chip shell ────────────────────────────────────────────────────────────────

/**
 * Every filter chip is built from three pieces: this visual shell (the dashed
 * pill), a label trigger that opens the popover, and — only once the filter has
 * a value — a separate clear button to its left.
 *
 * The clear button and the trigger are two independent `<button>`s side by side
 * rather than one button whose leading icon doubles as a clear action: clicking
 * × must clear *without* opening the popover, and a real `<button>` cannot nest
 * inside another. Keeping them siblings means stopping the clear click from
 * also opening the popover needs no `stopPropagation` gymnastics — they are
 * simply two separate click targets.
 *
 * Inactive it reads as an "add a filter" affordance: a dashed outline in the
 * muted border colour. Active it flips to a solid primary ring with a tinted
 * fill, so an applied filter is unmistakable at a glance rather than a subtle
 * recolour of the same dashed outline.
 *
 * Flat either way (`elevation.field`): a chip is something you pick from, the
 * same kind of control as a select trigger, so it takes the fields' elevation
 * rather than a raised button's.
 */
export function FilterChipShell({
  active,
  children,
  className,
}: {
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-auto shrink-0 items-center rounded-full border border-dashed border-border bg-card",
        elevation.field,
        active && "border-solid border-primary bg-primary/10 ring-1 ring-primary/30",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Leading × segment, rendered only when the filter is active.
 *
 * A `Button` rather than an `IconButton` so the `h-auto` / `min-h-0` height
 * override behaves the same way the label trigger's already does: IconButton
 * sizes with Tailwind's `size-*` utility, which a plain `h-auto` does not
 * reliably beat the way it beats Button's `h-9`.
 */
export function FilterChipClearButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={`Clear ${label} filter`}
      onClick={onClick}
      className="h-auto min-h-0 shrink-0 rounded-full border border-transparent px-2 py-1 text-primary/70 hover:text-primary"
    >
      <X className="h-3 w-3" />
    </Button>
  );
}

/**
 * Trailing label segment — the actual `PopoverTrigger` target.
 *
 * A leading plus shows only while inactive, since once active the clear button
 * to its left already carries a leading icon. A trailing dot then marks
 * "active"; `count` replaces it with a number when *how many* values are
 * applied is worth saying.
 *
 * Must forward its ref and spread the rest of its props onto the underlying
 * Button: `PopoverTrigger asChild` clones its single child to inject
 * onClick/ref/aria-*, and a component that swallows those renders a chip that
 * looks right and does nothing when clicked.
 */
export const FilterChipLabelTrigger = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    active: boolean;
    /** Show this number instead of the plain active dot. */
    count?: number;
  } & Omit<ComponentPropsWithoutRef<typeof Button>, "children">
>(({ label, active, count, className, ...props }, ref) => (
  <Button
    ref={ref}
    type="button"
    variant="ghost"
    size="sm"
    leftIcon={
      !active ? (
        <span className="flex h-3.5 w-3.5 items-center justify-center">
          <Plus className="h-3 w-3" />
        </span>
      ) : undefined
    }
    rightIcon={
      active ? (
        <span className="flex h-3.5 items-center justify-center">
          {count != null && count > 0 ? (
            <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold tabular-nums text-primary">
              {count}
            </span>
          ) : (
            /* Drawn the way Badge draws its dot: the same size-1.5 rounded
               fill in the primary accent. A state marker, not a count. */
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          )}
        </span>
      ) : undefined
    }
    className={cn(
      "h-auto min-h-0 shrink-0 rounded-full border border-transparent py-1",
      active
        ? "pl-1.5 pr-2.5 font-semibold text-primary hover:text-primary"
        : "pl-2.5 pr-2.5 text-muted-foreground hover:text-foreground",
      className
    )}
    {...props}
  >
    {label}
  </Button>
));
FilterChipLabelTrigger.displayName = "FilterChipLabelTrigger";

/**
 * Apply / Clear footer shared by every panel, so the two buttons sit in the
 * same place and read the same wherever a chip's editor puts them.
 *
 * Both buttons **commit and close**. Clear is not "untick everything and let me
 * carry on" — that reading leaves the panel open over a filter that is still
 * applied, so the chip still reads "Type 1" while the list in front of you
 * shows nothing ticked, and closing the panel silently keeps the old filter.
 * Clear is the same act as the chip's own little x, reached from inside the
 * panel: it drops the filter and gets out of the way.
 */
export function FilterChipActions({
  onClear,
  onApply,
  clearDisabled,
  applyDisabled,
}: {
  onClear: () => void;
  onApply: () => void;
  clearDisabled?: boolean;
  applyDisabled?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-3 py-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClear}
        disabled={clearDisabled}
        className="text-muted-foreground hover:text-foreground"
      >
        Clear
      </Button>
      <Button type="button" variant="primary" size="sm" onClick={onApply} disabled={applyDisabled}>
        Apply
      </Button>
    </div>
  );
}

/**
 * The full chip — shell, clear button, trigger and popover — with the editor
 * supplied as `children`. Build a bespoke chip on this rather than reassembling
 * the pieces, so a one-off filter still opens, closes and clears like the rest.
 */
export function FilterChip({
  chipKey,
  label,
  active,
  count,
  onClear,
  children,
  align = "start",
  contentClassName,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onOpen,
}: {
  /** Identity within a {@link FilterChipGroup}. Must be unique in the row. */
  chipKey: string;
  label: string;
  active: boolean;
  count?: number;
  /** Omit to hide the × segment — for a chip that cannot be emptied. */
  onClear?: () => void;
  children: ReactNode;
  align?: "start" | "center" | "end";
  contentClassName?: string;
  /** Fires when the popover opens — the hook for seeding a draft from the
   *  applied value, so an abandoned edit never leaks into the next open. */
  onOpen?: () => void;
} & FilterChipControl) {
  const { open, onOpenChange, onCloseAutoFocus } = useFilterChipState(chipKey, {
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
  });

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) onOpen?.();
      }}
    >
      <FilterChipShell active={active}>
        {active && onClear ? (
          <FilterChipClearButton
            label={label}
            onClick={() => {
              onClear();
              onOpenChange(false);
            }}
          />
        ) : null}
        <PopoverTrigger asChild>
          <FilterChipLabelTrigger label={label} active={active} count={count} />
        </PopoverTrigger>
      </FilterChipShell>
      <PopoverContent
        align={align}
        className={cn("w-auto p-0", POPOVER_FIT, contentClassName)}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

// ── Multi-select chip ─────────────────────────────────────────────────────────

export interface SelectFilterChipProps extends FilterChipControl {
  /** Identity within a group. Defaults to `label`. */
  chipKey?: string;
  label: string;
  options: FilterChipOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  /** Show a search box above the list once there are this many options. Default 8. */
  searchThreshold?: number;
  /** Show the applied count on the chip instead of the plain active dot. */
  showCount?: boolean;
  /**
   * Adds an "Invert filter" tick below the list, turning the chosen set into an
   * exclusion. Pass both to enable it; omit for a plain include-only chip.
   *
   * It is staged with the options and applied with them, because inverting
   * without changing the set is still a change to what the table shows, and
   * committing it on the tick would make this one control in the panel behave
   * differently from the rest.
   */
  invert?: boolean;
  onInvertChange?: (next: boolean) => void;
  /** Label for the invert tick. Default "Invert filter". */
  invertLabel?: string;
  /** Empty-list line, for options that arrive from a request. */
  emptyText?: string;
  align?: "start" | "center" | "end";
}

/**
 * The workhorse chip: a checkbox list staged behind Apply, so ticking four
 * boxes is one query rather than four. Escaping or clicking away discards the
 * draft — the applied value only changes on Apply or Clear.
 */
export function SelectFilterChip({
  chipKey,
  label,
  options,
  selected,
  onChange,
  searchThreshold = 8,
  showCount = true,
  invert = false,
  onInvertChange,
  invertLabel = "Invert filter",
  emptyText,
  align = "start",
  open,
  onOpenChange,
}: SelectFilterChipProps) {
  const key = chipKey ?? label;
  // Resolved here, not just inside `FilterChip`, because this component's own
  // Apply and Clear need to close the popover — and under a `FilterChipGroup`
  // the `onOpenChange` prop is undefined, since the group owns that state.
  const chip = useFilterChipState(key, { open, onOpenChange });
  const [draft, setDraft] = useState<string[]>(selected);
  const [draftInvert, setDraftInvert] = useState(invert);
  const [query, setQuery] = useState("");
  const supportsInvert = !!onInvertChange;
  // An inversion with nothing chosen excludes nothing, so it is not on its own
  // an active filter.
  const isActive = selected.length > 0;

  // Matched on the value as well as the label, so "nz" finds New Zealand and a
  // raw status code finds its prettified row. Someone who thinks in codes should
  // not have to know the display name.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [options, query]);

  const toggle = (value: string) =>
    setDraft((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );

  return (
    <FilterChip
      chipKey={key}
      // An inverted chip says so on the pill: "Status Code" and "Status Code
      // (excluded)" filter to opposite halves of the same data, and a shared
      // count would otherwise be the only difference between them.
      label={supportsInvert && invert && isActive ? `${label} (excluded)` : label}
      active={isActive}
      count={showCount ? selected.length : undefined}
      align={align}
      open={chip.open}
      onOpenChange={chip.onOpenChange}
      // Reseed from the applied value on every open, so a draft abandoned last
      // time does not reappear as though it had been applied.
      onOpen={() => {
        setDraft(selected);
        setDraftInvert(invert);
        setQuery("");
      }}
      onClear={() => {
        onChange([]);
        setDraft([]);
        onInvertChange?.(false);
        setDraftInvert(false);
      }}
    >
      <FilterChipPanel
        options={visible}
        draft={draft}
        onToggle={toggle}
        query={options.length >= searchThreshold ? query : undefined}
        onQueryChange={setQuery}
        searchPlaceholder={`Search ${label.toLowerCase()}`}
        emptyText={emptyText}
        invert={supportsInvert ? draftInvert : undefined}
        onInvertChange={setDraftInvert}
        invertLabel={invertLabel}
      />
      <FilterChipActions
        onClear={() => {
          onChange([]);
          setDraft([]);
          onInvertChange?.(false);
          setDraftInvert(false);
          chip.onOpenChange(false);
        }}
        // Disabled only when there is genuinely nothing to drop: an applied
        // value with an emptied draft is still something to clear.
        clearDisabled={draft.length === 0 && selected.length === 0 && !draftInvert && !invert}
        onApply={() => {
          onChange(draft);
          onInvertChange?.(draftInvert);
          chip.onOpenChange(false);
        }}
      />
    </FilterChip>
  );
}

/** The checkbox list itself, reused by the multi-select chip and the add menu. */
function FilterChipPanel({
  options,
  draft,
  onToggle,
  query,
  onQueryChange,
  searchPlaceholder,
  emptyText,
  invert,
  onInvertChange,
  invertLabel,
}: {
  options: FilterChipOption[];
  draft: string[];
  onToggle: (value: string) => void;
  query?: string;
  onQueryChange: (q: string) => void;
  searchPlaceholder: string;
  emptyText?: string;
  /** Undefined hides the invert row entirely. */
  invert?: boolean;
  onInvertChange: (next: boolean) => void;
  invertLabel?: string;
}) {
  return (
    <div className="flex min-h-0 w-60 flex-1 flex-col">
      {query !== undefined ? (
        <div className="shrink-0 border-b border-border p-2">
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 text-[12.5px]"
          />
        </div>
      ) : null}
      <div className={cn("max-h-64 space-y-0.5 p-2", FILTER_SCROLL_AREA)}>
        {options.length === 0 ? (
          <p className="px-1 py-4 text-center text-[12.5px] text-muted-foreground">
            {emptyText ?? "No matches"}
          </p>
        ) : (
          options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-[12.5px] text-foreground hover:bg-muted/50"
            >
              <Checkbox
                checked={draft.includes(option.value)}
                onCheckedChange={() => onToggle(option.value)}
              />
              {option.icon}
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {option.hint ? (
                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                  {option.hint}
                </span>
              ) : null}
            </label>
          ))
        )}
      </div>

      {invert !== undefined ? (
        <label className="flex shrink-0 cursor-pointer items-center gap-2 border-t border-border px-3 py-2 text-[12.5px] text-foreground">
          <Checkbox checked={invert} onCheckedChange={(c) => onInvertChange(c === true)} />
          {invertLabel}
        </label>
      ) : null}
    </div>
  );
}

// ── Single-select chip ────────────────────────────────────────────────────────

export interface SingleSelectFilterChipProps extends FilterChipControl {
  chipKey?: string;
  label: string;
  options: FilterChipOption[];
  value: string;
  onChange: (next: string) => void;
  align?: "start" | "center" | "end";
  /** Show the chosen option's label on the chip instead of the field name. */
  showValueInLabel?: boolean;
}

/**
 * One-of-many. Picking applies immediately — there is nothing to stage when a
 * choice replaces rather than accumulates, and an Apply button for a single
 * click is a step that only costs the user time.
 */
export function SingleSelectFilterChip({
  chipKey,
  label,
  options,
  value,
  onChange,
  align = "start",
  showValueInLabel = false,
  open,
  onOpenChange,
}: SingleSelectFilterChipProps) {
  const key = chipKey ?? label;
  // See SelectFilterChip: picking an option has to close the popover itself.
  const chip = useFilterChipState(key, { open, onOpenChange });
  const isActive = value !== "";
  const chosen = options.find((o) => o.value === value);

  return (
    <FilterChip
      chipKey={key}
      label={showValueInLabel && chosen ? `${label}: ${chosen.label}` : label}
      active={isActive}
      align={align}
      open={chip.open}
      onOpenChange={chip.onOpenChange}
      onClear={() => onChange("")}
    >
      <div className={cn("max-h-64 w-52 p-1.5", FILTER_SCROLL_AREA)}>
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(option.value);
              chip.onOpenChange(false);
            }}
            className={cn(
              "w-full justify-start rounded-md px-2 py-1.5 text-[12.5px] font-normal",
              option.value === value && "bg-primary/10 font-medium text-primary"
            )}
          >
            {option.icon}
            <span className="truncate">{option.label}</span>
          </Button>
        ))}
      </div>
    </FilterChip>
  );
}

// ── Date-range chip ───────────────────────────────────────────────────────────

export interface DateRangeValue {
  /** `yyyy-mm-dd`, or "" for unset. */
  from: string;
  to: string;
}

/**
 * `DatePicker` renders `<div className={cn("relative", className)}>` with its
 * trigger `<button>` as the direct child, and hard-codes a tall trigger
 * (`h-12 rounded-xl px-5 text-[15px]`) sized for a form field. Inside a chip
 * popover that towers over everything around it, so `[&>button]` reaches the
 * trigger and brings it back to the size of the console's other dropdowns.
 */
const DATE_CHIP_TRIGGER =
  "[&>button]:!h-10 [&>button]:!min-h-0 [&>button]:!gap-2 [&>button]:!rounded-lg [&>button]:!px-3.5 [&>button]:!text-sm [&>button]:!font-normal [&>button]:!shadow-none [&>button>svg]:!size-4";

/**
 * "Last N weeks / days / hours / minutes", counted back from now.
 *
 * A duration rather than a pair of dates, because that is what it is: "last 2
 * days" means two days before *now*, and resolving it to fixed timestamps when
 * the user picks it quietly freezes it at the moment of the click. The chip
 * reports the duration; the caller resolves it at request time with
 * {@link relativeRangeToMillis}.
 *
 * Every field is a string because each is a text input, and "" is a field the
 * user has not filled in — distinct from "0".
 */
export interface RelativeRangeValue {
  weeks: string;
  days: string;
  hours: string;
  minutes: string;
}

export const EMPTY_RELATIVE_RANGE: RelativeRangeValue = {
  weeks: "",
  days: "",
  hours: "",
  minutes: "",
};

const RELATIVE_UNITS: {
  key: keyof RelativeRangeValue;
  label: string;
  seconds: number;
}[] = [
  { key: "weeks", label: "Weeks", seconds: 7 * 24 * 60 * 60 },
  { key: "days", label: "Days", seconds: 24 * 60 * 60 },
  { key: "hours", label: "Hours", seconds: 60 * 60 },
  { key: "minutes", label: "Minutes", seconds: 60 },
];

function relativeRangeSeconds(value: RelativeRangeValue): number {
  return RELATIVE_UNITS.reduce((total, unit) => {
    const parsed = parseInt(value[unit.key] || "0", 10);
    return total + (Number.isNaN(parsed) ? 0 : parsed) * unit.seconds;
  }, 0);
}

/** Whether a relative range names any span at all. */
export function hasRelativeRange(value: RelativeRangeValue | undefined): boolean {
  return !!value && relativeRangeSeconds(value) > 0;
}

/**
 * Resolves a relative range to absolute epoch millis, evaluated at call time.
 *
 * Deliberately not memoised and never computed during render: "last 2 days"
 * means two days before now, and now moves. Call it in the handler that builds
 * the request.
 */
export function relativeRangeToMillis(
  value: RelativeRangeValue
): { startTime: number; endTime: number } | null {
  const seconds = relativeRangeSeconds(value);
  if (seconds <= 0) return null;
  const endTime = Date.now();
  return { startTime: endTime - seconds * 1000, endTime };
}

/** A relative range as a chip label: `Last 2d 6h`. */
function relativeRangeLabel(value: RelativeRangeValue): string {
  const parts = RELATIVE_UNITS.flatMap((unit) => {
    const n = parseInt(value[unit.key] || "0", 10);
    return !n || Number.isNaN(n) ? [] : [`${n}${unit.key[0]}`];
  });
  return parts.length ? `Last ${parts.join(" ")}` : "";
}

export interface DateRangeFilterChipProps extends FilterChipControl {
  chipKey?: string;
  label?: string;
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  /**
   * Turns on the "Last…" tab beside the date range. Omit both and the chip is
   * absolute-only.
   *
   * The two modes are exclusive by construction: applying one clears the other,
   * because a range that is both "last 7 days" and "1–31 Jan" cannot be
   * honoured and nothing downstream should have to guess which half won.
   */
  relativeValue?: RelativeRangeValue;
  onRelativeChange?: (next: RelativeRangeValue) => void;
  /** Earliest / latest selectable date, `YYYY-MM-DD`. */
  min?: string;
  max?: string;
  /** Shown under the fields when a picked date falls outside `min`/`max`. */
  outOfRangeHint?: string;
  align?: "start" | "center" | "end";
}

/**
 * From / To, staged behind Apply. A half-filled range cannot be applied: an
 * open-ended date filter reads as a bug far more often than it is what someone
 * meant, and the disabled Apply says so without an error message.
 */
export function DateRangeFilterChip({
  chipKey = "date",
  label = "Date",
  value,
  onChange,
  relativeValue,
  onRelativeChange,
  min,
  max,
  outOfRangeHint,
  align = "start",
  open,
  onOpenChange,
}: DateRangeFilterChipProps) {
  const chip = useFilterChipState(chipKey, { open, onOpenChange });
  const [draft, setDraft] = useState<DateRangeValue>(value);
  const [relativeDraft, setRelativeDraft] = useState<RelativeRangeValue>(
    relativeValue ?? EMPTY_RELATIVE_RANGE
  );

  // The tab the panel opens on follows what is applied, so reopening a chip set
  // to "last 2 days" does not land on an empty date range.
  const supportsRelative = !!onRelativeChange;
  const [mode, setMode] = useState<"absolute" | "relative">(
    hasRelativeRange(relativeValue) ? "relative" : "absolute"
  );

  const relativeLabel = hasRelativeRange(relativeValue)
    ? relativeRangeLabel(relativeValue!)
    : "";
  const isActive = !!(value.from && value.to) || !!relativeLabel;
  const isPartial = !!draft.from !== !!draft.to;

  const outside = (d: string) => !!d && ((!!min && d < min) || (!!max && d > max));
  const outOfRange = outside(draft.from) || outside(draft.to);

  const emptyRange: DateRangeValue = { from: "", to: "" };
  const isRelative = supportsRelative && mode === "relative";

  // Applying one mode clears the other, so the applied value is never both a
  // duration and a pair of dates.
  const commit = (range: DateRangeValue, relative: RelativeRangeValue) => {
    onChange(range);
    onRelativeChange?.(relative);
    setDraft(range);
    setRelativeDraft(relative);
    chip.onOpenChange(false);
  };

  return (
    <FilterChip
      chipKey={chipKey}
      // The chip carries the applied span, not just the word "Date": it is in
      // the request, so it should be readable without opening anything.
      label={
        relativeLabel
          ? `${label}: ${relativeLabel}`
          : isActive
            ? `${label}: ${value.from} → ${value.to}`
            : label
      }
      active={isActive}
      align={align}
      open={chip.open}
      onOpenChange={chip.onOpenChange}
      onOpen={() => {
        setDraft(value);
        setRelativeDraft(relativeValue ?? EMPTY_RELATIVE_RANGE);
        setMode(hasRelativeRange(relativeValue) ? "relative" : "absolute");
      }}
      onClear={() => {
        onChange(emptyRange);
        onRelativeChange?.(EMPTY_RELATIVE_RANGE);
        setDraft(emptyRange);
        setRelativeDraft(EMPTY_RELATIVE_RANGE);
      }}
    >
      <div className="w-72 space-y-3 p-3">
        {supportsRelative ? (
          <Tabs value={mode} onValueChange={(v) => setMode(v as "absolute" | "relative")}>
            <TabsList className="w-full">
              <TabsTrigger value="absolute" className="flex-1">
                Date range
              </TabsTrigger>
              <TabsTrigger value="relative" className="flex-1">
                Last…
              </TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}

        {isRelative ? (
          <div className="grid grid-cols-2 gap-2">
            {RELATIVE_UNITS.map((unit) => (
              <label key={unit.key} className="space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">{unit.label}</span>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="0"
                  value={relativeDraft[unit.key]}
                  onChange={(e) =>
                    setRelativeDraft((prev) => ({ ...prev, [unit.key]: e.target.value }))
                  }
                  className="h-8 text-[12.5px]"
                />
              </label>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">From</p>
              <DatePicker
                value={draft.from}
                onChange={(v) => setDraft((d) => ({ ...d, from: v }))}
                min={min}
                max={max}
                placeholder="Select start date"
                className={DATE_CHIP_TRIGGER}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">To</p>
              <DatePicker
                value={draft.to}
                onChange={(v) => setDraft((d) => ({ ...d, to: v }))}
                min={draft.from || min}
                max={max}
                placeholder="Select end date"
                className={DATE_CHIP_TRIGGER}
              />
            </div>
            {isPartial ? (
              <p className="text-[11px] text-muted-foreground">Pick both ends of the range.</p>
            ) : null}
            {outOfRange && outOfRangeHint ? (
              <p className="text-[11px] text-destructive">{outOfRangeHint}</p>
            ) : null}
          </>
        )}
      </div>
      <FilterChipActions
        onClear={() => commit(emptyRange, EMPTY_RELATIVE_RANGE)}
        clearDisabled={
          !draft.from &&
          !draft.to &&
          !hasRelativeRange(relativeDraft) &&
          !value.from &&
          !value.to &&
          !relativeLabel
        }
        // A duration needs no dates; a date range needs both ends and must sit
        // inside the allowed window.
        applyDisabled={
          isRelative ? !hasRelativeRange(relativeDraft) : isPartial || outOfRange
        }
        onApply={() =>
          isRelative
            ? commit(emptyRange, relativeDraft)
            : commit(draft, EMPTY_RELATIVE_RANGE)
        }
      />
    </FilterChip>
  );
}

// ── Month-range chip ──────────────────────────────────────────────────────────

export interface MonthRange {
  /** Inclusive "YYYY-MM" bounds. Both ends compare as plain strings. */
  start: string;
  end: string;
}

/** A month index within a year → the "YYYY-MM" key the filter stores. */
const monthKey = (year: number, monthIndex: number) =>
  `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

const yearOf = (monthKeyValue: string) => Number(monthKeyValue.slice(0, 4));

/** Newest selected month's year, falling back to the range's last year. */
function startingYear(selected: string[], fallbackYear: number): number {
  if (selected.length === 0) return fallbackYear;
  const newest = [...selected].sort().reverse()[0];
  const parsed = yearOf(newest);
  return Number.isNaN(parsed) ? fallbackYear : parsed;
}

/**
 * Month RANGE chip: pick a start month and an end month on the same year grid.
 *
 * Distinct from MonthFilterChip below, which ticks an arbitrary SET of months.
 * A range is the right shape when the value is going into a request rather than
 * being matched client-side — a start/end pair is what a "from month, to month"
 * endpoint takes, and a set of months is not expressible in one.
 *
 * The value is never empty: a caller sending it to an API always has some window
 * in force, so "Reset" restores `defaultRange` rather than clearing to nothing,
 * and the chip renders the range it is on at all times. That is deliberate — a
 * filter that silently governs a request should say what it is set to, not read
 * as unset while quietly bounding every row on screen.
 *
 * Clicking cycles the way a date-range picker does: the first click starts a new
 * range, the second closes it, and a click before the open start moves the start
 * instead of making a backwards range.
 */
export function MonthRangeFilterChip({
  chipKey,
  label = "Period",
  bounds,
  value,
  defaultRange,
  monthsWithData,
  onChange,
}: {
  chipKey?: string;
  label?: string;
  /** The outer limits the grid lets the merchant navigate and pick within. */
  bounds: MonthRange;
  /** The range currently in force. Always set — see the note above. */
  value: MonthRange;
  /** What Reset goes back to, typically the window the page opens on. */
  defaultRange: MonthRange;
  /** Months with a row behind them, as "YYYY-MM". Drives the grid's dots. */
  monthsWithData: Set<string>;
  onChange: (next: MonthRange) => void;
}) {
  const chip = useFilterChipState(chipKey ?? label);
  const minYear = yearOf(bounds.start);
  const maxYear = yearOf(bounds.end);

  const [draft, setDraft] = useState<MonthRange>(value);
  /** Set once a start has been picked and the end is still open, so the next
   *  click closes the range instead of starting another one. */
  const [awaitingEnd, setAwaitingEnd] = useState(false);
  const [year, setYear] = useState(() => yearOf(value.end) || maxYear);

  // Always active: there is always a window in force.
  const isDefault = value.start === defaultRange.start && value.end === defaultRange.end;

  const pick = (month: string) => {
    if (!awaitingEnd) {
      setDraft({ start: month, end: month });
      setAwaitingEnd(true);
      return;
    }
    // A click before the open start moves the start rather than inverting the
    // range, which is what every date-range picker does and what a merchant
    // correcting an over-shot first click means.
    setDraft((prev) =>
      month < prev.start ? { start: month, end: prev.end } : { start: prev.start, end: month }
    );
    setAwaitingEnd(false);
  };

  const reset = () => {
    setDraft(defaultRange);
    setAwaitingEnd(false);
  };

  const summary = `${formatMonthLabel(draft.start)} – ${formatMonthLabel(draft.end)}`;

  return (
    <Popover
      open={chip.open}
      onOpenChange={(next) => {
        chip.onOpenChange(next);
        if (next) {
          setDraft(value);
          setAwaitingEnd(false);
          setYear(yearOf(value.end) || maxYear);
        }
      }}
    >
      <FilterChipShell active>
        <PopoverTrigger asChild>
          {/* The chip carries the range itself, not just the word "Period":
              this value is in the request body, so the merchant should be able
              to read what the table is bounded by without opening anything. */}
          <FilterChipLabelTrigger
            label={`${label}: ${formatMonthLabel(value.start)} – ${formatMonthLabel(value.end)}`}
            active
          />
        </PopoverTrigger>
      </FilterChipShell>
      <PopoverContent align="end" className="w-60 p-3" onCloseAutoFocus={chip.onCloseAutoFocus}>
        <div className="flex items-center justify-between">
          <IconButton
            aria-label="Previous year"
            variant="ghost"
            size="xs"
            disabled={year <= minYear}
            onClick={() => setYear((prev) => prev - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </IconButton>
          <span className="text-[12.5px] font-semibold text-foreground">{year}</span>
          <IconButton
            aria-label="Next year"
            variant="ghost"
            size="xs"
            disabled={year >= maxYear}
            onClick={() => setYear((prev) => prev + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </IconButton>
        </div>

        <div className="mt-2 grid grid-cols-4 gap-1">
          {MONTHS_SHORT.map((monthLabel, index) => {
            const monthValue = monthKey(year, index);
            // Plain string comparison: "YYYY-MM" sorts chronologically.
            const inBounds = monthValue >= bounds.start && monthValue <= bounds.end;
            const isEdge = monthValue === draft.start || monthValue === draft.end;
            const isBetween = monthValue > draft.start && monthValue < draft.end;
            const hasData = monthsWithData.has(monthValue);

            return (
              <Button
                key={monthValue}
                type="button"
                variant={isEdge ? "primary" : "ghost"}
                size="sm"
                disabled={!inBounds}
                aria-pressed={isEdge || isBetween}
                aria-label={`${monthLabel} ${year}${hasData ? ", has receipts" : ""}`}
                onClick={() => pick(monthValue)}
                className={cn(
                  "relative h-auto min-h-0 w-full justify-center rounded-md px-0 pb-2.5 pt-1.5 text-[12px]",
                  !isEdge && "text-foreground hover:bg-muted/60",
                  isBetween && "bg-primary/15 text-primary"
                )}
              >
                {monthLabel}
                {hasData && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full",
                      isEdge ? "bg-primary-foreground" : "bg-primary"
                    )}
                  />
                )}
              </Button>
            );
          })}
        </div>

        <p className="mt-2 truncate text-[11px] text-muted-foreground" title={summary}>
          {awaitingEnd ? `${formatMonthLabel(draft.start)} – pick an end month` : summary}
        </p>

        <Separator className="my-2" />

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<X className="h-3 w-3" />}
            onClick={reset}
            disabled={isDefault && draft.start === defaultRange.start && draft.end === defaultRange.end}
            className="text-muted-foreground hover:text-foreground"
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onChange(draft);
              chip.onOpenChange(false);
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Text chip ─────────────────────────────────────────────────────────────────

export interface TextFilterChipProps extends FilterChipControl {
  chipKey?: string;
  label?: string;
  value: string;
  onChange: (next: string) => void;
  /** Field label inside the panel. Defaults to `<label> contains`. */
  fieldLabel?: string;
  placeholder?: string;
  /** One line under the field — what the match actually does, typically. */
  hint?: string;
  /** Soft keyboard hint on touch devices. */
  inputMode?: "text" | "email" | "tel" | "numeric" | "url" | "search";
  align?: "start" | "center" | "end";
}

/**
 * One free-text value, staged behind Apply.
 *
 * Deliberately not a live-filtering input: this chip sits in a toolbar whose
 * other chips all commit on Apply, and a field that filtered as you typed would
 * be the one control on the row that behaves differently. Enter applies, so it
 * still costs one keystroke.
 *
 * The applied value is trimmed — a trailing space pasted in with an address is
 * not something the user meant to search for.
 */
export function TextFilterChip({
  chipKey,
  label = "Text",
  value,
  onChange,
  fieldLabel,
  placeholder,
  hint,
  inputMode = "text",
  align = "start",
  open,
  onOpenChange,
}: TextFilterChipProps) {
  const key = chipKey ?? label;
  const chip = useFilterChipState(key, { open, onOpenChange });
  const [draft, setDraft] = useState(value);

  const isActive = !!value.trim();
  const apply = () => {
    onChange(draft.trim());
    chip.onOpenChange(false);
  };

  return (
    <FilterChip
      chipKey={key}
      // The chip carries the value it is filtering on, so the toolbar can be
      // read without opening anything.
      label={isActive ? `${label}: ${value.trim()}` : label}
      active={isActive}
      align={align}
      open={chip.open}
      onOpenChange={chip.onOpenChange}
      onOpen={() => setDraft(value)}
      onClear={() => {
        onChange("");
        setDraft("");
      }}
    >
      <div className="w-64 space-y-1.5 p-3">
        <p className="text-[11px] font-medium text-muted-foreground">
          {fieldLabel ?? `${label} contains`}
        </p>
        <Input
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            apply();
          }}
          className="h-8 text-[12.5px]"
        />
        {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      </div>
      <FilterChipActions
        onClear={() => {
          onChange("");
          setDraft("");
          chip.onOpenChange(false);
        }}
        clearDisabled={!draft && !value}
        onApply={apply}
      />
    </FilterChip>
  );
}

// ── Number-range chip ─────────────────────────────────────────────────────────

export interface NumberRangeValue {
  min: string;
  max: string;
}

export interface NumberRangeFilterChipProps extends FilterChipControl {
  chipKey?: string;
  label?: string;
  value: NumberRangeValue;
  onChange: (next: NumberRangeValue) => void;
  /** Prefix inside each field — a currency symbol, typically. */
  prefix?: string;
  /** One line under the fields — what the bounds mean, or which field they match. */
  hint?: string;
  align?: "start" | "center" | "end";
}

/**
 * Min / Max, staged behind Apply. Unlike a date range, one end alone is a
 * perfectly ordinary request ("over ₹10,000"), so a half-filled range applies.
 */
export function NumberRangeFilterChip({
  chipKey = "amount",
  label = "Amount",
  value,
  onChange,
  prefix,
  hint,
  align = "start",
  open,
  onOpenChange,
}: NumberRangeFilterChipProps) {
  const chip = useFilterChipState(chipKey, { open, onOpenChange });
  const [draft, setDraft] = useState<NumberRangeValue>(value);
  const isActive = !!(value.min || value.max);
  const inverted = !!draft.min && !!draft.max && Number(draft.min) > Number(draft.max);

  return (
    <FilterChip
      chipKey={chipKey}
      label={label}
      active={isActive}
      align={align}
      open={chip.open}
      onOpenChange={chip.onOpenChange}
      onOpen={() => setDraft(value)}
      onClear={() => {
        onChange({ min: "", max: "" });
        setDraft({ min: "", max: "" });
      }}
    >
      <div className="w-56 space-y-3 p-3">
        {(["min", "max"] as const).map((end) => (
          <label key={end} className="block space-y-1">
            <span className="text-[11px] font-medium capitalize text-muted-foreground">{end}</span>
            <div className="relative">
              {prefix ? (
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[12.5px] text-muted-foreground">
                  {prefix}
                </span>
              ) : null}
              <Input
                type="number"
                inputMode="decimal"
                value={draft[end]}
                onChange={(e) => setDraft((d) => ({ ...d, [end]: e.target.value }))}
                className={cn("h-8 text-[12.5px]", prefix && "pl-6")}
              />
            </div>
          </label>
        ))}
        {inverted ? (
          <p className="text-[11px] text-destructive">Min must not exceed max.</p>
        ) : hint ? (
          <p className="text-[11px] text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      <FilterChipActions
        onClear={() => {
          const empty = { min: "", max: "" };
          onChange(empty);
          setDraft(empty);
          chip.onOpenChange(false);
        }}
        clearDisabled={!draft.min && !draft.max && !value.min && !value.max}
        applyDisabled={inverted}
        onApply={() => {
          onChange(draft);
          chip.onOpenChange(false);
        }}
      />
    </FilterChip>
  );
}

// ── Add-filter menu ───────────────────────────────────────────────────────────

export interface AddFilterDefinition {
  key: string;
  label: string;
  /**
   * The values this filter accepts, so the search can match them directly.
   * Omit for a filter whose values are not a list — a date or amount range —
   * and it will still be findable by name.
   */
  options?: FilterChipOption[];
  /** How many values are currently applied. Drives the count beside the name. */
  activeCount?: number;
}

export interface AddFilterMenuProps extends FilterChipControl {
  chipKey?: string;
  /** Every filter this toolbar can offer, including ones already shown. */
  filters: AddFilterDefinition[];
  /** Keys already on screen as their own chip. */
  visibleKeys?: string[];
  /** Reveal a filter as its own chip. */
  onAddFilter: (key: string) => void;
  /**
   * Take a filter back out of the toolbar. Omit and a shown filter is simply
   * marked as shown; supply it and the row becomes a toggle.
   *
   * Removing must also clear whatever that filter had selected — a filter that
   * is still narrowing the table from somewhere the user cannot see it is worse
   * than one they have to scroll to.
   */
  onRemoveFilter?: (key: string) => void;
  /** Apply a value picked straight out of the search results. */
  onSelectValue?: (filterKey: string, value: string) => void;
  label?: string;
  align?: "start" | "center" | "end";
}

type MenuRow =
  | { kind: "heading"; id: string; text: string }
  | { kind: "filter"; id: string; filter: AddFilterDefinition }
  | { kind: "value"; id: string; filter: AddFilterDefinition; option: FilterChipOption };

/**
 * "Filter" — a searchable way to reach every filter a table has, instead of a
 * second-class drawer of leftovers.
 *
 * Two things it does that a nested accordion of checkbox groups does not.
 * Typing searches filter **names and their values at once**, so someone who
 * knows they want "USD" finds it without first knowing it lives under
 * Currency. And choosing anything here promotes that filter to a real chip in
 * the toolbar, so there is exactly one place a filter can be — beside its
 * peers — rather than some being chips and some being hidden rows.
 *
 * That also means the toolbar scales: a table with twenty filters shows the
 * three or four in use and keeps the rest one keystroke away.
 */
export function AddFilterMenu({
  chipKey = "__add-filter",
  filters,
  visibleKeys = [],
  onAddFilter,
  onRemoveFilter,
  onSelectValue,
  label = "Filter",
  align = "start",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddFilterMenuProps) {
  const { open, onOpenChange, onCloseAutoFocus } = useFilterChipState(chipKey, {
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
  });

  const [query, setQuery] = useState("");
  /** Raw highlight index; `cursor` below is this clamped to a real row. */
  const [storedCursor, setCursor] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();

  const q = query.trim().toLowerCase();

  /**
   * The flat row list the keyboard walks. Headings are in it so the rendered
   * order and the keyboard order cannot drift; they are skipped when moving.
   */
  const rows = useMemo<MenuRow[]>(() => {
    const out: MenuRow[] = [];

    if (q) {
      // Values first: someone who typed "usd" wants the value, and having to
      // step past the field that contains it is the slower of the two orders.
      const valueMatches = filters.flatMap((f) =>
        (f.options ?? [])
          .filter((o) => o.label.toLowerCase().includes(q))
          .map((option) => ({ filter: f, option }))
      );
      if (valueMatches.length && onSelectValue) {
        out.push({ kind: "heading", id: "h-values", text: "Values" });
        for (const { filter, option } of valueMatches.slice(0, 20)) {
          out.push({
            kind: "value",
            id: `v-${filter.key}-${option.value}`,
            filter,
            option,
          });
        }
      }

      const nameMatches = filters.filter((f) => f.label.toLowerCase().includes(q));
      if (nameMatches.length) {
        out.push({ kind: "heading", id: "h-fields", text: "Filters" });
        for (const filter of nameMatches) {
          out.push({ kind: "filter", id: `f-${filter.key}`, filter });
        }
      }
      return out;
    }

    // Resting state: every filter, with the ones already on screen marked so
    // the menu doubles as a map of what the toolbar is currently showing.
    out.push({
      kind: "heading",
      id: "h-all",
      text: onRemoveFilter ? "Show filters" : "All filters",
    });
    for (const filter of filters) {
      out.push({ kind: "filter", id: `f-${filter.key}`, filter });
    }
    return out;
  }, [filters, q, onSelectValue, onRemoveFilter]);

  const selectable = useMemo(
    () => rows.map((r, i) => (r.kind === "heading" ? -1 : i)).filter((i) => i >= 0),
    [rows]
  );

  /**
   * The highlighted row, clamped to something that actually exists.
   *
   * Derived rather than corrected in an effect. A new query rebuilds `rows`, so
   * the stored index can now point at a heading, at a row that has gone, or
   * past the end — and an effect that reset it would have to depend on the
   * rebuilt array, which is a new identity on every parent render. That effect
   * would then fight the arrow keys, snapping the highlight back to the first
   * row each time the parent happened to re-render. Deriving it cannot.
   */
  const cursor = selectable.includes(storedCursor) ? storedCursor : (selectable[0] ?? -1);

  /** Keeps the highlighted row inside the scroll viewport. */
  useEffect(() => {
    if (cursor < 0) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-row-index="${cursor}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const choose = (row: MenuRow) => {
    if (row.kind === "value") {
      onSelectValue?.(row.filter.key, row.option.value);
      // The filter it belongs to becomes a chip, so the applied value is
      // visible and removable in the same place as every other filter.
      onAddFilter(row.filter.key);
      // A value is a decision: close, so the chip it just created is visible.
      onOpenChange(false);
      setQuery("");
      return;
    }

    if (row.kind !== "filter") return;

    // A filter row is a toggle, and the menu stays open for it — turning three
    // filters on is one visit, not three. Only picking a value closes.
    if (onRemoveFilter && visibleKeys.includes(row.filter.key)) {
      onRemoveFilter(row.filter.key);
    } else {
      onAddFilter(row.filter.key);
      if (!onRemoveFilter) {
        // Without a remove handler the row is not a toggle, so there is nothing
        // to come back for.
        onOpenChange(false);
        setQuery("");
      }
    }
  };

  const moveCursor = (delta: number) => {
    if (!selectable.length) return;
    const at = selectable.indexOf(cursor);
    const next = selectable[(at + delta + selectable.length) % selectable.length];
    setCursor(next);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveCursor(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveCursor(-1);
    } else if (e.key === "Enter") {
      const row = rows[cursor];
      if (!row || row.kind === "heading") return;
      e.preventDefault();
      choose(row);
    }
  };

  const activeCount = filters.filter((f) => (f.activeCount ?? 0) > 0).length;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) setQuery("");
      }}
    >
      <FilterChipShell active={false}>
        <PopoverTrigger asChild>
          <FilterChipLabelTrigger
            label={label}
            active={false}
            rightIcon={<SlidersHorizontal className="h-3 w-3" />}
            aria-label={
              activeCount > 0 ? `${label}. ${activeCount} filters applied.` : label
            }
          />
        </PopoverTrigger>
      </FilterChipShell>

      <PopoverContent
        align={align}
        className={cn("w-72 p-0", POPOVER_FIT)}
        onKeyDown={onKeyDown}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3">
          <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search filters and values"
            aria-controls={listId}
            aria-activedescendant={cursor >= 0 ? `${listId}-${cursor}` : undefined}
            className="h-full flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div
          ref={listRef}
          id={listId}
          role="listbox"
          className={cn("max-h-80 p-1", FILTER_SCROLL_AREA)}
        >
          {rows.length === 0 ? (
            <p className="px-2 py-6 text-center text-[12.5px] text-muted-foreground">
              Nothing matches “{query}”.
            </p>
          ) : (
            rows.map((row, i) =>
              row.kind === "heading" ? (
                <div
                  key={row.id}
                  className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {row.text}
                </div>
              ) : (
                <div
                  key={row.id}
                  id={`${listId}-${i}`}
                  data-row-index={i}
                  role="option"
                  aria-selected={i === cursor}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => choose(row)}
                  className={cn(
                    "flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-foreground",
                    i === cursor && "bg-muted"
                  )}
                >
                  {row.kind === "value" ? (
                    <>
                      {row.option.icon}
                      <span className="min-w-0 flex-1 truncate">{row.option.label}</span>
                      {/* Names the field the value belongs to: "USD" alone is
                          ambiguous when two filters both take currencies. */}
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {row.filter.label}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="min-w-0 flex-1 truncate">{row.filter.label}</span>
                      {row.filter.activeCount ? (
                        <span className="shrink-0 rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold tabular-nums text-primary">
                          {row.filter.activeCount}
                        </span>
                      ) : null}
                      {visibleKeys.includes(row.filter.key) ? (
                        <Check
                          aria-label="Shown in the toolbar"
                          className="h-3.5 w-3.5 shrink-0 text-primary"
                        />
                      ) : null}
                    </>
                  )}
                </div>
              )
            )
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────────

/**
 * The row a table's filters live in: search at the left, chips beside it,
 * actions pinned right.
 *
 * Search and chips share one wrapping flex, so a chip that does not fit wraps
 * to the next line starting **under the search box** — a toolbar with three
 * filters is one line, one with eight grows a second, and nothing is ever
 * scrolled out of sight. Giving each group its own box instead would wrap the
 * chips inside their own column and leave a ragged left edge.
 *
 * Wraps its chips in a {@link FilterChipGroup}, so a toolbar built with it gets
 * the one-open-at-a-time behaviour without opting in.
 */
export function FilterToolbar({
  search,
  chips,
  actions,
  className,
}: {
  search?: ReactNode;
  chips?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    // `items-start` keeps the actions level with the FIRST line once the chips
    // wrap onto a second.
    <div className={cn("flex items-start gap-2", className)}>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {search}
        {/* `contents` so the group adds no box of its own: the chips become
            direct children of the wrapping flex and can break between lines. */}
        {chips ? <FilterChipGroup className="contents">{chips}</FilterChipGroup> : null}
      </div>
      {actions ? (
        <div className="flex min-h-8 shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

/**
 * The pill action button that sits at the right of a table toolbar — Refresh,
 * Columns, Export, Report.
 *
 * It exists because `Button size="sm"` is `h-9`, which towers over the chips
 * beside it; every toolbar that wanted a level row was overriding the same four
 * classes by hand. Having it here means a toolbar's actions match its chips
 * without each one rediscovering that.
 */
export function ToolbarButton({ className, ...props }: ComponentPropsWithoutRef<typeof Button>) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "h-auto min-h-0 shrink-0 py-1 text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    />
  );
}
