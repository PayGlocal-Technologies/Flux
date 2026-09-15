"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { normalizePagination, type DataTablePagination } from "./data-table";
import { EmptyState } from "./empty-state";
import { Shimmer } from "./skeleton";
import { cn } from "./utils";

/**
 * The narrow-viewport counterpart to {@link DataTableCard}: the same records as
 * a stack of cards.
 *
 * It is a separate component rather than a mode of the table on purpose. A
 * card list is not a table with its columns hidden — it chooses a handful of
 * fields, gives them a hierarchy, and drops the rest. Folding that into
 * `DataTableCard` would mean one component carrying two layouts and a
 * breakpoint, and every table paying for props it does not use.
 *
 * Pair the two with CSS, not a media-query hook:
 *
 * ```tsx
 * <DataTableCard className="hidden lg:block" … />
 * <DataCardList className="lg:hidden" … />
 * ```
 *
 * Both render; CSS shows one. A JS breakpoint would have to start with a guess
 * on the server, so one cohort sees the wrong layout on first paint, and a
 * resize across the breakpoint unmounts the visible half — taking scroll
 * position and any open row with it.
 *
 * What it owns is the surface, not the card: the bordered container, the
 * loading skeletons, the empty state and the pager. Those are the four things
 * every hand-rolled card list in the apps reimplemented, and the four that had
 * drifted. The card itself stays with the feature, via `renderCard` — that is
 * the part that genuinely differs per record.
 */
export interface DataCardListProps<T> {
  rows: T[];
  rowKey: (row: T) => string;
  /** One record as a card. The only part a feature has to write. */
  renderCard: (row: T, index: number) => ReactNode;
  isLoading?: boolean;
  /**
   * The loading placeholder for one card. Omit for a generic card-shaped
   * shimmer — good enough for most lists, and worth replacing only where the
   * real card has a distinctive shape worth pre-announcing.
   */
  renderSkeleton?: (index: number) => ReactNode;
  skeletonCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  /**
   * Replaces the list when there are no rows — an illustrated placeholder,
   * typically. Same split as `DataTableCard`: the title/description pair is the
   * plain "nothing matched" state, this is the drawn first-run one.
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
  /**
   * The same {@link DataTablePagination} the table takes, so a list and the
   * table beside it cannot disagree about which page they are on. Rendered as
   * a compact Prev / Next pager rather than a numbered strip: a row of page
   * numbers is the first thing to go wrong on a phone.
   */
  pagination?: DataTablePagination;
  /** Wraps the list in the same bordered card the table uses. Default true. */
  bordered?: boolean;
  className?: string;
}

/** A generic card-shaped placeholder: a title line, two details, a value. */
function DefaultCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-center gap-2">
        <Shimmer className="h-4 w-40" />
        <Shimmer className="ml-auto h-3.5 w-5" rounded="sm" />
      </div>
      <Shimmer className="mt-2 h-3 w-28" />
      <Shimmer className="mt-1.5 h-3 w-44" />
      <Shimmer className="mt-2.5 h-3.5 w-32" />
    </div>
  );
}

export function DataCardList<T>({
  rows,
  rowKey,
  renderCard,
  isLoading = false,
  renderSkeleton,
  skeletonCount = 6,
  emptyTitle = "Nothing to show",
  emptyDescription,
  emptyState,
  errorState,
  pagination = { mode: "client" },
  bordered = true,
  className,
}: DataCardListProps<T>) {
  const pager = normalizePagination(pagination, rows.length, 1);

  // Only `client` mode holds every row, so only `client` mode slices; the
  // others were handed exactly this page. Same rule as the table.
  const page = pager.sliceLocally
    ? rows.slice((pager.page - 1) * pager.pageSize, pager.page * pager.pageSize)
    : rows;

  const isCursor = pager.totalPages === undefined;
  const hasPrev = isCursor ? !!pager.hasPrev : pager.page > 1;
  const hasNext = isCursor ? !!pager.hasNext : pager.page < (pager.totalPages ?? 1);

  const goPrev = () =>
    isCursor ? pager.onPrev?.() : pagination.mode === "page" && pagination.onPageChange(pager.page - 1);
  const goNext = () =>
    isCursor ? pager.onNext?.() : pagination.mode === "page" && pagination.onPageChange(pager.page + 1);

  const showPager =
    !errorState && pager.showFooter && !isLoading && page.length > 0 && (hasPrev || hasNext);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4",
        bordered && "rounded-xl border border-border bg-card",
        className
      )}
    >
      {errorState ? (
        errorState
      ) : isLoading ? (
        Array.from({ length: skeletonCount }).map((_, i) =>
          renderSkeleton ? (
            <div key={i}>{renderSkeleton(i)}</div>
          ) : (
            <DefaultCardSkeleton key={i} />
          )
        )
      ) : page.length === 0 ? (
        (emptyState ?? <EmptyState title={emptyTitle} description={emptyDescription} />)
      ) : (
        page.map((row, i) => <div key={rowKey(row)}>{renderCard(row, i)}</div>)
      )}

      {showPager && (
        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!hasPrev}
            onClick={goPrev}
            leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
          >
            Prev
          </Button>

          {/* No total in cursor mode, so no "of N" — the same honesty the
              table's own footer keeps. */}
          <span className="text-[12px] tabular-nums text-muted-foreground">
            Page {pager.page}
            {pager.totalPages !== undefined ? ` of ${pager.totalPages}` : ""}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!hasNext}
            onClick={goNext}
            rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
