"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, RotateCcw } from "lucide-react";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Separator } from "./separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { cn } from "./utils";

/**
 * A column as the manager sees it: a key and something to call it in the list.
 * `label` is separate from the table's `header` because a header can be a node
 * (an icon, a tooltip, a two-line stack) and this list needs plain text.
 */
export interface ManagedColumn {
  key: string;
  label: string;
}

export interface ColumnManagerProps {
  /** Every manageable column, in the table's *declared* order. */
  columns: ManagedColumn[];
  /** Current arrangement, as column keys. */
  order: string[];
  onOrderChange: (order: string[]) => void;
  /**
   * Column keys currently hidden. Omit — along with `onHiddenKeysChange` — to
   * drop the tick boxes entirely and keep this a reorder-only popover.
   */
  hiddenKeys?: string[];
  onHiddenKeysChange?: (hidden: string[]) => void;
  /**
   * Columns that cannot be **hidden**. Says nothing about where they sit — a
   * column the table cannot do without is still one the user may want to move.
   *
   * They keep a tick box rather than losing it, so the list reads as one set of
   * columns with some locked rather than as two lists — but the box is grey,
   * not primary, because nobody chose it.
   */
  fixedKeys?: string[];
  /**
   * Columns that cannot be **reordered**. Says nothing about whether they can
   * be hidden.
   *
   * The usual case is a frozen (sticky) column: its left offset is the running
   * total of the widths of the frozen columns before it, so the block only
   * works while they stay first and contiguous — drag one into the middle and
   * it keeps `left-0`, leaving a pinned column floating over the scrolling
   * ones. Hiding it is fine; that just shortens the block.
   *
   * A key can appear in both lists, and then neither control is offered.
   */
  pinnedKeys?: string[];
  /**
   * Why a fixed column cannot be hidden, shown on hover and focus. A disabled
   * control that stays silent leaves the user to guess whether they are doing
   * something wrong, so every caller should say something; the default is
   * deliberately generic so a missing one is still an answer.
   */
  fixedReason?: string;
  /**
   * Why a pinned column cannot be moved, shown on hover. Same reasoning as
   * `fixedReason`: a dead affordance should say why it is dead.
   */
  pinnedReason?: string;
  /**
   * Discards the saved arrangement so the table falls back to `columns`' own
   * order with nothing hidden. Separate from `onOrderChange` rather than
   * passing the default order through it, since "no saved preference" is its
   * own state in the caller, not just another arrangement.
   */
  onReset: () => void;
  /** Trigger label. Default "Columns". */
  label?: string;
  /** Render the trigger as an icon-only button — for a crowded toolbar. */
  iconOnly?: boolean;
  /** Extra classes on the trigger button. */
  className?: string;
  /** Popover alignment against the trigger. Default "end". */
  align?: "start" | "center" | "end";
}

interface ColumnVisibility {
  checked: boolean;
  /** Locked on, with a reason. Renders grey rather than as an active choice. */
  lockedReason?: string;
  onToggle: () => void;
}

/**
 * One row of the list.
 *
 * `useSortable` hands back a transform for *every* row, not just the one under
 * the pointer — which is what makes the others slide out of the way as the
 * dragged row passes them, instead of the list snapping to a new order. The
 * transition it supplies drives that animation, so both go straight onto the
 * element's style.
 */
function SortableColumnRow({
  id,
  label,
  visibility,
  pinned,
  pinnedReason,
}: {
  id: string;
  label: string;
  visibility?: ColumnVisibility;
  /** A fixed column: it cannot be dragged, and nothing can be dropped on it. */
  pinned?: boolean;
  /** Why, for the cursor's tooltip and the accessible name. */
  pinnedReason?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    // Both halves matter. `draggable` is the request — a fixed column cannot be
    // picked up. `droppable` is what makes it actually stay put: without it the
    // row is still a valid drop target, so dragging any other row onto it
    // pushes it down and the "fixed" column has moved after all.
    disabled: pinned ? { draggable: true, droppable: true } : undefined,
  });

  const style = {
    // A pinned row takes no transform at all, so it holds its place while the
    // movable rows animate around it.
    transform: pinned ? undefined : CSS.Transform.toString(transform),
    transition: pinned ? undefined : transition,
    // Above its neighbours while moving, so it slides over them rather than
    // disappearing behind the next row's background.
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-foreground",
        isDragging && "bg-muted opacity-90",
        // No hover affordance on a pinned row: there is nothing to pick up.
        !isDragging && !pinned && "hover:bg-muted/50"
      )}
    >
      {/* The drag listeners live on the grip and the label, not the row, so the
          tick box stays clickable instead of being swallowed by a drag.

          A pinned row gets neither listeners nor the grab cursor. The grip
          still renders, dimmed: dropping it would reflow the labels out of
          line with every other row, and a row with no grip at all reads as a
          different kind of thing rather than as this one, locked. */}
      {pinned ? (
        <span
          title={pinnedReason}
          aria-label={`${label} column is fixed in place`}
          className="flex min-w-0 flex-1 cursor-not-allowed items-center gap-2"
        >
          <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" />
          {/* The label keeps its normal colour even here. Only the grip dims:
              greying the text would read as "this row is disabled", which is
              wrong when its tick box is live. */}
          <span className="truncate">{label}</span>
        </span>
      ) : (
        <span
          className="flex min-w-0 flex-1 cursor-grab items-center gap-2 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{label}</span>
        </span>
      )}

      {visibility &&
        (visibility.lockedReason ? (
          /**
           * A locked column renders grey, not the primary blue a live tick
           * uses: blue says "you chose this", and nobody chose this. The
           * tooltip hangs off a wrapping span rather than the Checkbox, because
           * a disabled control receives no pointer events and a trigger on the
           * box itself would never fire. The span also carries the not-allowed
           * cursor and is focusable, so the reason is reachable by keyboard as
           * well as hover.
           */
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="shrink-0 cursor-not-allowed rounded-sm">
                  <Checkbox
                    checked
                    disabled
                    aria-label={`${label} column is always shown`}
                    className="pointer-events-none border-border opacity-100 data-[state=checked]:border-border data-[state=checked]:bg-muted-foreground/40 data-[state=checked]:text-foreground/70"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[15rem]">{visibility.lockedReason}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Checkbox
            checked={visibility.checked}
            onCheckedChange={visibility.onToggle}
            aria-label={`Show ${label} column`}
            className="shrink-0"
          />
        ))}
    </div>
  );
}

/**
 * Column manager: drag to reorder, tick to show or hide, with locked columns
 * and a reset. One implementation for every grid in every app, so a merchant
 * and an internal operator arrange their columns the same way.
 *
 * Reordering is @dnd-kit, the same stack the dashboard's widget grid uses, so
 * the rows animate out of each other's way as one is dragged past them. A
 * hand-rolled pointer drag can reorder the list correctly and still feel wrong:
 * without a per-row transform the rows simply teleport into their new slots,
 * and there is nothing to follow.
 *
 * dnd-kit is `external` in the build rather than bundled, because both
 * consuming apps already depend on it — two copies of `DndContext` in one app
 * is the kind of thing that breaks only in the app, never in the library.
 *
 * Keyboard users reorder without a mouse at all: Space picks a row up, the
 * arrows move it, Space drops it, Escape abandons it, and dnd-kit announces
 * each step as it goes.
 */
export function ColumnManager({
  columns,
  order,
  onOrderChange,
  hiddenKeys,
  onHiddenKeysChange,
  fixedKeys = [],
  pinnedKeys = [],
  fixedReason = "Always shown. The table needs this column to make sense.",
  pinnedReason = "Fixed in place. This column stays frozen at the left of the table.",
  onReset,
  label = "Columns",
  iconOnly = false,
  className,
  align = "end",
}: ColumnManagerProps) {
  const canToggleVisibility = !!hiddenKeys && !!onHiddenKeysChange;
  const hidden = useMemo(() => hiddenKeys ?? [], [hiddenKeys]);

  /**
   * Every key that cannot move — `pinnedKeys` and nothing else.
   *
   * Visibility and position are independent, and deliberately not inferred from
   * one another: a column the table cannot do without is very often one the
   * user is still free to put wherever they like (a transaction id), and a
   * column frozen to the left edge is very often one they are free to hide
   * (a merchant id on a single-merchant view). Folding either into the other
   * takes away a control for no reason the user can see.
   */
  const immovable = pinnedKeys;

  const byKey = useMemo(() => new Map(columns.map((c) => [c.key, c])), [columns]);
  /** The arrangement to draw: saved order, minus keys the table no longer has. */
  const ordered = useMemo(
    () => order.map((k) => byKey.get(k)).filter((c): c is ManagedColumn => !!c),
    [order, byKey]
  );

  /**
   * `columns` arrives in the caller's declared order with nothing hidden, which
   * is exactly what resetting falls back to — so comparing against it tells us
   * whether there is a custom arrangement to reset at all.
   */
  const isCustomised =
    order.join("|") !== columns.map((c) => c.key).join("|") || hidden.length > 0;

  const toggleVisibility = (key: string) => {
    if (!onHiddenKeysChange || fixedKeys.includes(key)) return;
    onHiddenKeysChange(
      hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key]
    );
  };

  /**
   * Drag sensors. The 4px activation distance is what keeps a *click* on the
   * grip from registering as a drag, so tapping a row does nothing rather than
   * nudging the order by a pixel.
   *
   * The keyboard sensor is the reason reordering is reachable without a mouse
   * at all: Space picks a row up, the arrows move it, Space drops it, Escape
   * abandons it — and dnd-kit announces each step to screen readers as it goes.
   */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /** The keys that can actually move, in their current order. */
  const movableKeys = useMemo(
    () => order.filter((k) => !immovable.includes(k)),
    [order, immovable]
  );

  /**
   * Reorders within the movable keys only, then puts them back around the fixed
   * ones, which keep their exact indices.
   *
   * A plain `arrayMove` over the whole list would not do: moving the last row to
   * the top shifts every key below it by one, fixed keys included — so a column
   * nobody is allowed to drag ends up somewhere new anyway. This moves the
   * dragged key through the movable slots and leaves the fixed slots alone.
   */
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const from = movableKeys.indexOf(active.id as string);
    const to = movableKeys.indexOf(over.id as string);
    if (from === -1 || to === -1) return;

    const moved = arrayMove(movableKeys, from, to);
    let next = 0;
    onOrderChange(order.map((key) => (immovable.includes(key) ? key : moved[next++])));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={iconOnly ? label : undefined}
          // The same grip glyph the draggable rows inside use, so the button
          // names the gesture it opens.
          leftIcon={<GripVertical className="h-3.5 w-3.5" />}
          className={cn(
            // Compact by default so it sits level with filter chips rather than
            // towering over them at Button's own `sm` height.
            "h-auto min-h-0 shrink-0 py-1 text-muted-foreground hover:text-foreground",
            className
          )}
        >
          {iconOnly ? null : label}
        </Button>
      </PopoverTrigger>

      {/* Bounded by the room Radix measures between the trigger and the
          viewport edge, not by a pixel cap: a grid with thirty columns used to
          render thirty rows in one tall popover, and the last of them — along
          with Reset — fell below the fold with no way to reach them. The hint
          line and the Reset footer stay put; only the list scrolls. */}
      <PopoverContent
        align={align}
        className="flex max-h-[var(--radix-popover-content-available-height)] w-56 flex-col overflow-hidden p-2"
      >
        <p className="shrink-0 px-2 pb-1.5 text-[11px] font-medium text-muted-foreground">
          {canToggleVisibility ? "Drag to reorder · tick to show" : "Drag to reorder"}
        </p>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          {/* Only the movable keys are sortable; a fixed one is neither a
              drag source nor a drop target. */}
          <SortableContext items={movableKeys} strategy={verticalListSortingStrategy}>
            <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
              {ordered.map((col) => (
                <SortableColumnRow
                  key={col.key}
                  id={col.key}
                  label={col.label}
                  pinned={immovable.includes(col.key)}
                  pinnedReason={pinnedReason}
                  visibility={
                    canToggleVisibility
                      ? {
                          checked: !hidden.includes(col.key),
                          // A fixed column keeps a box rather than having none,
                          // so the list reads as one set of columns with some
                          // locked, not two lists.
                          lockedReason: fixedKeys.includes(col.key) ? fixedReason : undefined,
                          onToggle: () => toggleVisibility(col.key),
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Secondary action, divided off from the list so it reads as an escape
            hatch rather than another draggable row. */}
        <Separator className="my-2 shrink-0" />
        {isCustomised ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="h-3 w-3" />}
            onClick={onReset}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            Reset to defaults
          </Button>
        ) : (
          /* Nothing to undo. A disabled button here would offer an action and
             then refuse it; saying the columns already are the default answers
             the question the button was raising. */
          <p className="px-2 py-1.5 text-[12px] text-muted-foreground">
            Columns are in their default order.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ── Preferences ─────────────────────────────────────────────────────────────

export interface ColumnPreferences {
  order: string[];
  hidden: string[];
}

export interface UseColumnPreferencesOptions {
  /**
   * `localStorage` key. Omit and the arrangement lives only for the session —
   * which is what a grid whose columns depend on the signed-in user's role
   * wants, since a saved order from another role would resurrect columns that
   * no longer exist.
   */
  storageKey?: string;
}

export interface UseColumnPreferencesResult extends ColumnPreferences {
  setOrder: (order: string[]) => void;
  setHidden: (hidden: string[]) => void;
  reset: () => void;
  /** Spread straight onto `<ColumnManager>`. */
  managerProps: Pick<
    ColumnManagerProps,
    "order" | "onOrderChange" | "hiddenKeys" | "onHiddenKeysChange" | "onReset"
  >;
}

/**
 * Owns a grid's column arrangement, optionally persisted.
 *
 * `defaultOrder` is the source of truth for which columns exist: a stored order
 * is reconciled against it on every read, so a column added in a release shows
 * up for someone who saved an arrangement before it existed, and a removed one
 * disappears instead of leaving a hole.
 */
export function useColumnPreferences(
  defaultOrder: string[],
  { storageKey }: UseColumnPreferencesOptions = {}
): UseColumnPreferencesResult {
  const defaultKey = defaultOrder.join("|");

  const [prefs, setPrefs] = useState<ColumnPreferences>({ order: defaultOrder, hidden: [] });

  /**
   * Read in an effect rather than a lazy initialiser: this package renders on
   * the server too, and reading `localStorage` during the first render would
   * make the server and client trees disagree.
   */
  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<ColumnPreferences>;
      const savedOrder = Array.isArray(saved.order) ? saved.order : [];
      const savedHidden = Array.isArray(saved.hidden) ? saved.hidden : [];
      const known = new Set(defaultOrder);
      setPrefs({
        // Keep the saved arrangement for columns that still exist, then append
        // anything new in its declared position at the end.
        order: [
          ...savedOrder.filter((k) => known.has(k)),
          ...defaultOrder.filter((k) => !savedOrder.includes(k)),
        ],
        hidden: savedHidden.filter((k) => known.has(k)),
      });
    } catch {
      // Corrupt or unreadable storage (private mode, a bad hand-edit) is not
      // worth breaking a table over — the default arrangement is a fine answer.
    }
    // `defaultKey` rather than `defaultOrder`: a column list rebuilt on every
    // render is a new array each time, which would re-read storage forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, defaultKey]);

  const persist = useCallback(
    (next: ColumnPreferences) => {
      setPrefs(next);
      if (!storageKey || typeof window === "undefined") return;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Storage full or blocked. The arrangement still applies this session.
      }
    },
    [storageKey]
  );

  const setOrder = useCallback(
    (order: string[]) => persist({ order, hidden: prefs.hidden }),
    [persist, prefs.hidden]
  );
  const setHidden = useCallback(
    (hidden: string[]) => persist({ order: prefs.order, hidden }),
    [persist, prefs.order]
  );
  const reset = useCallback(() => {
    setPrefs({ order: defaultOrder, hidden: [] });
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // See persist().
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, defaultKey]);

  return {
    order: prefs.order,
    hidden: prefs.hidden,
    setOrder,
    setHidden,
    reset,
    managerProps: {
      order: prefs.order,
      onOrderChange: setOrder,
      hiddenKeys: prefs.hidden,
      onHiddenKeysChange: setHidden,
      onReset: reset,
    },
  };
}

/**
 * Applies a saved arrangement to a built column list.
 *
 * `pinnedKeys` stay where they are declared regardless of the saved order —
 * for the trailing "action" column, which is a utility, not a data field
 * anybody wants to move. Columns missing from `order` (a field that only
 * exists for some roles, say) are appended before them rather than dropped.
 */
export function applyColumnPreferences<T extends { key: string }>(
  columns: T[],
  { order, hidden }: Partial<ColumnPreferences> = {},
  pinnedKeys: string[] = ["action"]
): T[] {
  const pinned = columns.filter((c) => pinnedKeys.includes(c.key));
  const movable = columns.filter((c) => !pinnedKeys.includes(c.key));

  const arranged = order?.length
    ? (() => {
        const byKey = new Map(movable.map((c) => [c.key, c]));
        const seen = order.map((k) => byKey.get(k)).filter((c): c is T => !!c);
        const missing = movable.filter((c) => !order.includes(c.key));
        return [...seen, ...missing];
      })()
    : movable;

  const visible = hidden?.length
    ? arranged.filter((c) => !hidden.includes(c.key))
    : arranged;

  return [...visible, ...pinned];
}
