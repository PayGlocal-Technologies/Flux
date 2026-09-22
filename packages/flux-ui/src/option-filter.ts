/**
 * Shared option-search behaviour for the select family.
 *
 * Every picker that can be searched matches the same way, so a user who learns
 * that typing a raw code works in one dropdown can rely on it in the next.
 */

export interface FilterableOption {
  value: string;
  label: string;
}

/**
 * A custom match. Return true to keep the option in the list.
 *
 * The `query` arrives trimmed but otherwise untouched, so a predicate that
 * cares about case can have it.
 */
export type OptionFilter<T extends FilterableOption = FilterableOption> = (
  option: T,
  query: string
) => boolean;

/**
 * The default: case-insensitive against the label **and** the value, so "nz"
 * finds New Zealand and a raw status code finds its prettified row. Someone who
 * thinks in codes should not have to know the display name.
 *
 * This is the rule `SelectFilterChip` already applied to its list; the form
 * fields now share it rather than each picker inventing its own.
 */
export function defaultOptionFilter<T extends FilterableOption>(option: T, query: string): boolean {
  const q = query.toLowerCase();
  return option.label.toLowerCase().includes(q) || option.value.toLowerCase().includes(q);
}

/** Applies `filter` (or the default) to `options`, with an empty query passing everything. */
export function filterOptions<T extends FilterableOption>(
  options: T[],
  query: string,
  filter?: OptionFilter<T>
): T[] {
  const q = query.trim();
  if (!q) return options;
  const match = filter ?? defaultOptionFilter;
  return options.filter((o) => match(o, q));
}
