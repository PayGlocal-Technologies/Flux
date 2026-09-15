"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "./input";
import { cn } from "./utils";

/** Height of one word slot, in px. The carousel translates by multiples of it. */
const WORD_HEIGHT = 20;

export interface RotatingSearchInputProps {
  /** Controlled value. Omit to let the field own it. */
  value?: string;
  /** Fires on the debounced value, not on every keystroke. */
  onSearch: (value: string) => void;
  /** The hints to cycle through: "Amount", "Transaction ID", "Email". */
  words: string[];
  /** Debounce before `onSearch` fires. Default 300ms. */
  debounceDelay?: number;
  className?: string;
  /** Screen-reader name for the field. */
  ariaLabel?: string;
}

/**
 * The table search box: one field whose placeholder cycles through what it can
 * actually match — "Search by Amount", then "Transaction ID", then "Email".
 *
 * That rotation is the whole point. A single grid search usually spans half a
 * dozen fields, and a static "Search" placeholder tells the user none of them,
 * so they guess at what is searchable and conclude the box is broken when their
 * guess misses. Naming the fields in turn costs no space and answers it.
 *
 * `onSearch` is debounced, so a search that hits the network fires once the
 * user pauses rather than once per keystroke.
 */
export function RotatingSearchInput({
  value,
  onSearch,
  words,
  debounceDelay = 300,
  className,
  ariaLabel = "Search",
}: RotatingSearchInputProps) {
  const [internalValue, setInternalValue] = useState(value ?? "");
  const [index, setIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);

  /**
   * The latest handler, read at fire time. Without this the debounce closes
   * over the handler it was created with, so a search firing after a re-render
   * would call a stale one — and these handlers close over filter state.
   */
  const latestOnSearch = useRef(onSearch);
  useEffect(() => {
    latestOnSearch.current = onSearch;
  }, [onSearch]);

  const debouncedRef = useRef<{ (val: string): void; cancel(): void } | null>(null);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const debounced = (val: string) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => latestOnSearch.current(val), debounceDelay);
    };
    debounced.cancel = () => {
      if (timeout) clearTimeout(timeout);
    };
    debouncedRef.current = debounced;
    // Cancel on unmount, or a search fires into a component that is gone.
    return () => debounced.cancel();
  }, [debounceDelay]);

  // Mirror a controlled value. Deferred a tick so a parent that resets the
  // query while a debounce is in flight does not fight the field mid-keystroke.
  useEffect(() => {
    if (value === undefined) return;
    const timer = setTimeout(() => setInternalValue(value), 0);
    return () => clearTimeout(timer);
  }, [value]);

  /**
   * The first word again at the end, so the last-to-first step slides forward
   * like every other one instead of rewinding the whole list. The jump back to
   * the real first word then happens with the transition off, where it cannot
   * be seen.
   */
  const extendedWords = useMemo(
    () => (words.length === 0 ? [] : [...words, words[0]]),
    [words]
  );

  // A new word list restarts the carousel rather than leaving the index
  // pointing into a list that no longer has that many entries.
  useEffect(() => {
    const timer = setTimeout(() => {
      setWithTransition(false);
      setIndex(0);
    }, 0);
    return () => clearTimeout(timer);
  }, [words.length]);

  useEffect(() => {
    if (words.length === 0) return;
    const id = setInterval(() => {
      setWithTransition(true);
      setIndex((prev) => prev + 1);
    }, 2500);
    return () => clearInterval(id);
  }, [words.length]);

  // Landed on the duplicated first word: let it rest, then snap back to the
  // real one with the transition off.
  useEffect(() => {
    if (index !== words.length) return;
    const timer = setTimeout(() => {
      setWithTransition(false);
      setIndex(0);
    }, 2000);
    return () => clearTimeout(timer);
  }, [index, words.length]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    debouncedRef.current?.(e.target.value);
  };

  return (
    <div className={cn("relative", className)}>
      {/* The rotating hint is an overlay, not the input's own `placeholder`,
          because a placeholder cannot animate. It is pointer-events-none so it
          never eats a click meant for the field, and it is dropped entirely
          once there is a value to avoid sitting behind the user's text. */}
      {!internalValue && words.length > 0 && (
        <div className="pointer-events-none absolute left-8 top-1/2 z-10 flex h-5 -translate-y-1/2 items-start gap-1 overflow-hidden text-xs text-muted-foreground">
          <span className="h-5 shrink-0 leading-5">Search by</span>
          <div
            style={{
              transform: `translateY(-${index * WORD_HEIGHT}px)`,
              transition: withTransition ? "transform 2s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
            }}
          >
            {extendedWords.map((word, i) => (
              <div key={`${word}-${i}`} className="h-5 leading-5">
                {word}
              </div>
            ))}
          </div>
        </div>
      )}

      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />

      <Input
        type="text"
        aria-label={ariaLabel}
        value={internalValue}
        placeholder=""
        onChange={handleChange}
        className="!h-8 min-h-0 bg-muted/50 pl-8 text-xs"
      />
    </div>
  );
}
