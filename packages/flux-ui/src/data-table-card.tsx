"use client";

import type { CSSProperties, ReactNode } from "react";
import { DataTable } from "./data-table";
import type {
  Column,
  DataTableDensity,
  DataTableExpandable,
  DataTablePagination,
  DataTableSorting,
} from "./data-table";
import { cn } from "./utils";

/**
 * The canonical table surface: one bordered card holding a title, tabs, a
 * filter toolbar, the grid, and a footer — in that order, with the same
 * dividers and gutters every time.
 *
 * `DataTable` on its own is the grid. This is everything around it, and it
 * exists because that surrounding chrome is where tables actually drift: one
 * feature puts its filters above the card, another inside it; one draws a
 * divider under the tabs, another does not; one pads the toolbar `py-3` and the
 * next `py-2.5`. None of that is a decision a feature should be making.
 *
 * Pagination goes through `pagination`, in every mode — including cursor APIs
 * that carry no row total. The `footer` slot is for a footer that is genuinely
 * not a pager; passing one hides the table's own.
 */
export interface DataTableCardProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  /**
   * Section title. For a grid that names itself — an analytics section like
   * "Top 10 Merchants by Volume" — rather than a page-level grid, whose name is
   * the page header. Renders above `tabs`.
   */
  title?: string;
  /** One line under the title. Only meaningful with `title`. */
  description?: string;
  /** Controls on the title row, flush right (a period toggle, Refresh, …). */
  actions?: ReactNode;
  /** Tab bar near the top of the card, above the toolbar. */
  tabs?: ReactNode;
  /** Filters / search / action buttons, as a row inside the card top. */
  toolbar?: ReactNode;
  /**
   * A non-pager footer inside the card bottom. Hides the table's own footer, so
   * do NOT use it for pagination — that is what `pagination` is for, in every
   * mode. Hand-rolling a pager here is how two different pagers end up in one
   * app.
   */
  footer?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  /**
   * Replaces the grid when there are no rows — an illustrated placeholder,
   * typically.
   *
   * `emptyTitle` / `emptyDescription` give the table's own text-only empty
   * state, which keeps the column headers and is right for "nothing matched
   * your filters". This is for the first-run case, where there is no data yet
   * because none has ever existed, and a drawn state says that better than a
   * header row over nothing.
   */
  emptyState?: ReactNode;
  /**
   * Replaces the rows entirely when the request failed.
   *
   * Distinct from an empty result with error-worded copy: that keeps the
   * column headers, which is right for "nothing matched" and wrong for "we
   * could not load this" — headers imply data was fetched and found empty.
   */
  errorState?: ReactNode;
  /** See {@link DataTablePagination}. Omit for client-side paging at 10/page. */
  pagination?: DataTablePagination;
  /** See {@link DataTableSorting}. */
  sorting?: DataTableSorting;
  rowAction?: ReactNode | ((row: T, index: number) => ReactNode);
  /**
   * Makes the whole row a click target, for a grid that drills into a detail
   * view. Passed straight through, so it brings the keyboard affordances with
   * it and does not fire for clicks landing on a button, link or form control
   * inside a cell.
   */
  onRowClick?: (row: T, index: number) => void;
  /** Defaults to "content"; pass "fixed" for grids with frozen sticky columns. */
  tableLayout?: "auto" | "fixed" | "content";
  /** Per-row disclosure panel rendered beneath the row. */
  expandable?: DataTableExpandable<T>;
  /** Row rhythm. Defaults to `compact`, which is what a data-dense grid wants. */
  density?: DataTableDensity;
  skeletonRows?: number;
  /**
   * CSS max-height for the internally scrolling body, so the toolbar and footer
   * stay put while the rows scroll and the page itself does not grow.
   *
   * The default assumes a page header plus this card's toolbar; a card that
   * also carries a `tabs` row needs a smaller cap, or the page starts scrolling
   * as well. Pass `"none"` to let the card grow with its content instead.
   */
  maxBodyHeight?: string;
  className?: string;
}

export function DataTableCard<T>({
  columns,
  data,
  rowKey,
  isLoading,
  title,
  description,
  actions,
  tabs,
  toolbar,
  footer,
  emptyTitle,
  emptyDescription,
  emptyState,
  errorState,
  pagination,
  sorting,
  rowAction,
  onRowClick,
  tableLayout = "content",
  expandable,
  density = "compact",
  skeletonRows = 8,
  maxBodyHeight = "calc(100vh - 260px)",
  className,
}: DataTableCardProps<T>) {
  const capped = maxBodyHeight !== "none";
  /** The illustrated stand-in only applies once loading has settled. */
  const showEmptyState = !!emptyState && !isLoading && data.length === 0;

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}
      style={
        capped ? ({ ["--dtc-max-body" as string]: maxBodyHeight } as CSSProperties) : undefined
      }
    >
      {title && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3.5">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}

      {tabs && <div className="border-b border-border px-4 pt-3">{tabs}</div>}
      {toolbar && <div className="border-b border-border px-4 py-3">{toolbar}</div>}

      {errorState}
      {!errorState && showEmptyState && emptyState}

      <DataTable<T>
        className={cn(
          (showEmptyState || errorState) && "hidden",
          // The card already draws the border and radius; a second set inside
          // it would read as a table nested in a card.
          "rounded-none border-0",
          footer && "[&>.border-t]:hidden",
          // Cap the scroll container so the body scrolls internally while the
          // toolbar and footer stay fixed. The cap comes from an inline custom
          // property rather than a class, so a caller's `className` override
          // cannot depend on class-merge order.
          capped &&
            "[&>div:first-child]:max-h-[var(--dtc-max-body)] [&>div:first-child]:overflow-y-auto"
        )}
        // The header sticks to the top of that scroll area, which is only
        // meaningful while the body actually scrolls.
        theadClassName={capped ? "sticky top-0 z-20 [&_th]:bg-card" : undefined}
        tableLayout={tableLayout}
        columns={columns}
        data={data}
        isLoading={isLoading}
        rowKey={rowKey}
        skeletonRows={skeletonRows}
        density={density}
        pagination={pagination}
        sorting={sorting}
        rowAction={rowAction}
        onRowClick={onRowClick}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        expandable={expandable}
      />

      {footer && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}

/** Right-aligned group for toolbar action buttons. */
export function TableToolbarActions({ children }: { children: ReactNode }) {
  return <div className="ml-auto flex items-center gap-2">{children}</div>;
}
