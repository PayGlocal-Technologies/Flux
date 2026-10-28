"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "./input";
import { cn } from "./utils";

/** Height of one word slot, in px. The carousel translates by multiples of it. */
const WORD_HEIGHT = 20;
/** How long each word shows before the next slides in. */
const STEP_MS = 2500;
/** How long the duplicated first word rests before the silent jump back to the real one. */
const REST_MS = 2000;

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
 * With a single word there is nothing to cycle, so the hint is shown static.
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

  /**
   * One word has nothing to rotate to: it would only slide out and back in.
   * The hint is then static, "Search by Username".
   */
  const rotates = words.length > 1;

  // A new word list restarts the carousel rather than leaving the index
  // pointing into a list that no longer has that many entries.
  useEffect(() => {
    const timer = setTimeout(() => {
      setWithTransition(false);
      setIndex(0);
    }, 0);
    return () => clearTimeout(timer);
  }, [words.length]);

  /**
   * One timer at a time, scheduled from the word on screen. On the duplicated
   * first word (or anywhere past it) it rests, then snaps back to the real
   * first word with the transition off; otherwise it steps to the next word.
   *
   * It used to be a free-running step interval beside a separate snap-back
   * timeout that fired only on exactly the last index. A background tab
   * throttles timers, so the step could fire before the snap; the index then
   * ran past the end, the snap never matched again, and the hint scrolled out
   * of view for good, leaving only "Search by".
   */
  // Set by the snap back, so the first word's next step keeps the rhythm: the
  // rest has already spent most of a step on it.
  const justSnapped = useRef(false);
  useEffect(() => {
    if (!rotates) return;
    if (index >= words.length) {
      const timer = setTimeout(() => {
        justSnapped.current = true;
        setWithTransition(false);
        setIndex(0);
      }, REST_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(
      () => {
        justSnapped.current = false;
        setWithTransition(true);
        setIndex(index + 1);
      },
      justSnapped.current ? STEP_MS - REST_MS : STEP_MS
    );
    return () => clearTimeout(timer);
  }, [index, words.length, rotates]);

  /** Never further than the duplicated first word, so a hint is always in view. */
  const shownIndex = Math.min(index, words.length);

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
          {rotates ? (
            <div
              style={{
                transform: `translateY(-${shownIndex * WORD_HEIGHT}px)`,
                transition: withTransition ? "transform 2s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
              }}
            >
              {extendedWords.map((word, i) => (
                <div key={`${word}-${i}`} className="h-5 leading-5">
                  {word}
                </div>
              ))}
            </div>
          ) : (
            <span className="h-5 leading-5">{words[0]}</span>
          )}
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
