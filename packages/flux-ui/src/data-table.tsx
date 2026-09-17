"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "./utils";
import { Shimmer } from "./skeleton";
import { EmptyState } from "./empty-state";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export type DataTableDensity = "default" | "comfortable" | "compact";
export type DataTableHeaderStyle = "surface" | "minimal";

/**
 * Footer summary text.
 * - `range` — "Showing 1–15 of 141 results" (or "Showing 1–15" when no total
 *   is knowable, i.e. cursor pagination).
 * - `count` — "141 items".
 * - `none` — no summary, just the pager.
 */
export type DataTableFooterSummary = "range" | "count" | "none";

export type SortOrder = "ascend" | "descend";
/** `null` means unsorted — the table is in the order the data arrived in. */
export type DataTableSortState = { columnKey: string; order: SortOrder } | null;

/** Builds the visible page numbers including ellipsis markers */
function getPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  const lo = Math.max(2, current - 1);
  const hi = Math.min(total - 1, current + 1);
  for (let p = lo; p <= hi; p++) pages.push(p);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

// ── Pagination ───────────────────────────────────────────────────────────────

/** Controls shared by every paginated mode. */
type PagerCommon = {
  /**
   * Summary text at the left of the footer. Defaults to `range`.
   */
  summary?: DataTableFooterSummary;
  /** Noun after the number when `summary="count"`. Default `item` / `items`. */
  countLabels?: { singular: string; plural: string };
  /**
   * Page-size choices. Pass these — with `onPageSizeChange` — and the footer
   * grows a "Rows per page" picker at its far left. Omit and there is none.
   *
   * This lives here rather than being hand-passed as a footer slot because a
   * grid that had to hand-roll its own page-size control is how two different
   * pagers end up in the same app.
   */
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (size: number) => void;
  /** Escape hatch: an extra control at the far left, before the summary. */
  leading?: ReactNode;
};

/**
 * How the table pages. Which member you use is decided by the endpoint, not by
 * taste:
 *
 * - `client` — every row is already in `data`; the table slices it. The
 *   default when `pagination` is omitted.
 * - `page` — the response carries a row **total**, so the footer can show
 *   "Showing 1–15 of 141 results" and a full numbered strip with ellipses.
 * - `cursor` — the response carries no total (a `nextCursor` /
 *   `exclusiveStartKey` API). The footer shows "Showing 1–15" with **no**
 *   total and no page count, and the numbered strip is only ever the page
 *   before, the current page, and — when `hasNext` says so — the page after.
 *   Those are the only pages a cursor can actually reach in one step, so they
 *   are the only ones offered.
 * - `none` — no footer at all.
 */
export type DataTablePagination =
  | ({
      mode: "client";
      /** Rows per page. Default 10. */
      pageSize?: number;
    } & PagerCommon)
  | ({
      mode: "page";
      /** 1-indexed. */
      page: number;
      pageSize: number;
      /** Total rows across all pages, from the response. */
      total: number;
      onPageChange: (page: number) => void;
    } & PagerCommon)
  | ({
      mode: "cursor";
      /** 1-indexed, for the "Showing x–y" range and the page marker. */
      page: number;
      pageSize: number;
      /** Whether a page exists after this one. Drives the next control. */
      hasNext: boolean;
      /** Defaults to `page > 1`. */
      hasPrev?: boolean;
      onNext: () => void;
      onPrev: () => void;
    } & PagerCommon)
  | { mode: "none" };

// ── Sorting ──────────────────────────────────────────────────────────────────

/**
 * Sorting, modelled on antd's `Table`: a column opts in with `sorter`, and the
 * table reports state as `{ columnKey, order }` with antd's `"ascend"` /
 * `"descend"` vocabulary.
 *
 * The one deliberate difference is that client and server sorting are told
 * apart by the **column**, not by a table-level flag: `sorter: true` means "the
 * caller orders this", a comparator means "the table orders this". A grid can
 * therefore mix the two, which matters when one column is a derived value the
 * server does not know about.
 */
export type DataTableSorting = {
  /**
   * Controlled sort state. Omit for uncontrolled — the table remembers, which
   * is all a client-sorted grid needs.
   */
  value?: DataTableSortState;
  /** Fires on every header activation, with the state being moved to. */
  onChange?: (next: DataTableSortState) => void;
};

/**
 * Row expansion: a disclosure column plus a full-width panel rendered directly
 * beneath the expanded row. Use it when the detail belongs *with* the row in
 * the flow of the table (a request's headers, a payload, a breakdown) rather
 * than in a drawer that covers it.
 *
 * Leave `expandedKeys` unset for uncontrolled behaviour (the table remembers
 * which rows are open). Pass `expandedKeys` + `onExpandedChange` to drive it
 * from outside — needed when opening a row triggers a fetch.
 */
export type DataTableExpandable<T> = {
  /** The panel shown under an expanded row. */
  render: (row: T, index: number) => ReactNode;
  /**
   * Which rows can open at all. Rows that cannot get no toggle and no chevron,
   * keeping the column's width without implying an affordance that isn't there.
   * Defaults to every row.
   */
  isExpandable?: (row: T, index: number) => boolean;
  /** Controlled open rows, as `rowKey` values. Omit for uncontrolled. */
  expandedKeys?: string[];
  /** Fires on every open/close in controlled mode. */
  onExpandedChange?: (keys: string[]) => void;
  /**
   * Fires only when a row opens, in both modes — the hook for lazily fetching
   * that row's detail. Not called on close.
   */
  onExpand?: (row: T, index: number) => void;
  /** Accessible name for the toggle. Default "Toggle row details". */
  toggleLabel?: string;
};

export type Column<T> = {
  key: string;
  header: ReactNode;
  /**
   * Table column width: `48px`, `18%`, or `minmax(12rem, 1fr)` for a floor
   * that can still grow into whatever the other columns leave over.
   *
   * `minmax(min, max)` is translated rather than passed straight through: this
   * is a real `<table>`/`<colgroup>`, and `minmax()` is a CSS Grid function
   * that is not a legal `width` value outside a grid — the browser drops the
   * whole declaration and the column gets no floor at all. `min` becomes the
   * `<col>`'s `min-width`, and `max` becomes its `width` unless `max` is `1fr`
   * (or any other flex unit), in which case no `width` is set and the column
   * takes its share of whatever `table-layout: fixed` has left over, the same
   * way a grid track's `1fr` would.
   *
   * `overflow-x-auto` on the table's own scroll container is what makes the
   * floor mean something: once every column's minimum no longer fits, the
   * table grows past its container and scrolls instead of every column
   * shrinking under its `min-width` and the header text — deliberately not
   * truncated, see the `<th>` render below — overlapping the column beside it.
   */
  width?: string;
  minWidth?: number;
  maxWidth?: number;
  align?: "left" | "right" | "center";
  /** Allow cell text to wrap instead of truncating. */
  wrap?: boolean;
  /** Extra classes on `<th>` / `<td>` (e.g. wider horizontal padding per column) */
  cellClassName?: string;
  /**
   * Inline styles on `<th>` / `<td>`.
   *
   * For a value Tailwind cannot generate a class for because it is computed —
   * a sticky column's `left`, which is the running total of the widths before
   * it. Expressing that as a class means keeping a hand-written lookup table of
   * every offset the layout can produce, and silently getting the wrong one the
   * moment a column width changes. See `frozenColumn`.
   */
  cellStyle?: CSSProperties;
  /**
   * Makes this header a sort control.
   *
   * - `true` — the **caller** orders the rows (a server-side `sortBy` query).
   *   The table reports the change through `sorting.onChange` and leaves `data`
   *   exactly as given.
   * - a comparator — the **table** orders the rows with it, before paging.
   *   Same contract as `Array.prototype.sort`'s argument, and the same as
   *   antd's `sorter`.
   */
  sorter?: boolean | ((a: T, b: T) => number);
  /**
   * The orders this header cycles through before returning to unsorted.
   * Default `["ascend", "descend"]`. Pass `["descend", "ascend"]` for a column
   * where "most recent" or "largest" is the obvious first click.
   */
  sortDirections?: SortOrder[];
  render: (row: T, index: number) => ReactNode;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  skeletonRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  /**
   * Pagination and the footer that carries it. Omit for client-side paging at
   * 10 rows a page. See {@link DataTablePagination}.
   */
  pagination?: DataTablePagination;
  /** Column sorting. See {@link DataTableSorting}. */
  sorting?: DataTableSorting;
  className?: string;
  rowKey: (row: T) => string;
  /** Optional hover CTA shown on the right of every row */
  rowCta?: {
    label: string;
    onClick?: (row: T) => void;
  };
  /**
   * Custom action revealed on row hover — typically a `<Button>` or
   * `<ButtonGroup>`, but any `ReactNode` is accepted. Pass a **function** to
   * render per-row: it receives `(row, index)`, so the action always has the
   * record for its row (e.g. to navigate or open a drawer for that row).
   *
   * It is not a real column: it floats as an overlay **pinned to the right edge
   * of the viewport**, so it stays in view as the table scrolls horizontally
   * (no scrolling to the end to reach it) while the last data column stays
   * flush with nothing trailing it. Takes precedence over `rowCta`.
   */
  rowAction?: ReactNode | ((row: T, index: number) => ReactNode);
  /**
   * Makes the whole row a click target — the row itself opens a drawer, a
   * detail page, whatever the table drills into — instead of that living in a
   * per-cell wrapper or a hover-revealed button.
   *
   * The handler sits on the `<tr>`, so the entire row including cell padding
   * and the empty space between columns is clickable, and the row gets
   * `cursor-pointer` plus keyboard access (focusable, Enter / Space).
   *
   * Clicks that originate inside something interactive — a `<button>`, `<a>`,
   * a form control, a Radix trigger, or anything marked
   * `data-row-click-ignore` — do NOT fire this. Copy buttons, per-row menus
   * and the `rowAction` overlay therefore keep doing only their own job
   * without each having to stop propagation.
   */
  onRowClick?: (row: T, index: number) => void;
  /** Row / cell vertical rhythm and horizontal gutters */
  density?: DataTableDensity;
  /**
   * Column-sizing strategy:
   * - `fixed` — widths come only from `colgroup` hints (`width`/`minWidth`/
   *   `maxWidth`); content is ignored and overflow is clipped. Table fills 100%.
   * - `auto` — columns size to content but the table still fills 100%, so any
   *   leftover space is distributed into the columns (they stretch).
   * - `content` — columns size to their content's intrinsic width and the table
   *   shrinks to fit. Leftover space stays empty to the right of the last
   *   column; it scrolls horizontally only once content exceeds the container.
   */
  tableLayout?: "auto" | "fixed" | "content";
  theadClassName?: string;
  headerStyle?: DataTableHeaderStyle;
  /** With `density="compact"`, use tighter cell gutters (`pl-1.5 pr-2.5` vs `px-3`). Footer keeps normal horizontal padding. */
  snug?: boolean;
  /** Per-row disclosure panel rendered beneath the row. See `DataTableExpandable`. */
  expandable?: DataTableExpandable<T>;
}

/**
 * The pagination union flattened into one shape the render can read without
 * re-narrowing at every use.
 *
 * `total` and `totalPages` stay optional on purpose: `undefined` is the honest
 * answer for a cursor API, and keeping it optional here is what stops the
 * footer from quietly falling back to a made-up count.
 */
export type NormalizedPager = {
  showFooter: boolean;
  /** Whether the table slices `data` itself (client mode only). */
  sliceLocally: boolean;
  page: number;
  pageSize: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  summary: DataTableFooterSummary;
  countLabels: { singular: string; plural: string };
  leading?: ReactNode;
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (size: number) => void;
};

const DEFAULT_COUNT_LABELS = { singular: "item", plural: "items" };

export function normalizePagination(
  pagination: DataTablePagination,
  rowsHeld: number,
  internalPage: number
): NormalizedPager {
  if (pagination.mode === "none") {
    return {
      showFooter: false,
      sliceLocally: false,
      page: 1,
      // A footerless table shows every row it was given; guard against a
      // zero divisor for the range arithmetic that never renders.
      pageSize: rowsHeld || 1,
      summary: "none",
      countLabels: DEFAULT_COUNT_LABELS,
    };
  }

  const shared = {
    showFooter: true,
    summary: pagination.summary ?? "range",
    countLabels: pagination.countLabels ?? DEFAULT_COUNT_LABELS,
    leading: pagination.leading,
    pageSizeOptions: pagination.pageSizeOptions,
    onPageSizeChange: pagination.onPageSizeChange,
  };

  if (pagination.mode === "client") {
    const pageSize = pagination.pageSize ?? 10;
    return {
      ...shared,
      sliceLocally: true,
      page: internalPage,
      pageSize,
      total: rowsHeld,
      totalPages: Math.max(1, Math.ceil(rowsHeld / pageSize)),
    };
  }

  if (pagination.mode === "page") {
    return {
      ...shared,
      sliceLocally: false,
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pagination.total,
      totalPages: Math.max(1, Math.ceil(pagination.total / pagination.pageSize)),
    };
  }

  // Cursor: no total, therefore no `totalPages`. That absence is what the
  // footer keys off to switch to prev/current/next numbering.
  return {
    ...shared,
    sliceLocally: false,
    page: pagination.page,
    pageSize: pagination.pageSize,
    hasNext: pagination.hasNext,
    hasPrev: pagination.hasPrev ?? pagination.page > 1,
    onNext: pagination.onNext,
    onPrev: pagination.onPrev,
  };
}

/** The order a header moves to on its next activation. */
function nextSortOrder(
  current: DataTableSortState,
  columnKey: string,
  directions: SortOrder[]
): DataTableSortState {
  if (!current || current.columnKey !== columnKey) {
    return { columnKey, order: directions[0] };
  }
  const at = directions.indexOf(current.order);
  const next = directions[at + 1];
  // Past the end of the cycle is "unsorted" — a third click always gets the
  // user back to the order the data arrived in, which is otherwise unreachable.
  return next ? { columnKey, order: next } : null;
}

/**
 * The sort glyph.
 *
 * Unsorted is one `ChevronsUpDown` rather than two chevrons stacked by hand:
 * the pair had to be pulled together with a negative margin, which left them
 * mis-kerned and heavier than the header text beside them. A single glyph is
 * drawn as one shape on lucide's own grid, so it sits on the baseline properly
 * at any size.
 *
 * Sorted is an arrow, not a highlighted half of a pair. An arrow says which way
 * the rows are ordered on its own; a chevron pair with one half tinted asks the
 * reader to compare two shapes to find out.
 *
 * The unsorted glyph stays visible rather than appearing on hover, so a column
 * that *can* sort says so before it is pointed at — but at 40% it reads as an
 * affordance rather than as state.
 */
function SortIndicator({ order }: { order: SortOrder | null }) {
  const Glyph = order === "ascend" ? ArrowUp : order === "descend" ? ArrowDown : ChevronsUpDown;
  return (
    <Glyph
      aria-hidden
      className={cn(
        "ml-1.5 h-3 w-3 shrink-0",
        order ? "text-primary" : "text-muted-foreground/40"
      )}
    />
  );
}

/**
 * `minmax(A, B)` → its two halves, tolerant of whichever whitespace someone
 * wrote it with. `null` for anything else, including a plain length like
 * `"180px"` — that already IS a valid `width` and passes through untouched.
 */
function parseMinMaxWidth(width: string | undefined): { min: string; max: string } | null {
  if (!width) return null;
  const match = /^minmax\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)$/.exec(width.trim());
  return match ? { min: match[1], max: match[2] } : null;
}

/** `1fr`, `2fr`, … — a Grid flex unit, meaningless as a table `width`. */
function isFlexUnit(value: string): boolean {
  return /^[\d.]*fr$/.test(value.trim());
}

/**
 * A column's `width` as the three real CSS properties a `<col>` understands.
 *
 * Anything that is not a `minmax(...)` string passes through exactly as it did
 * before this existed, so a plain `"48px"` or `"18%"` column is untouched.
 */
function colWidthStyle(col: Pick<Column<unknown>, "width" | "minWidth" | "maxWidth">): {
  width: string | number | undefined;
  minWidth: string | number | undefined;
  maxWidth: string | number | undefined;
} {
  const parsed = parseMinMaxWidth(col.width);
  if (!parsed) {
    return {
      width: col.width ?? (col.minWidth != null ? `${col.minWidth}px` : undefined),
      minWidth: col.minWidth,
      maxWidth: col.maxWidth,
    };
  }
  return {
    width: isFlexUnit(parsed.max) ? undefined : parsed.max,
    // An explicit numeric `minWidth`/`maxWidth` alongside a `minmax()` string
    // is not a combination any caller uses today; the string wins because it
    // is the more specific of the two.
    minWidth: parsed.min,
    maxWidth: isFlexUnit(parsed.max) ? col.maxWidth : undefined,
  };
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  skeletonRows = 6,
  emptyTitle = "No data yet",
  emptyDescription,
  pagination = { mode: "client" },
  sorting,
  className,
  rowKey,
  rowCta,
  rowAction,
  onRowClick,
  density = "default",
  tableLayout = "fixed",
  theadClassName,
  headerStyle = "surface",
  snug = false,
  expandable,
}: DataTableProps<T>) {
  // ── Sorting ───────────────────────────────────────────────────────────────
  const [internalSort, setInternalSort] = useState<DataTableSortState>(null);
  const isSortControlled = sorting?.value !== undefined;
  const sortState = isSortControlled ? sorting!.value! : internalSort;

  const columnByKey = useMemo(() => new Map(columns.map((c) => [c.key, c])), [columns]);

  /**
   * Rows in sorted order. Only a **comparator** sorts here: `sorter: true`
   * means the caller has already ordered the rows (or asked the server to), so
   * re-sorting them locally would fight the response.
   */
  const sortedData = useMemo(() => {
    if (!sortState) return data;
    const sorter = columnByKey.get(sortState.columnKey)?.sorter;
    if (typeof sorter !== "function") return data;
    // Copy first: sorting the caller's array in place mutates their state.
    const out = data.slice().sort(sorter);
    return sortState.order === "descend" ? out.reverse() : out;
  }, [data, sortState, columnByKey]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const [internalPage, setInternalPage] = useState(1);

  /**
   * The discriminated union collapsed into one flat shape, so the render below
   * reads the same regardless of mode and every `undefined` is a deliberate
   * "nobody knows" rather than a missing prop.
   */
  const pager = normalizePagination(pagination, sortedData.length, internalPage);

  /** Only client mode holds every row, so only client mode slices. */
  const paginated = pager.sliceLocally
    ? sortedData.slice((pager.page - 1) * pager.pageSize, pager.page * pager.pageSize)
    : sortedData;

  /** Zero-based offset of this page's first row, for the "Showing x–y" range. */
  const from = (pager.page - 1) * pager.pageSize;

  const setSort = (next: DataTableSortState) => {
    if (isSortControlled) sorting!.onChange?.(next);
    else {
      setInternalSort(next);
      sorting?.onChange?.(next);
    }
    // A re-sort makes the current page number meaningless — the rows under it
    // have all changed. Only client mode can act on that; controlled callers
    // decide for themselves, since they may be paging by cursor.
    if (pagination.mode === "client") setInternalPage(1);
  };

  const goToPage = (p: number) => {
    if (pagination.mode === "page") pagination.onPageChange(p);
    else if (pagination.mode === "client") setInternalPage(p);
  };

  // The right-pinned row action. `rowAction` takes precedence over `rowCta`.
  // It is NOT a real column: it renders as a per-row overlay floating at the
  // right edge of the viewport (sticky), so the last data column stays flush
  // and there's no reserved/empty trailing column when scrolled to the end.
  const hasAction = rowAction != null || rowCta != null;

  // `content` layout: a greedy, empty trailing column that absorbs leftover
  // horizontal space so the data columns stay at their content (minimum)
  // width while the table still spans the full container width.
  const hasSpacer = tableLayout === "content";

  // Row expansion. Uncontrolled by default; `expandedKeys` hands control to the
  // caller, which is what a row whose panel fetches its own data needs.
  // `onExpand` fires only on open, in both modes.
  const [internalExpanded, setInternalExpanded] = useState<string[]>([]);
  const isExpandControlled = expandable?.expandedKeys !== undefined;
  const expandedKeys = isExpandControlled ? expandable!.expandedKeys! : internalExpanded;
  const hasExpand = expandable != null;
  /** Every column the expansion panel has to span. */
  const totalColSpan =
    columns.length + (hasExpand ? 1 : 0) + (hasSpacer ? 1 : 0) + (hasAction ? 1 : 0);

  /** Whether this row is open — drives both its own styling and the panel. */
  const rowExpanded = (row: T, index: number) =>
    hasExpand &&
    (expandable!.isExpandable?.(row, index) ?? true) &&
    expandedKeys.includes(rowKeys[index]);

  const toggleExpanded = (key: string, row: T, index: number) => {
    const isOpen = expandedKeys.includes(key);
    const next = isOpen ? expandedKeys.filter((k) => k !== key) : [...expandedKeys, key];
    if (isExpandControlled) expandable!.onExpandedChange?.(next);
    else setInternalExpanded(next);
    if (!isOpen) expandable!.onExpand?.(row, index);
  };

  // Guard against duplicate / non-unique rowKey() results. React silently fails
  // to unmount old <tr> nodes when sibling keys collide, leaving stale rows
  // rendered on top of new data (or the empty state). De-dupe by suffixing
  // repeats so every rendered row gets a unique, stable key.
  const seenKeys = new Map<string, number>();
  const rowKeys = paginated.map((row) => {
    const base = rowKey(row);
    const seen = seenKeys.get(base) ?? 0;
    seenKeys.set(base, seen + 1);
    return seen === 0 ? base : `${base}__${seen}`;
  });

  /**
   * No rows to show. The width hints are dropped in this state: a grid whose
   * columns carry minimums (via `colgroup` in fixed layout, or `cellClassName`
   * in the others) would otherwise have its HEADER row alone force the table
   * past the container and raise a horizontal scrollbar — over an empty region
   * with nothing to scroll to. Headers still render, at their natural width, so
   * the shape of the missing data is still legible.
   */
  const isEmpty = !isLoading && paginated.length === 0;

  const comfortable = density === "comfortable";
  const compact = density === "compact";
  const compactCellPad = compact
    ? snug
      ? "pl-1.5 pr-2.5 py-2.5"
      : "px-3 py-2.5"
    : "px-4 py-3.5";
  const cellPad = comfortable ? "px-5 py-4" : compactCellPad;
  const headPad = comfortable ? "px-5 py-4" : compactCellPad;
  /** Footer is outside the grid; do not reuse snug cell `pl-0`-style gutters here. */
  const footerPad = comfortable
    ? "px-5 py-4"
    : compact
      ? "px-4 py-2.5"
      : "px-4 py-3.5";
  const headText = comfortable
    ? "text-[12px] font-medium text-muted-foreground tracking-normal"
    : compact
      ? "text-[11px] font-semibold text-muted-foreground"
      : "text-[11px] font-semibold text-foreground/75 dark:text-foreground/85";
  /**
   * Expansion geometry, in px, derived from the same padding the cells use:
   *
   * - `expandIndent` lines the panel's content up with the first DATA column
   *   (past the 40px disclosure column), so the detail reads as hanging off the
   *   row rather than starting outside it.
   * - `expandGuideLeft` is the centre of the chevron, where the vertical
   *   connector runs — the cue that the panel belongs to the row above.
   *
   * Both live here rather than in each consumer's panel: a hardcoded indent in
   * a feature silently drifts the moment this padding or the column width
   * changes.
   */
  const cellPadLeft = comfortable ? 20 : compact ? (snug ? 6 : 12) : 16;
  const expandIndent = 40 + cellPadLeft;
  const expandGuideLeft = cellPadLeft + 10;

  // Action overlay geometry: the action floats this many px in from the right
  // edge of the viewport (it has no reserved column — it overlays the row).
  const actionGutter = comfortable ? 20 : compact ? 12 : 16;

  /**
   * Selector for everything a row-level click must keep its hands off. A click
   * landing inside one of these belongs to that control alone — a copy button,
   * a per-row menu, a link, a checkbox, the `rowAction` overlay — so the row
   * handler ignores it rather than firing as well.
   *
   * `data-row-click-ignore` is the escape hatch for anything not covered here
   * (a custom widget in a cell, a drag handle) without it needing to stop
   * propagation itself.
   */
  const ROW_CLICK_IGNORE =
    'button, a, input, select, textarea, label, [role="button"], [role="link"], ' +
    '[role="checkbox"], [role="menuitem"], [role="menu"], [role="dialog"], ' +
    "[data-row-click-ignore]";

  /**
   * Horizontal scroll position, so a frozen column can show a shadow only when
   * there is actually something scrolled underneath it.
   *
   * A shadow that is always on is just a heavier border: it says "pinned" when
   * nothing is hidden, and then says nothing new at the moment it matters. The
   * point of the shadow is to mark the edge that content is passing beneath.
   */
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [edge, setEdge] = useState({ start: false, end: false });

  const syncEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({
      start: el.scrollLeft > 1,
      // 1px of slack: sub-pixel widths mean scrollLeft rarely reaches `max`
      // exactly, which would leave the end shadow stuck on at full scroll.
      end: max > 1 && el.scrollLeft < max - 1,
    });
  }, []);

  /**
   * Measured after layout rather than during render — it reads `scrollWidth`,
   * which render cannot know. Re-run when the column or row count changes,
   * since either changes whether the table overflows at all.
   */
  useEffect(() => {
    const raf = requestAnimationFrame(syncEdges);
    window.addEventListener("resize", syncEdges);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", syncEdges);
    };
  }, [syncEdges, columns.length, paginated.length]);

  /** Whether a click/keypress inside a row should reach `onRowClick`. */
  const isRowClickTarget = (target: EventTarget | null, rowEl: HTMLElement) => {
    if (!(target instanceof Element)) return false;
    // A React portal re-dispatches its clicks through the React tree, not the
    // DOM tree, so a row's overflow menu — rendered into document.body — still
    // arrives at this row's onClick. The target is not a DOM descendant of the
    // row, and that is exactly what says the click belonged to the menu rather
    // than to the row. Without this, choosing "Edit" from a row menu also fired
    // the row's own action, opening the edit dialog and the preview at once.
    if (!rowEl.contains(target)) return false;

    // Within the row, a click on a control belongs to that control. `closest`
    // can still walk above the row, so the match has to be inside it.
    const interactive = target.closest(ROW_CLICK_IGNORE);
    return !(interactive && rowEl.contains(interactive));
  };

  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-xl overflow-hidden border border-border",
        className
      )}
    >
      {/* scrollbar space always reserved; thumb subtle on hover */}
      <div
        ref={scrollRef}
        onScroll={syncEdges}
        // Read by `frozenColumn`'s shadow through `group-data-[…]/table-scroll`.
        data-scrolled-start={edge.start ? "true" : "false"}
        data-scrolled-end={edge.end ? "true" : "false"}
        className={cn(
          "group/table-scroll overflow-x-auto",
          "[&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent",
          "hover:[&::-webkit-scrollbar-thumb]:bg-border dark:hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/35"
        )}
        style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}
      >
        <table
          className={cn(tableLayout === "auto" && "min-w-[920px]")}
          style={{
            // `content` uses the automatic algorithm but stays 100% wide; a
            // greedy spacer column (below) soaks up the slack so the data
            // columns collapse to their content width while the table fills.
            tableLayout: tableLayout === "fixed" ? "fixed" : "auto",
            width: "100%",
          }}
        >
          {tableLayout === "fixed" && !isEmpty && (
            <colgroup>
              {hasExpand ? <col style={{ width: 40 }} /> : null}
              {columns.map((col) => (
                <col key={col.key} style={colWidthStyle(col)} />
              ))}
              {/* Zero-width column: the action floats out of it as an overlay,
                  so the last data column stays flush and nothing trails it. */}
              {hasAction ? <col style={{ width: 0 }} /> : null}
            </colgroup>
          )}

          <thead
            className={cn(
              headerStyle === "surface" && "bg-muted/35",
              headerStyle === "minimal" && "bg-transparent",
              theadClassName
            )}
          >
            <tr
              className={cn(
                "border-b",
                headerStyle === "surface" ? "border-border" : "border-border/70"
              )}
            >
              {hasExpand ? <th className={cn(headPad, "w-10 p-0")} aria-hidden /> : null}
              {columns.map((col) => {
                const sortable = col.sorter != null && col.sorter !== false;
                const activeOrder =
                  sortState?.columnKey === col.key ? sortState.order : null;
                const align =
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                      ? "text-center"
                      : "text-left";
                return (
                  <th
                    key={col.key}
                    style={col.cellStyle}
                    // Announced to assistive tech as the sort state of the
                    // column, which the caret pair alone does not convey.
                    aria-sort={
                      !sortable
                        ? undefined
                        : activeOrder === "ascend"
                          ? "ascending"
                          : activeOrder === "descend"
                            ? "descending"
                            : "none"
                    }
                    className={cn(
                      headPad,
                      headText,
                      "whitespace-nowrap align-middle",
                      align,
                      // Width hints live in `cellClassName`; see `isEmpty`.
                      !isEmpty && col.cellClassName
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSort(
                            nextSortOrder(
                              sortState,
                              col.key,
                              col.sortDirections ?? ["ascend", "descend"]
                            )
                          )
                        }
                        className={cn(
                          // Inherits the header's own type styling rather than
                          // restating it, so a sortable header is visually
                          // identical to a plain one apart from the glyph.
                          //
                          // Deliberately NOT truncating: a plain header does
                          // not, so a sortable one that did would ellipsise
                          // names the column beside it shows in full.
                          // A bare <button>, so Preflight's `font: inherit`
                          // already hands it the header's own type. The
                          // `text-[inherit]` that used to be here did nothing
                          // for size — Tailwind reads `text-[<non-length>]` as
                          // a colour — and only looked like it worked because
                          // nothing here sets a competing font-size.
                          "-mx-1 inline-flex items-center whitespace-nowrap rounded px-1 py-0.5 transition-colors",
                          "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          activeOrder && "text-foreground",
                          // The glyph follows the text, so on a right-aligned
                          // column it has to lead instead — otherwise it sits
                          // between the label and the numbers it describes.
                          col.align === "right" && "flex-row-reverse [&>svg]:ml-0 [&>svg]:mr-1.5"
                        )}
                      >
                        {col.header}
                        <SortIndicator order={activeOrder} />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
              {hasSpacer ? <th className="w-full p-0" aria-hidden /> : null}
              {hasAction ? (
                <th className="sticky right-0 z-[1] w-0 p-0" aria-hidden />
              ) : null}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              // The placeholder row mirrors the real row's cells exactly: one
              // per column, carrying that column's own width, alignment and
              // sticky classes, plus the same expand / spacer / action cells.
              //
              // It used to be a generic `TableRowSkeleton` with a cell count
              // and nothing else. With `tableLayout="content"` the real row
              // also carries a greedy spacer cell, so the skeleton was one cell
              // short: the last shimmer stretched across the spacer's slot and
              // the placeholder columns stopped lining up with the headers
              // above them — which reads as a column missing while loading.
              Array.from({ length: skeletonRows }).map((_, r) => (
                <tr
                  key={r}
                  className={cn(
                    "border-b border-border/60",
                    comfortable && "min-h-[56px]",
                    compact && "min-h-[44px]"
                  )}
                >
                  {hasExpand ? <td className={cn(cellPad, "w-10")} /> : null}
                  {columns.map((col, c) => (
                    <td
                      key={col.key}
                      style={col.cellStyle}
                      className={cn(
                        cellPad,
                        "align-middle overflow-hidden",
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                            ? "text-center"
                            : "text-left",
                        col.cellClassName
                      )}
                    >
                      {/* Varied widths so the block reads as rows of data
                          rather than a striped grid. Inline-block so the
                          column's own alignment still places it. */}
                      <Shimmer
                        className={cn(
                          "inline-block h-3.5 max-w-full",
                          c === 0 ? "w-20" : c === columns.length - 1 ? "w-14" : "w-28"
                        )}
                      />
                    </td>
                  ))}
                  {hasSpacer ? <td className="p-0" aria-hidden /> : null}
                  {hasAction ? (
                    <td className="sticky right-0 z-[1] w-0 p-0" aria-hidden />
                  ) : null}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={totalColSpan}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginated.flatMap((row, i) => [
                <tr
                  key={rowKeys[i]}
                  className={cn(
                    "group transition-colors duration-150 border-b border-border/60 last:border-b-0",
                    comfortable && "min-h-[56px]",
                    compact && "min-h-[44px]",
                    "hover:bg-muted/40 dark:hover:bg-muted/25",
                    hasAction &&
                      "hover:shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:hover:shadow-none",
                    // Clickable rows read as clickable, and show a focus ring
                    // when reached by keyboard. `focus-visible` only, so a
                    // mouse click does not leave a ring behind on the row.
                    onRowClick &&
                      "cursor-pointer focus-visible:outline-none focus-visible:bg-muted/40 dark:focus-visible:bg-muted/25",
                    // An open row takes its panel's background and drops the
                    // divider beneath it, so the row and its detail read as one
                    // block. Hover is pinned to the same value, or moving the
                    // mouse over an open row would make it flicker away from
                    // the panel it belongs to.
                    rowExpanded(row, i) &&
                      "border-b-0 bg-muted/40 hover:bg-muted/40 dark:bg-muted/25 dark:hover:bg-muted/25"
                  )}
                  // Keyboard parity with the mouse: the row is reachable by
                  // Tab and activated by Enter / Space, which a bare <tr> with
                  // an onClick would not be. No role override — the row stays a
                  // row for assistive tech rather than claiming to be a button.
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={
                    onRowClick
                      ? (e) => {
                          if (!isRowClickTarget(e.target, e.currentTarget)) return;
                          onRowClick(row, i);
                        }
                      : undefined
                  }
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key !== "Enter" && e.key !== " ") return;
                          // Only the row's own focus activates it; a keypress
                          // inside a control in the row belongs to that control.
                          if (e.target !== e.currentTarget) return;
                          // Space scrolls the page by default.
                          e.preventDefault();
                          onRowClick(row, i);
                        }
                      : undefined
                  }
                >
                  {hasExpand ? (
                    <td className={cn(cellPad, "w-10 align-middle")}>
                      {(expandable!.isExpandable?.(row, i) ?? true) ? (
                        <button
                          type="button"
                          aria-expanded={rowExpanded(row, i)}
                          aria-label={expandable!.toggleLabel ?? "Toggle row details"}
                          onClick={() => toggleExpanded(rowKeys[i], row, i)}
                          className="inline-flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 transition-transform duration-150",
                              rowExpanded(row, i) && "rotate-180"
                            )}
                          />
                        </button>
                      ) : null}
                    </td>
                  ) : null}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={col.cellStyle}
                      className={cn(
                        cellPad,
                        "align-middle",
                        comfortable
                          ? cn(
                              "text-[13px] leading-snug",
                              !col.wrap && "whitespace-nowrap"
                            )
                          : compact
                            ? cn(
                                "text-[13px] leading-tight",
                                !col.wrap && "whitespace-nowrap",
                                "overflow-hidden"
                              )
                            : "whitespace-nowrap overflow-hidden",
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                            ? "text-center"
                            : "text-left",
                        col.cellClassName
                      )}
                    >
                      {col.render(row, i)}
                    </td>
                  ))}

                  {hasSpacer ? <td className="p-0" aria-hidden /> : null}

                  {hasAction ? (
                    // Zero-width sticky cell pinned to the right edge of the
                    // viewport. Its children are positioned absolutely so they
                    // float over the row (out of the 0-width cell) — the action
                    // stays in view while scrolling and nothing trails the last
                    // data column. Everything is revealed on hover only.
                    <td className="sticky right-0 z-[1] w-0 p-0 align-middle">
                      {/* The action itself — `rowAction(row, i)` so it always
                          receives this row's record. Vertically centered in the
                          row and anchored `actionGutter`px from the right edge,
                          overflowing left over the row content. Revealed on hover. */}
                      <span
                        className="absolute top-1/2 -translate-y-1/2 z-[1] inline-flex items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                        style={{ right: actionGutter }}
                      >
                        {rowAction != null ? (
                          typeof rowAction === "function" ? (
                            rowAction(row, i)
                          ) : (
                            rowAction
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => rowCta?.onClick?.(row)}
                            className={cn(
                              "inline-flex items-center font-medium text-foreground bg-card rounded-lg border border-border hover:border-muted-foreground/50 whitespace-nowrap shadow-sm",
                              compact
                                ? "px-2.5 py-1 text-[11px]"
                                : "px-3 py-1.5 text-[12px]"
                            )}
                          >
                            {rowCta?.label}
                          </button>
                        )}
                      </span>
                    </td>
                  ) : null}
                </tr>,

                // The panel spans every column, including the toggle, spacer and
                // action cells, so it reads as one band under its row rather
                // than as a cell inside the grid.
                rowExpanded(row, i) ? (
                  <tr
                    key={`${rowKeys[i]}__panel`}
                    className="border-b border-border/60 bg-muted/40 last:border-b-0 dark:bg-muted/25"
                  >
                    <td colSpan={totalColSpan} className="p-0 align-top">
                      <div
                        className="relative"
                        style={{ paddingLeft: expandIndent, paddingRight: cellPadLeft }}
                      >
                        {/* Connector: a hairline dropping from the chevron down
                            the panel. The row and its detail share a background
                            so they read as one block, which on its own leaves
                            nothing to say the lower half is derived rather than
                            more row content — this is that cue. Stops short of
                            the bottom so it reads as hanging, not as a border. */}
                        <span
                          aria-hidden
                          className="absolute top-0 bottom-4 w-px bg-border"
                          style={{ left: expandGuideLeft }}
                        />
                        {expandable!.render(row, i)}
                      </div>
                    </td>
                  </tr>
                ) : null,
              ])
            )}
          </tbody>
        </table>
      </div>

      {pager.showFooter && !isLoading && paginated.length > 0 && (
        <DataTableFooter
          pad={footerPad}
          summary={pager.summary}
          countLabels={pager.countLabels}
          leading={pager.leading}
          pageSizeOptions={pager.pageSizeOptions}
          pageSize={pager.pageSize}
          onPageSizeChange={pager.onPageSizeChange}
          from={from}
          rowCount={paginated.length}
          total={pager.total}
          page={pager.page}
          totalPages={pager.totalPages}
          hasNext={pager.hasNext}
          hasPrev={pager.hasPrev}
          onNext={pager.onNext}
          onPrev={pager.onPrev}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────

const PAGE_BUTTON =
  "w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-medium tabular-nums transition-colors";
const PAGE_BUTTON_IDLE =
  "text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed";
const PAGE_BUTTON_ACTIVE = "bg-primary text-primary-foreground shadow-sm";

/**
 * One footer for every pagination mode, so a cursor-paged grid and a
 * page-paged one are indistinguishable apart from the two things that
 * genuinely differ: the total, and how many page numbers can honestly be
 * offered.
 *
 * `totalPages` being `undefined` is what marks cursor mode — it means "nobody
 * knows", and the footer answers by numbering only the pages a cursor can
 * actually reach in one step (previous, current, next).
 */
function DataTableFooter({
  pad,
  summary,
  countLabels,
  leading,
  pageSizeOptions,
  pageSize,
  onPageSizeChange,
  from,
  rowCount,
  total,
  page,
  totalPages,
  hasNext,
  hasPrev,
  onNext,
  onPrev,
  onPageChange,
}: {
  pad: string;
  summary: DataTableFooterSummary;
  countLabels: { singular: string; plural: string };
  leading?: ReactNode;
  pageSizeOptions?: readonly number[];
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
  from: number;
  rowCount: number;
  total?: number;
  page: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  onPageChange: (page: number) => void;
}) {
  const isCursor = totalPages === undefined;
  /** 0 in cursor mode, where it is never read. */
  const pageCount = totalPages ?? 0;
  /**
   * A pager with nowhere to go is noise. In `page` mode that is a single page;
   * in `cursor` mode it is a page with nothing before or after it, which is the
   * closest thing to a page count a cursor response gives us.
   */
  const showPager = isCursor ? !!hasPrev || !!hasNext : pageCount > 1;
  const showRowsPerPage = !!pageSizeOptions?.length && !!onPageSizeChange;

  const start = from + 1;
  const end = total !== undefined ? Math.min(from + pageSize, total) : from + rowCount;

  /**
   * Which page numbers to draw.
   *
   * With a total, the full strip with ellipses — any page is one click away.
   * Without one, only `page - 1`, `page`, and `page + 1`: those are the pages
   * a cursor can step to, and a number the user cannot actually reach is worse
   * than no number at all. `page + 1` appears only when `hasNext` says there is
   * something there, so the strip itself is the signal that more data exists.
   */
  const pages: (number | "…")[] = isCursor
    ? [...(hasPrev ? [page - 1] : []), page, ...(hasNext ? [page + 1] : [])]
    : getPageRange(page, pageCount);

  const goPrev = () => (isCursor ? onPrev?.() : onPageChange(Math.max(1, page - 1)));
  const goNext = () => (isCursor ? onNext?.() : onPageChange(Math.min(pageCount, page + 1)));

  /**
   * With a total, the arrows are always drawn and go disabled at the ends — the
   * strip has a known width, so nothing moves. Without one, they are drawn only
   * when the page they point at is known to exist: a cursor response says
   * whether there is a next page, and an arrow that is permanently disabled
   * says less than no arrow at all.
   */
  const showPrev = isCursor ? !!hasPrev : true;
  const showNext = isCursor ? !!hasNext : true;
  const prevDisabled = isCursor ? false : page === 1;
  const nextDisabled = isCursor ? false : page === pageCount;

  /** In cursor mode a number is only ever one step away, so it maps to a step. */
  const goToNumber = (p: number) => {
    if (!isCursor) return onPageChange(p);
    if (p === page - 1) onPrev?.();
    else if (p === page + 1) onNext?.();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 flex-wrap border-t border-border",
        pad,
        summary === "none" && !showRowsPerPage && !leading ? "justify-end" : "justify-between"
      )}
    >
      {/* The rows-per-page picker and the summary group together on the left
          rather than becoming a third item that justify-between flings to its
          own corner. */}
      <div className="flex items-center gap-3">
        {leading}

        {showRowsPerPage ? (
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <span>Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange!(Number(v))}
            >
              <SelectTrigger size="sm" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions!.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {summary === "count" && total !== undefined ? (
          <span className="text-[12px] text-muted-foreground tabular-nums">
            <span className="font-medium text-foreground">{total.toLocaleString()}</span>{" "}
            {total === 1 ? countLabels.singular : countLabels.plural}
          </span>
        ) : summary === "range" ? (
          <span className="text-[12px] text-muted-foreground tabular-nums">
            Showing{" "}
            <span className="text-foreground font-medium">
              {Math.min(start, total ?? start)}–{end}
            </span>
            {/* No total, no "of N" and no results noun — cursor responses do not
                carry a count, and inventing one would be a lie the user would
                page against. */}
            {total !== undefined ? (
              <>
                {" "}
                of{" "}
                <span className="text-foreground font-medium">{total.toLocaleString()}</span>{" "}
                {total !== 1 ? "results" : "result"}
              </>
            ) : null}
          </span>
        ) : null}
      </div>

      {showPager && (
        <div className="flex items-center gap-1">
          {showPrev ? (
            <button
              type="button"
              aria-label="Previous page"
              onClick={goPrev}
              disabled={prevDisabled}
              className={cn(PAGE_BUTTON, PAGE_BUTTON_IDLE)}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          ) : null}

          {pages.map((p, idx) =>
            p === "…" ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-7 h-7 flex items-center justify-center text-[12px] text-muted-foreground select-none"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                aria-current={p === page ? "page" : undefined}
                onClick={() => goToNumber(p)}
                className={cn(PAGE_BUTTON, p === page ? PAGE_BUTTON_ACTIVE : PAGE_BUTTON_IDLE)}
              >
                {p}
              </button>
            )
          )}

          {showNext ? (
            <button
              type="button"
              aria-label="Next page"
              onClick={goNext}
              disabled={nextDisabled}
              className={cn(PAGE_BUTTON, PAGE_BUTTON_IDLE)}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ── Frozen columns ───────────────────────────────────────────────────────────

/**
 * The classes and offset for a column frozen to the left edge, so a grid that
 * pins its identifier columns does not have to reinvent the recipe. Five
 * feature files in the internal console had five copies of it, all carrying the
 * same two faults below.
 *
 * Spread the result onto the column:
 *
 * ```tsx
 * let left = 0;
 * columns.map((col) => {
 *   if (!FROZEN.includes(col.key)) return col;
 *   const frozen = { ...col, ...frozenColumn({ left, isLast: col.key === lastFrozen }) };
 *   left += widthOf(col);
 *   return frozen;
 * });
 * ```
 *
 * Two things it gets right that a hand-rolled version tends not to:
 *
 * **The background is opaque and is the table's own.** It has to be opaque or
 * the rows scrolling underneath show through the pinned block. It should not be
 * a tint, because a tint at full strength next to a row that highlights at 40%
 * makes the frozen block the heaviest thing on screen — the divider and the
 * shadow are what say "pinned", and the shadow is the honest signal anyway,
 * since it is what reads as content passing underneath.
 *
 * **It follows the row's hover.** The frozen cells are part of the row; pinning
 * them to a fixed colour makes a hovered row highlight in two different shades
 * and read as two rows. The hover colour is mixed rather than given an alpha,
 * for the same opacity reason.
 */
export function frozenColumn({
  left,
  right,
  isLast = false,
}: {
  /** Offset from the left edge in px — the widths of the frozen columns before this one. */
  left?: number;
  /** Offset from the right edge in px, for a column pinned to that side instead. */
  right?: number;
  /** The column at the boundary, which carries the divider and the shadow. */
  isLast?: boolean;
}): Pick<Column<unknown>, "cellClassName" | "cellStyle"> {
  // Pinned right is the trailing actions column; pinned left is the identifier
  // block. The divider and shadow face the scrolling content either way.
  const toRight = right !== undefined;

  /**
   * The divider and the shadow are pseudo-elements, NOT `border-r` and
   * `box-shadow`.
   *
   * That is not a style preference. Tailwind's Preflight sets
   * `border-collapse: collapse` on every table, and in the collapsed model a
   * cell's border belongs to the **table**, not the cell — so it is painted in
   * the table's layer and does not travel with a sticky cell. The border sits
   * still while the frozen column slides over the scrolling content, which
   * looks exactly like the divider vanishing the moment you scroll. A
   * `box-shadow` on the cell fails the same way.
   *
   * A pseudo-element paints inside the cell's own box, so it moves with it.
   * Both are anchored *inside* the cell's edge rather than hanging off it,
   * because the cell carries `overflow-hidden` at compact density and anything
   * outside would be clipped.
   *
   * That placement is why the gradient is kept deliberately slight — 4px at 7%,
   * barely a hairline of depth beside the divider. Sitting inside the cell, it
   * tints the pinned column itself rather than falling on the content passing
   * beneath, so anything heavier stops reading as a shadow and starts reading
   * as a smudge down the edge of the column. Dark mode carries more (35%)
   * because the same tint over a dark surface is close to invisible.
   */
  /**
   * Both branches are written out as complete literal class strings. Tailwind
   * scans source text for class names, so a name assembled at runtime —
   * `` `after:${edge}` `` — generates no CSS whatsoever. The duplication is the
   * price of the utilities existing at all.
   */
  const boundary = toRight
    ? [
        "after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-border",
        "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1",
        "before:opacity-0 before:transition-opacity before:duration-200",
        "before:bg-[linear-gradient(to_right,rgb(0_0_0/0.07),transparent)]",
        "dark:before:bg-[linear-gradient(to_right,rgb(0_0_0/0.35),transparent)]",
        "group-data-[scrolled-end=true]/table-scroll:before:opacity-100",
      ]
    : [
        "after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border",
        "before:pointer-events-none before:absolute before:inset-y-0 before:right-0 before:w-1",
        "before:opacity-0 before:transition-opacity before:duration-200",
        "before:bg-[linear-gradient(to_left,rgb(0_0_0/0.07),transparent)]",
        "dark:before:bg-[linear-gradient(to_left,rgb(0_0_0/0.35),transparent)]",
        "group-data-[scrolled-start=true]/table-scroll:before:opacity-100",
      ];

  return {
    cellStyle: toRight ? { right } : { left: left ?? 0 },
    cellClassName: cn(
      "sticky z-10 bg-card",
      // Follow the row's own hover rather than sitting at a fixed tint: the
      // frozen cells are part of the row, and a row that highlights in two
      // shades reads as two rows. Mixed to an opaque colour, never an alpha —
      // a translucent pinned cell lets the rows scrolling beneath show through.
      "group-hover:bg-[color-mix(in_oklab,var(--muted)_40%,var(--card))]",
      "dark:group-hover:bg-[color-mix(in_oklab,var(--muted)_25%,var(--card))]",
      isLast && boundary
    ),
  };
}
