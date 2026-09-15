"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Tabs, TabsList, TabsTrigger } from "./tabs";
import { cn } from "./utils";

/**
 * Two presets over the `Tabs` primitives, for the two jobs a tab row actually
 * does. They are separate components on purpose, so a page can show both
 * without the reader having to work out which row governs what:
 *
 * - {@link UnderlineTabs} is the **page-level** bar that segments a view into
 *   sections — full-width, one sliding indicator, the thing a URL usually
 *   follows.
 * - {@link SegmentedTabs} is the **compact scoping strip** for a required
 *   single choice that qualifies the content beside it: which status a list is
 *   filtered by, which period a summary describes.
 *
 * Neither is a filter chip. A chip is for an *optional* filter that can be
 * cleared; both of these always have exactly one option selected, so neither
 * ever renders a clear affordance.
 */

export interface UnderlineTab {
  value: string;
  /**
   * A plain string for an ordinary tab; a node when the tab carries an
   * annotation beside its name, such as a status badge showing the state of
   * the section behind it.
   */
  label: ReactNode;
}

/**
 * Page-level tab bar with a single shared indicator that slides between tabs,
 * rather than each tab drawing its own underline.
 *
 * The indicator's position and width are measured from the DOM: text tabs have
 * different widths, so this cannot be derived from props or state. It sits
 * flush on the row's own bottom border instead of floating below the label.
 *
 * `actions` renders flush right on the same row, tabs staying left-aligned,
 * which is where a page puts its primary CTA.
 */
export function UnderlineTabs({
  tabs,
  value,
  onValueChange,
  actions,
  className,
}: {
  tabs: readonly UnderlineTab[];
  value: string;
  onValueChange: (value: string) => void;
  actions?: ReactNode;
  className?: string;
}) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = tabRefs.current[value];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };
    // Deferred into a rAF / resize callback rather than called in the effect
    // body: it reads post-layout geometry, which is not derivable from render.
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [value]);

  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* `relative` here rather than on the row, so the indicator measures
            against the tab strip itself and is unaffected by `actions`. */}
        <TabsList className="relative h-auto justify-start gap-5 rounded-none border-0 bg-transparent p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              ref={(el) => {
                tabRefs.current[tab.value] = el;
              }}
              value={tab.value}
              className="h-auto rounded-none px-0 py-2.5 text-[13px] font-medium text-muted-foreground shadow-none data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
          <span
            aria-hidden
            className="absolute bottom-0 h-0.5 bg-primary transition-all duration-200 ease-out"
            style={{
              left: indicator?.left ?? 0,
              width: indicator?.width ?? 0,
              opacity: indicator ? 1 : 0,
            }}
          />
        </TabsList>

        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </Tabs>
  );
}

export interface SegmentedTabOption<T extends string = string> {
  value: T;
  label: string;
}

/**
 * The compact strip that scopes the content beside it.
 *
 * Plain underlined triggers, not the `Tabs` pill look: no container
 * background, border or padding — a gap row of triggers, each just an
 * underline and a colour change when active. Still Radix `Tabs` underneath, so
 * keyboard navigation and `aria-selected` come free; only the classes differ.
 *
 * With `collapseToSelect`, the strip becomes a `Select` below `md`. Both
 * controls drive the same state, so resizing mid-session can never leave the
 * two disagreeing about which option is chosen.
 */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onValueChange,
  label = "Options",
  collapseToSelect = true,
  className,
}: {
  options: readonly SegmentedTabOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Accessible name for both controls. */
  label?: string;
  /**
   * Swap to a `Select` below `md`. Leave on for a strip that would otherwise
   * crowd a narrow screen; turn it off where the row already has the room and
   * a dropdown would read as a different control appearing.
   */
  collapseToSelect?: boolean;
  className?: string;
}) {
  return (
    <>
      <Tabs
        value={value}
        onValueChange={(next) => onValueChange(next as T)}
        className={cn(collapseToSelect && "hidden md:block", className)}
      >
        <TabsList
          aria-label={label}
          className="h-auto gap-4 rounded-none border-0 bg-transparent p-0"
        >
          {options.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="h-auto rounded-none border-b-2 border-transparent px-0 py-1 text-[13px] font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {collapseToSelect ? (
        <Select value={value} onValueChange={(next) => onValueChange(next as T)}>
          <SelectTrigger className="h-8 w-[9.5rem] md:hidden" aria-label={label}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </>
  );
}
