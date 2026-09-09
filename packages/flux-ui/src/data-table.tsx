"use client";

import type { ReactNode } from "react";
import { cn } from "./utils";
import { TableRowSkeleton } from "./skeleton";
import { EmptyState } from "./empty-state";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export type DataTableDensity = "default" | "comfortable" | "compact";
export type DataTableHeaderStyle = "surface" | "minimal";
export type DataTableFooterSummary = "range" | "count";

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

export type Column<T> = {
  key: string;
  header: ReactNode;
  /** Table column width, e.g. `48px`, `18%`, `minmax(12rem,1fr)` (fixed layout) */
  width?: string;
  minWidth?: number;
  maxWidth?: number;
  align?: "left" | "right" | "center";
  /** Allow cell text to wrap instead of truncating. */
  wrap?: boolean;
  /** Extra classes on `<th>` / `<td>` (e.g. wider horizontal padding per column) */
  cellClassName?: string;
  render: (row: T, index: number) => ReactNode;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  skeletonRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  /** Controlled page number (1-indexed). Enables server-side pagination. */
  page?: number;
  /** Called when the user changes page in controlled mode. */
  onPageChange?: (page: number) => void;
  /** Total row count for server-side pagination (overrides data.length for page calculations). */
  totalRows?: number;
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
  /** Footer: paginated range vs simple `n items` */
  footerSummary?: DataTableFooterSummary;
  /** Noun after the count when `footerSummary="count"` (default singular / plural `item` / `items`). */
  footerCountLabels?: { singular: string; plural: string };
  /** With `density="compact"`, use tighter cell gutters (`pl-1.5 pr-2.5` vs `px-3`). Footer keeps normal horizontal padding. */
  snug?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  skeletonRows = 6,
  emptyTitle = "No data yet",
  emptyDescription,
  pageSize = 10,
  page: controlledPage,
  onPageChange,
  totalRows,
  className,
  rowKey,
  rowCta,
  rowAction,
  onRowClick,
  density = "default",
  tableLayout = "fixed",
  theadClassName,
  headerStyle = "surface",
  footerSummary = "range",
  footerCountLabels = { singular: "item", plural: "items" },
  snug = false,
}: DataTableProps<T>) {
  const isControlled = controlledPage !== undefined;
  const [internalPage, setInternalPage] = useState(1);
  const page = isControlled ? controlledPage : internalPage;
  const setPage = isControlled
    ? (p: number) => onPageChange?.(p)
    : (p: number) => setInternalPage(p);

  // The right-pinned row action. `rowAction` takes precedence over `rowCta`.
  // It is NOT a real column: it renders as a per-row overlay floating at the
  // right edge of the viewport (sticky), so the last data column stays flush
  // and there's no reserved/empty trailing column when scrolled to the end.
  const hasAction = rowAction != null || rowCta != null;

  // `content` layout: a greedy, empty trailing column that absorbs leftover
  // horizontal space so the data columns stay at their content (minimum)
  // width while the table still spans the full container width.
  const hasSpacer = tableLayout === "content";

  const total = totalRows ?? data.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginated = isControlled ? data : data.slice((page - 1) * pageSize, page * pageSize);

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

  /** Whether a click/keypress inside a row should reach `onRowClick`. */
  const isRowClickTarget = (target: EventTarget | null, rowEl: HTMLElement) => {
    if (!(target instanceof Element)) return false;
    const interactive = target.closest(ROW_CLICK_IGNORE);
    // `closest` can walk out of the row entirely (a portalled menu, say); only
    // a match inside THIS row means the click belonged to that control.
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
        className={cn(
          "overflow-x-auto",
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
          {tableLayout === "fixed" && (
            <colgroup>
              {columns.map((col) => (
                <col
                  key={col.key}
                  style={{
                    width: col.width ?? (col.minWidth != null ? `${col.minWidth}px` : undefined),
                    minWidth: col.minWidth,
                    maxWidth: col.maxWidth,
                  }}
                />
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
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    headPad,
                    headText,
                    "whitespace-nowrap align-middle",
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left",
                    col.cellClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
              {hasSpacer ? <th className="w-full p-0" aria-hidden /> : null}
              {hasAction ? (
                <th className="sticky right-0 z-[1] w-0 p-0" aria-hidden />
              ) : null}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRowSkeleton
                  key={i}
                  cols={columns.length}
                  density={density}
                  snug={snug}
                />
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasSpacer ? 1 : 0) + (hasAction ? 1 : 0)}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
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
                      "cursor-pointer focus-visible:outline-none focus-visible:bg-muted/40 dark:focus-visible:bg-muted/25"
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
                  {columns.map((col) => (
                    <td
                      key={col.key}
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && paginated.length > 0 && (
        <div
          className={cn(
            "flex items-center gap-4 flex-wrap border-t border-border",
            footerPad,
            footerSummary === "count" && totalPages <= 1
              ? "justify-start"
              : "justify-between"
          )}
        >
          {footerSummary === "count" ? (
            <span className="text-[12px] text-muted-foreground tabular-nums">
              <span className="font-medium text-foreground">{total}</span>{" "}
              {total === 1
                ? footerCountLabels.singular
                : footerCountLabels.plural}
            </span>
          ) : (
            <span className="text-[12px] text-muted-foreground tabular-nums">
              Showing{" "}
              <span className="text-foreground font-medium">
                {Math.min((page - 1) * pageSize + 1, total)}–
                {Math.min(page * pageSize, total)}
              </span>{" "}
              of{" "}
              <span className="text-foreground font-medium">
                {total.toLocaleString()}
              </span>{" "}
              {total !== 1 ? "results" : "result"}
            </span>
          )}

          {(footerSummary === "range" || footerSummary === "count") &&
            totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {getPageRange(page, totalPages).map((p, idx) =>
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
                    onClick={() => setPage(p as number)}
                    className={cn(
                      "w-7 h-7 rounded-md text-[12px] font-medium transition-colors tabular-nums flex items-center justify-center",
                      page === p
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
