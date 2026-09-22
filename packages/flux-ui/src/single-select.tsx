"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "./utils";
import { filterOptions, type OptionFilter } from "./option-filter";
import { ScrollLockTakeover } from "./scroll-lock";

export interface SingleSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Optional leading glyph — a flag, a brand mark, a status dot. */
  icon?: React.ReactNode;
}

export interface SingleSelectProps {
  /** Put on the trigger, so a `FieldLabel`'s `htmlFor` can point at it. */
  id?: string;
  options: SingleSelectOption[];
  /** The chosen value, or "" for none. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /**
   * Show a search box above the list. Left unset it appears once there are
   * `searchThreshold` options — a search field over three items is noise, and
   * remembering to pass the flag is how two lists of the same length end up
   * behaving differently.
   */
  showSearch?: boolean;
  /** How many options before the search box appears on its own. Default 8. */
  searchThreshold?: number;
  /** Placeholder inside that search box. Default "Search...". */
  searchPlaceholder?: string;
  /**
   * Replaces the default match (label or value, case-insensitive) — for a list
   * that has to be findable by something the row does not display, such as a
   * currency's full name behind a symbol.
   */
  filterOption?: OptionFilter<SingleSelectOption>;
  /** Adds a "Clear" row so a chosen value can be taken back to "". */
  clearable?: boolean;
  /** Line shown when the list is empty. Default "No options found.". */
  emptyText?: string;
  disabled?: boolean;
  /** Marks the field as failing validation, matching `Input`'s aria-invalid styling. */
  invalid?: boolean;
  className?: string;
}

/**
 * One-of-many as a **form field** — the single-value counterpart to
 * {@link CheckboxSelect}, with the same trigger, popover and search.
 *
 * Radix `Select` cannot host a text input (its own typeahead owns the
 * keystrokes), so a searchable single select has to be a popover over a
 * listbox. Before this existed, every screen needing one built that popover
 * itself, which is how a design system ends up with four dropdowns that filter
 * differently. `SingleSelectFilterChip` remains the toolbar form of the same
 * idea; this is the one that sits in a form, under a `FieldLabel`.
 */
const SingleSelect = React.forwardRef<HTMLButtonElement, SingleSelectProps>(
  (
    {
      id,
      options,
      value,
      onChange,
      placeholder = "Select an option",
      showSearch,
      searchThreshold = 8,
      searchPlaceholder = "Search...",
      filterOption,
      clearable = false,
      emptyText = "No options found.",
      disabled = false,
      invalid = false,
      className,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const searchRef = React.useRef<HTMLInputElement>(null);

    const searchable = showSearch ?? options.length >= searchThreshold;

    const filtered = React.useMemo(
      () => (searchable ? filterOptions(options, search, filterOption) : options),
      [options, search, filterOption, searchable]
    );

    const selected = options.find((o) => o.value === value);

    function close() {
      setOpen(false);
      // Dropped on close so the next open starts from the whole list rather
      // than yesterday's query.
      setSearch("");
    }

    function pick(next: string) {
      onChange(next);
      close();
    }

    return (
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : close())}
      >
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            id={id}
            type="button"
            disabled={disabled}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-invalid={invalid || undefined}
            className={cn(
              "flex h-11 w-full items-center justify-between gap-2.5 rounded-lg border border-border bg-card px-4 py-2 text-[15px] shadow-sm outline-none",
              "transition-colors duration-pg-fast ease-pg-standard",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
              "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25 dark:aria-invalid:ring-destructive/40",
              "disabled:cursor-not-allowed disabled:opacity-50",
              selected ? "text-foreground" : "text-muted-foreground",
              className
            )}
          >
            <span className="flex min-w-0 items-center gap-2 truncate">
              {selected?.icon}
              <span className="truncate">{selected?.label ?? placeholder}</span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground opacity-70 transition-transform duration-pg-fast ease-pg-standard",
                open && "rotate-180"
              )}
            />
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          {/* Takes over the scroll lock when this opens inside a Dialog or
              Drawer, so the list can be scrolled. See `scroll-lock.tsx`. */}
          <ScrollLockTakeover>
            <PopoverPrimitive.Content
              align="start"
              sideOffset={6}
              collisionPadding={8}
              className={cn(
                "z-[120] min-w-[var(--radix-popover-trigger-width)] w-full rounded-xl border border-border bg-popover text-popover-foreground shadow-lg outline-none p-1",
                "data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-150"
              )}
            >
              {searchable && (
                <div className="relative mb-1 px-1 pt-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    className={cn(
                      "flex h-9 w-full rounded-md border border-border bg-card pl-8 pr-3 text-sm shadow-sm placeholder:text-muted-foreground",
                      "transition-colors duration-pg-fast ease-pg-standard",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
                    )}
                  />
                </div>
              )}

              {clearable && value !== "" && (
                <>
                  <button
                    type="button"
                    onClick={() => pick("")}
                    className="w-full rounded-md px-3 py-1.5 text-left text-xs font-medium text-muted-foreground transition-colors duration-pg-fast ease-pg-standard hover:bg-muted hover:text-foreground"
                  >
                    Clear
                  </button>
                  <div className="my-0.5 h-px bg-border mx-1" />
                </>
              )}

              {/* Capped by the room the popover has, so a long list near the
                  bottom of a dialog scrolls rather than running off-screen. */}
              <div
                role="listbox"
                className="overflow-y-auto overscroll-contain py-0.5 max-h-[min(15rem,var(--radix-popover-content-available-height,15rem))]"
              >
                {filtered.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    {emptyText}
                  </div>
                ) : (
                  filtered.map((option) => {
                    const isSelected = option.value === value;
                    return (
                      <div
                        key={option.value}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled}
                        onClick={() => !option.disabled && pick(option.value)}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm select-none",
                          "transition-colors duration-pg-fast ease-pg-standard",
                          option.disabled
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer hover:bg-muted",
                          isSelected && "bg-muted"
                        )}
                      >
                        {option.icon}
                        <span className="min-w-0 flex-1 truncate leading-none">{option.label}</span>
                        {isSelected && <Check className="size-3.5 shrink-0 text-primary" strokeWidth={3} />}
                      </div>
                    );
                  })
                )}
              </div>
            </PopoverPrimitive.Content>
          </ScrollLockTakeover>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }
);

SingleSelect.displayName = "SingleSelect";

export { SingleSelect };
