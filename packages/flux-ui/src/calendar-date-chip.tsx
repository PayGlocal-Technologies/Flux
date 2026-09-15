"use client";

import { useState } from "react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { FilterChip, FilterChipActions, useFilterChipState } from "./filter-chips";
import type { FilterChipControl } from "./filter-chips";
import { formatDateOnly, parseApiDate } from "./format-datetime";
import { cn } from "./utils";

export type DatePickMode = "single" | "range";

/** What the calendar hands back while the user is picking. */
export type CalendarRange = { from: Date | undefined; to?: Date | undefined };

/**
 * A named span offered above the calendar — "Today", "Last 30 Days".
 *
 * `resolve` runs when the preset is chosen, not when it is declared, so "last
 * 7 days" is counted from the day the user picks it rather than from whenever
 * the options array happened to be built.
 */
export interface CalendarDatePreset {
  value: string;
  label: string;
  resolve: () => { from: string; to: string };
}

/**
 * The applied value: a span, plus which preset produced it.
 *
 * `preset` is `""` when the dates were picked by hand, and `to` equals `from`
 * for a single day — so a caller that only wants a window can read `from`/`to`
 * and ignore the rest.
 */
export interface CalendarDateValue {
  preset: string;
  /** YYYY-MM-DD */
  from: string;
  /** YYYY-MM-DD */
  to: string;
}

export interface CalendarDateFilterChipProps extends FilterChipControl {
  chipKey?: string;
  label?: string;
  value?: CalendarDateValue;
  onChange: (next: CalendarDateValue | undefined) => void;
  /** Named spans above the calendar. Omit for a calendar-only chip. */
  presets?: readonly CalendarDatePreset[];
  /** Offer "Single date" alongside "Date range". Default true. */
  allowSingle?: boolean;
  /** Months shown side by side in range mode. Default 2. */
  numberOfMonths?: number;
  align?: "start" | "center" | "end";
}

const PICK_MODES: { value: DatePickMode; label: string }[] = [
  { value: "single", label: "Single date" },
  { value: "range", label: "Date range" },
];

const toKey = (d: Date): string => {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

const fromKey = (key: string): Date | undefined => parseApiDate(key) ?? undefined;

/**
 * A date filter over a real calendar, with optional named spans.
 *
 * Distinct from {@link DateRangeFilterChip}, which is two typed date fields.
 * This one is for a filter people reach for by *looking* — "the week of the
 * 14th", "that Tuesday" — where a pair of text inputs makes you count days in
 * your head. Both exist because both are right somewhere, and picking between
 * them is a call about the filter, not about the toolbar.
 *
 * Five features in pg-dashboard-v2 had built this chip separately, each with
 * its own preset list and its own value shape. They are the same control.
 */
export function CalendarDateFilterChip({
  chipKey,
  label = "Date",
  value,
  onChange,
  presets,
  allowSingle = true,
  numberOfMonths = 2,
  align = "start",
  open,
  onOpenChange,
}: CalendarDateFilterChipProps) {
  const key = chipKey ?? label;
  const chip = useFilterChipState(key, { open, onOpenChange });

  const [mode, setMode] = useState<DatePickMode>("single");
  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined);
  const [range, setRange] = useState<CalendarRange | undefined>(undefined);
  // A preset and a hand-picked span are the same filter reached two ways, so
  // choosing one clears the other rather than leaving both staged.
  const [presetDraft, setPresetDraft] = useState("");

  const activePreset = presets?.find((p) => p.value === value?.preset);
  const isActive = !!value?.from;

  const chipLabel = !isActive
    ? label
    : activePreset
      ? `${label}: ${activePreset.label}`
      : value!.to && value!.to !== value!.from
        ? `${label}: ${formatDateOnly(fromKey(value!.from)!)} – ${formatDateOnly(fromKey(value!.to)!)}`
        : `${label}: ${formatDateOnly(fromKey(value!.from)!)}`;

  /** Reseeds the working selection from what is applied, on every open. */
  const reseed = () => {
    setPresetDraft(value?.preset ?? "");
    const from = value?.from ? fromKey(value.from) : undefined;
    const to = value?.to ? fromKey(value.to) : undefined;
    const isSpan = !!value?.to && value.to !== value.from;
    setMode(isSpan || !allowSingle ? "range" : "single");
    setSingleDate(isSpan ? undefined : from);
    setRange(isSpan ? { from, to } : undefined);
  };

  const clear = () => {
    onChange(undefined);
    setPresetDraft("");
    setSingleDate(undefined);
    setRange(undefined);
    setMode(allowSingle ? "single" : "range");
  };

  const apply = () => {
    if (presetDraft) {
      const chosen = presets?.find((p) => p.value === presetDraft);
      if (chosen) {
        const span = chosen.resolve();
        onChange({ preset: chosen.value, ...span });
      }
    } else if (mode === "single" && singleDate) {
      const k = toKey(singleDate);
      onChange({ preset: "", from: k, to: k });
    } else if (mode === "range" && range?.from) {
      const to = range.to ?? range.from;
      onChange({ preset: "", from: toKey(range.from), to: toKey(to) });
    } else {
      onChange(undefined);
    }
    chip.onOpenChange(false);
  };

  const hasDraft = !!presetDraft || !!singleDate || !!range?.from;

  return (
    <FilterChip
      chipKey={key}
      label={chipLabel}
      active={isActive}
      align={align}
      open={chip.open}
      onOpenChange={chip.onOpenChange}
      onOpen={reseed}
      onClear={clear}
    >
      <div className="w-auto p-3">
        {presets?.length ? (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <Button
                key={p.value}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const next = presetDraft === p.value ? "" : p.value;
                  setPresetDraft(next);
                  // Picking a named span drops whatever was on the calendar,
                  // so the panel never shows two answers at once.
                  if (next) {
                    setSingleDate(undefined);
                    setRange(undefined);
                  }
                }}
                className={cn(
                  "h-auto min-h-0 rounded-full border px-2.5 py-1 text-[11.5px] font-normal",
                  presetDraft === p.value
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </Button>
            ))}
          </div>
        ) : null}

        {allowSingle ? (
          <div className="mb-3 flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
            {PICK_MODES.map((m) => (
              <Button
                key={m.value}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMode(m.value)}
                className={cn(
                  "h-auto min-h-0 flex-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium",
                  mode === m.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m.label}
              </Button>
            ))}
          </div>
        ) : null}

        {/* `bg-transparent p-0`: Calendar paints `bg-background` on itself and
            only drops it via a `[[data-slot=popover-content]_&]` selector that
            PopoverContent never sets. Left alone it renders the page's
            off-white as a solid block inside the white popover, with its own
            `p-3` on top of the popover's — a greyed, inset panel that reads as
            disabled. */}
        {mode === "single" && allowSingle ? (
          <Calendar
            mode="single"
            selected={singleDate}
            onSelect={(d) => {
              setSingleDate(d);
              setPresetDraft("");
            }}
            className="bg-transparent p-0"
          />
        ) : (
          <Calendar
            mode="range"
            selected={range}
            onSelect={(r) => {
              setRange(r);
              setPresetDraft("");
            }}
            numberOfMonths={numberOfMonths}
            className="bg-transparent p-0"
          />
        )}
      </div>

      <FilterChipActions
        onClear={() => {
          clear();
          chip.onOpenChange(false);
        }}
        clearDisabled={!hasDraft && !isActive}
        applyDisabled={!hasDraft}
        onApply={apply}
      />
    </FilterChip>
  );
}
