"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { RemoveScroll } from "react-remove-scroll";
import { ChevronLeft, ChevronRight, ChevronDown, CalendarDays } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "./utils";
import { ScrollLockTakeover } from "./scroll-lock";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const PRIMARY = "#0061E3";

/** Width of the calendar half. The time columns are added to it. */
const CALENDAR_W = 296;
const TIME_COL_W = 58;
/** One row in a time column. */
const TIME_ITEM_H = 28;
/** Visible height of a time column, sized to sit flush with the day grid. */
const TIME_COL_H = 232;

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDayOf(y: number, m: number)  { return new Date(y, m, 1).getDay(); }
function pad(n: number) { return String(n).padStart(2, "0"); }

/**
 * A parsed picker value. `hh`/`mm`/`ss` are the 24-hour clock, and are 0 for a
 * date-only value — a value carrying no time is "midnight", the same reading
 * antd gives it.
 */
interface Parts { y: number; m: number; d: number; hh: number; mm: number; ss: number }

/**
 * Accepts `YYYY-MM-DD`, `YYYY-MM-DD HH:mm` and `YYYY-MM-DD HH:mm:ss`, so a
 * picker switched to `showTime` still reads back a value written before it was,
 * and `min`/`max` can be given as plain dates whatever the value carries.
 */
function parseValue(s: string): Parts | null {
  if (!s) return null;
  const [datePart, timePart = ""] = s.trim().split(/[ T]/);
  const [y, m, d] = datePart.split("-").map(Number);
  if (!y || !m || !d) return null;
  const [hh = 0, mm = 0, ss = 0] = timePart ? timePart.split(":").map(Number) : [];
  return {
    y,
    m: m - 1,
    d,
    hh: Number.isFinite(hh) ? hh : 0,
    mm: Number.isFinite(mm) ? mm : 0,
    ss: Number.isFinite(ss) ? ss : 0,
  };
}

/** Kept as the old name so nothing that imported it has to change. */
function parseYMD(s: string) {
  const p = parseValue(s);
  return p ? { y: p.y, m: p.m, d: p.d } : null;
}

function toYMD(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

/**
 * The string this picker emits. Date-only unless a time is being shown, so a
 * picker without `showTime` keeps emitting exactly what it always did.
 */
function formatValue(p: Parts, showTime: boolean, showSecond: boolean) {
  const date = toYMD(p.y, p.m, p.d);
  if (!showTime) return date;
  return showSecond
    ? `${date} ${pad(p.hh)}:${pad(p.mm)}:${pad(p.ss)}`
    : `${date} ${pad(p.hh)}:${pad(p.mm)}`;
}

/** 12-hour, to match every other timestamp flux renders. */
function displayTime(p: Parts, showSecond: boolean) {
  const period = p.hh < 12 ? "AM" : "PM";
  const h12 = p.hh % 12 === 0 ? 12 : p.hh % 12;
  const base = showSecond
    ? `${pad(h12)}:${pad(p.mm)}:${pad(p.ss)}`
    : `${pad(h12)}:${pad(p.mm)}`;
  return `${base} ${period}`;
}

function displayValue(value: string, showTime: boolean, showSecond: boolean) {
  const p = parseValue(value);
  if (!p) return "";
  const date = `${pad(p.d)} ${MONTHS[p.m].slice(0, 3)} ${p.y}`;
  return showTime ? `${date}, ${displayTime(p, showSecond)}` : date;
}

/** `1`, or a step floored to at least 1 — a step of 0 would loop forever. */
function step(n: number | undefined) {
  return Math.max(1, Math.floor(n ?? 1));
}

/* ─── Props ─────────────────────────────────────────────────────────────── */

/**
 * `showTime`'s options, following antd's prop of the same name.
 *
 * Two defaults differ from antd's, both because of what flux renders elsewhere:
 * `use12Hours` is **on** (antd defaults it off) because `formatDateTime` prints
 * every timestamp in this library with `hour12`, and entering "23:55" to read it
 * back as "11:55 PM" is the mismatch that makes a reviewer check a row twice;
 * and `showSecond` is **off** (antd defaults it on) because nothing in flux
 * records a second.
 */
export interface DatePickerTimeOptions {
  /** Hour column is 12-hour with an AM/PM column beside it. Default `true`. */
  use12Hours?: boolean;
  /** Add a seconds column, and put seconds in the emitted value. Default `false`. */
  showSecond?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  /** `HH:mm[:ss]` used when a day is picked before any time. Default `"00:00"`. */
  defaultValue?: string;
}

interface DatePickerProps {
  /**
   * `YYYY-MM-DD`, or `YYYY-MM-DD HH:mm` (`HH:mm:ss` with `showSecond`) when
   * `showTime` is set — the same widening antd does to its value when a time is
   * shown.
   */
  value:        string;
  onChange:     (v: string) => void;
  placeholder?: string;
  className?:   string;
  /** Earliest selectable date, `YYYY-MM-DD`. Days before it are struck out. */
  min?:         string;
  /**
   * Latest selectable date, `YYYY-MM-DD`.
   *
   * Its absence is why a feature ended up hand-rolling a whole date chip to
   * enforce an upper bound on Apply instead — an error after the fact, where
   * the calendar could have said so before the click.
   */
  max?:         string;
  label?:       string;
  /**
   * Put time columns beside the calendar, so a day and the time on it are one
   * control rather than two fields that can disagree.
   *
   * Follows antd: the panel gains Hr / Min (/ Sec) (/ AM-PM) columns and a
   * footer, picking a day no longer closes the panel, and **OK** is what
   * commits. `onChange` still fires on every edit — OK closes, it does not
   * gate the value — so a controlled caller sees each change as it happens.
   */
  showTime?:    boolean | DatePickerTimeOptions;
  /**
   * antd's `showNow`: the "Now" shortcut in the footer. Default `true` when a
   * time is shown, and ignored otherwise.
   */
  showNow?:     boolean;
}

/* ─── Time column ────────────────────────────────────────────────────────── */

/**
 * One scrollable unit column.
 *
 * The selected row is scrolled to the **top** rather than centred, which is
 * antd's behaviour and the reason each column is padded underneath: without the
 * padding the last few values can never reach the top and look unreachable.
 */
function TimeColumn<T extends string | number>({
  label,
  items,
  selected,
  onSelect,
  render,
}: {
  label: string;
  items: T[];
  selected: T;
  onSelect: (item: T) => void;
  render?: (item: T) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const index = items.indexOf(selected);

  // Scrolled with the panel's own layout effect timing rather than on every
  // render: a click that lands mid-scroll would otherwise fight the animation.
  useEffect(() => {
    const el = ref.current;
    if (!el || index < 0) return;
    el.scrollTo({ top: index * TIME_ITEM_H, behavior: "smooth" });
  }, [index]);

  return (
    <div className="flex flex-col border-l border-border" style={{ width: TIME_COL_W }}>
      <div className="py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </div>
      <div
        ref={ref}
        className="overflow-y-auto"
        style={{ height: TIME_COL_H, scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => {
          const active = item === selected;
          return (
            <button
              key={String(item)}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "flex w-full items-center justify-center rounded-md text-[13px] font-medium transition-colors",
                active
                  ? "font-semibold text-white"
                  : "text-foreground hover:bg-muted",
              )}
              style={{ height: TIME_ITEM_H, background: active ? PRIMARY : undefined }}
            >
              {render ? render(item) : String(item)}
            </button>
          );
        })}
        {/* Lets the final value reach the top of the column. */}
        <div style={{ height: TIME_COL_H - TIME_ITEM_H }} />
      </div>
    </div>
  );
}

/* ─── DatePicker ─────────────────────────────────────────────────────────── */
export function DatePicker({ value, onChange, placeholder = "Select date", className, min, max, label, showTime = false, showNow = true }: DatePickerProps) {
  const today   = new Date();
  const parsed  = parseValue(value);

  const timeOptions: DatePickerTimeOptions = useMemo(
    () => (typeof showTime === "object" ? showTime : {}),
    [showTime]
  );
  const withTime   = showTime !== false && showTime !== undefined;
  const use12Hours = timeOptions.use12Hours ?? true;
  const showSecond = timeOptions.showSecond ?? false;

  const [open,      setOpen]      = useState(false);
  const [panelPos,  setPanelPos]  = useState({ top: 0, left: 0 });
  const [viewYear,  setViewYear]  = useState(parsed?.y  ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.m  ?? today.getMonth());
  const [yearMenu,  setYearMenu]  = useState(false);
  const [monthMenu, setMonthMenu] = useState(false);
  const [mounted,   setMounted]   = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  /* Sync view when value changes */
  useEffect(() => {
    if (parsed) { setViewYear(parsed.y); setViewMonth(parsed.m); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  /* ── Panel size, which the time columns widen ── */
  const columnCount = withTime ? (showSecond ? 3 : 2) + (use12Hours ? 1 : 0) : 0;
  const PANEL_W = CALENDAR_W + columnCount * TIME_COL_W;
  // Calendar body, plus the footer that only exists when a time is shown.
  const PANEL_H = withTime ? 392 : 340;

  /* Compute fixed position from trigger rect */
  function openPanel() {
    if (!triggerRef.current) return;
    const trigger = triggerRef.current;
    const vw     = window.innerWidth;
    const vh     = window.innerHeight;

    // Scroll trigger into view so panel can appear next to it (avoids panel far from input in scrollable forms)
    trigger.scrollIntoView({ block: "center", behavior: "auto" });

    requestAnimationFrame(() => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();

      // Horizontal: align left edge, clamp so it doesn't go off screen
      let left = rect.left;
      if (left + PANEL_W > vw - 8) left = vw - PANEL_W - 8;
      if (left < 8) left = 8;

      // Vertical: prefer below trigger; if not enough room open above
      let top = rect.bottom + 6;
      if (top + PANEL_H > vh - 8) top = rect.top - PANEL_H - 6;
      if (top < 8) top = 8;

      setPanelPos({ top, left });
      setOpen(true);
    });
  }

  function closePanel() {
    setOpen(false); setYearMenu(false); setMonthMenu(false);
  }

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      const inTrigger = triggerRef.current?.contains(e.target as Node);
      const inPanel   = panelRef.current?.contains(e.target as Node);
      if (!inTrigger && !inPanel) closePanel();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Navigation */
  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  /* Day grid */
  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstDay  = firstDayOf(viewYear, viewMonth);
  const prevTotal = daysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);
  const minParsed = parseYMD(min ?? "");
  const maxParsed = parseYMD(max ?? "");

  function isDisabled(y: number, m: number, d: number) {
    const day = new Date(y, m, d);
    if (minParsed && day < new Date(minParsed.y, minParsed.m, minParsed.d)) return true;
    if (maxParsed && day > new Date(maxParsed.y, maxParsed.m, maxParsed.d)) return true;
    return false;
  }

  type Cell = { d: number; m: number; y: number; current: boolean };
  const cells: Cell[] = [];
  for (let i = 0; i < firstDay; i++) {
    const d = prevTotal - firstDay + 1 + i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ d, m, y, current: false });
  }
  for (let d = 1; d <= totalDays; d++) cells.push({ d, m: viewMonth, y: viewYear, current: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ d, m, y, current: false });
  }

  const years = Array.from({ length: 15 }, (_, i) => today.getFullYear() - 2 + i);

  /* ── The time half ── */

  /**
   * The time the columns show. A value with no time yet reads as `defaultValue`
   * (midnight unless the caller says otherwise) so the columns always have a
   * row highlighted rather than starting blank.
   */
  const fallback = parseValue(`2000-01-01 ${timeOptions.defaultValue ?? "00:00"}`)!;
  const current: Parts = parsed ?? {
    y: today.getFullYear(), m: today.getMonth(), d: today.getDate(),
    hh: fallback.hh, mm: fallback.mm, ss: fallback.ss,
  };

  const emit = useCallback(
    (next: Parts) => onChange(formatValue(next, withTime, showSecond)),
    [onChange, withTime, showSecond]
  );

  /**
   * Editing a time before a day has been picked commits today's date along with
   * it — antd does the same, and the alternative is a time that silently goes
   * nowhere until a day is clicked.
   */
  function patchTime(patch: Partial<Pick<Parts, "hh" | "mm" | "ss">>) {
    emit({ ...current, ...patch });
  }

  const hourStep   = step(timeOptions.hourStep);
  const minuteStep = step(timeOptions.minuteStep);
  const secondStep = step(timeOptions.secondStep);

  // 12-hour runs 12, 01 … 11 rather than 01 … 12, because 12 AM is midnight and
  // so is the first hour of the block — the order antd uses, and ascending by
  // the underlying 24-hour value.
  const hourItems = use12Hours
    ? Array.from({ length: Math.ceil(12 / hourStep) }, (_, i) => (i * hourStep) % 12)
    : Array.from({ length: Math.ceil(24 / hourStep) }, (_, i) => i * hourStep);
  const minuteItems = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);
  const secondItems = Array.from({ length: Math.ceil(60 / secondStep) }, (_, i) => i * secondStep);

  const selectedHour = use12Hours ? current.hh % 12 : current.hh;
  const selectedMeridiem: "AM" | "PM" = current.hh < 12 ? "AM" : "PM";

  function selectHour(h: number) {
    if (!use12Hours) return patchTime({ hh: h });
    patchTime({ hh: selectedMeridiem === "AM" ? h : h + 12 });
  }
  function selectMeridiem(p: string) {
    const base = current.hh % 12;
    patchTime({ hh: p === "AM" ? base : base + 12 });
  }

  function selectDay(cell: Cell) {
    if (!cell.current) { setViewYear(cell.y); setViewMonth(cell.m); }
    if (cell.current && isDisabled(cell.y, cell.m, cell.d)) return;
    emit({ y: cell.y, m: cell.m, d: cell.d, hh: current.hh, mm: current.mm, ss: current.ss });
    // With a time panel open the day is only half the answer, so the panel
    // stays up and OK is what closes it. This is antd's behaviour, and without
    // it the panel would shut before a time could be picked.
    if (!withTime) setOpen(false);
  }

  function selectNow() {
    const n = new Date();
    if (isDisabled(n.getFullYear(), n.getMonth(), n.getDate())) return;
    emit({
      y: n.getFullYear(), m: n.getMonth(), d: n.getDate(),
      hh: n.getHours(), mm: n.getMinutes(), ss: n.getSeconds(),
    });
    closePanel();
  }

  const isToday    = (c: Cell) => c.d === today.getDate() && c.m === today.getMonth() && c.y === today.getFullYear();
  const isSelected = (c: Cell) => !!parsed && c.d === parsed.d && c.m === parsed.m && c.y === parsed.y;

  /* ── Calendar half ── */
  const calendar = (
    <div style={{ width: CALENDAR_W }} className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <button type="button" onClick={prevMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {/* Month */}
          <div className="relative">
            <button type="button" onClick={() => { setMonthMenu(o => !o); setYearMenu(false); }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[14px] font-semibold text-foreground hover:bg-muted transition-colors">
              {MONTHS[viewMonth].slice(0, 3)}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {monthMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 z-[10000] mt-1 max-h-[220px] min-w-[130px] overflow-y-auto rounded-xl border border-border bg-popover py-1 shadow-lg"
                >
                  {MONTHS.map((mn, mi) => (
                    <button type="button" key={mn} onClick={() => { setViewMonth(mi); setMonthMenu(false); }}
                      className="w-full px-3 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-muted"
                      style={{ fontWeight: mi === viewMonth ? 600 : 400, color: mi === viewMonth ? PRIMARY : undefined }}
                    >
                      {mn}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Year */}
          <div className="relative">
            <button type="button" onClick={() => { setYearMenu(o => !o); setMonthMenu(false); }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[14px] font-semibold text-foreground hover:bg-muted transition-colors">
              {viewYear}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {yearMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 z-[10000] mt-1 max-h-[200px] min-w-[90px] overflow-y-auto rounded-xl border border-border bg-popover py-1 shadow-lg"
                >
                  {years.map(yr => (
                    <button type="button" key={yr} onClick={() => { setViewYear(yr); setYearMenu(false); }}
                      className="w-full px-3 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-muted"
                      style={{ fontWeight: yr === viewYear ? 600 : 400, color: yr === viewYear ? PRIMARY : undefined }}
                    >
                      {yr}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button type="button" onClick={nextMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers — explicit grid: Tailwind grid-cols-7 can be dropped from CSS output for portalled nodes */}
      <div
        className="px-3 pb-1"
        style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
      >
        {DAYS.map((d) => (
          <div key={d} className="py-1 text-center text-[11.5px] font-semibold text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        className="gap-y-0.5 px-3 pb-4"
        style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
      >
        {cells.map((cell, i) => {
          const selected = isSelected(cell);
          const tod      = isToday(cell);
          const disabled = cell.current && isDisabled(cell.y, cell.m, cell.d);
          return (
            <button type="button" key={i} onClick={() => selectDay(cell)} disabled={disabled}
              className={cn(
                "h-9 w-9 mx-auto rounded-full text-[13px] font-medium flex items-center justify-center transition-all",
                selected  && "text-white font-semibold",
                !selected && tod      && "font-semibold",
                !selected && !tod && cell.current  && !disabled && "text-gray-800 hover:bg-gray-100",
                !selected && !cell.current && "text-gray-300 hover:bg-gray-50",
                disabled  && "opacity-30 cursor-not-allowed",
              )}
              style={selected ? { background: PRIMARY } : tod ? { background: `${PRIMARY}18`, color: PRIMARY } : {}}>
              {cell.d}
            </button>
          );
        })}
      </div>
    </div>
  );

  /* ── Time half ── */
  const timeColumns = withTime && (
    <div className="flex pt-3">
      <TimeColumn
        label="Hr"
        items={hourItems}
        selected={selectedHour}
        onSelect={selectHour}
        render={(h) => pad(use12Hours && h === 0 ? 12 : h)}
      />
      <TimeColumn label="Min" items={minuteItems} selected={current.mm} onSelect={(m) => patchTime({ mm: m })} render={pad} />
      {showSecond && (
        <TimeColumn label="Sec" items={secondItems} selected={current.ss} onSelect={(s) => patchTime({ ss: s })} render={pad} />
      )}
      {use12Hours && (
        <TimeColumn label="AM/PM" items={["AM", "PM"]} selected={selectedMeridiem} onSelect={selectMeridiem} />
      )}
    </div>
  );

  const body = (
    <>
      <div className="flex">
        {calendar}
        {timeColumns}
      </div>

      {/* Footer only exists alongside a time panel: with no time to pick, a day
          click is the whole answer and an OK button would be a second click for
          nothing. Same rule antd applies. */}
      {withTime && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
          {showNow ? (
            <button type="button" onClick={selectNow}
              className="rounded-md px-1 text-[13px] font-medium transition-colors hover:underline"
              style={{ color: PRIMARY }}>
              Now
            </button>
          ) : <span />}
          <button type="button" onClick={closePanel}
            className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: PRIMARY }}>
            OK
          </button>
        </div>
      )}
    </>
  );

  /* ── Calendar panel (portalled) ── */
  const panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.97, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -6 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="isolate rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg select-none dark:shadow-black/40"
          style={{
            position:        "fixed",
            top:             panelPos.top,
            left:            panelPos.left,
            width:           PANEL_W,
            zIndex:          20000,
            // A modal Radix Dialog sets `pointer-events: none` on <body> while
            // it is open, and this panel is portaled to <body> — so without
            // this every click on a day landed on nothing and the calendar
            // looked frozen inside a Dialog or Drawer. Hit-testing is
            // per-element, so re-enabling it here is enough; the page behind
            // the dialog stays inert. The click still reaches the dialog's
            // DismissableLayer through React's portal event propagation, so it
            // is treated as inside and does not dismiss the dialog.
            pointerEvents:   "auto",
            backgroundColor: "var(--popover)",
            boxShadow:       "0 16px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.07)",
          }}
        >
          {/* The time columns are the only scrollable region this panel has, and
              a portalled node is neither the lock container nor a shard of a
              modal Dialog's `RemoveScroll` — so react-remove-scroll would
              `preventDefault()` every wheel event over them and leave only the
              rows already on screen reachable. Taking the top of the lock stack
              hands scrolling back, the same way TimePicker and Radix `Select`
              do. Mounted only with a time panel: the date-only panel has
              nothing to scroll and should not lock the page. */}
          {withTime ? <RemoveScroll allowPinchZoom>{body}</RemoveScroll> : body}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={cn("relative", className)}>
      {label && <p className="mb-2 text-sm font-medium text-foreground">{label}</p>}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => open ? closePanel() : openPanel()}
        className={cn(
          "flex h-12 min-h-12 w-full items-center gap-3 rounded-xl border border-border bg-card px-5 text-left text-[15px] shadow-sm transition-colors",
          open ? "border-ring ring-2 ring-ring/20" : "hover:border-muted-foreground/45",
        )}
      >
        <CalendarDays className="size-[1.125rem] shrink-0 text-muted-foreground" />
        <span className={cn("flex-1", value ? "text-foreground" : "text-muted-foreground")}>
          {value ? displayValue(value, withTime, showSecond) : placeholder}
        </span>
        <ChevronDown className={cn("size-[1.125rem] shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {/* Portal. Wrapped so the panel takes over the scroll lock when it opens
          inside a Dialog or Drawer — without it the year/month lists and the
          time columns cannot be scrolled with the wheel. See `scroll-lock.tsx`. */}
      {mounted &&
        createPortal(<ScrollLockTakeover>{panel}</ScrollLockTakeover>, document.body)}
    </div>
  );
}
