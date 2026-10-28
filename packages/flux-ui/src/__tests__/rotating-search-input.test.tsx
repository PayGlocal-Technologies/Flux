import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { RotatingSearchInput } from "../rotating-search-input";

/** One word is a static hint; two or more rotate. */

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("RotatingSearchInput", () => {
  it("shows a single word statically, with no carousel", () => {
    const { container } = render(<RotatingSearchInput words={["Username"]} onSearch={() => {}} />);
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.getAllByText("Username")).toHaveLength(1);
    expect(container.querySelector("[style*='translateY']")).toBeNull();
  });

  it("rotates through several words", () => {
    const { container } = render(<RotatingSearchInput words={["Amount", "Email"]} onSearch={() => {}} />);
    const track = () => container.querySelector<HTMLElement>("[style*='translateY']");
    expect(track()?.style.transform).toBe("translateY(-0px)");
    act(() => vi.advanceTimersByTime(2500));
    expect(track()?.style.transform).toBe("translateY(-20px)");
  });

  it("steps through every word and comes back to the first", () => {
    const { container } = render(
      <RotatingSearchInput words={["Exception ID", "RRN", "ARN"]} onSearch={() => {}} />
    );
    const slot = () => shownSlot(container);
    act(() => vi.advanceTimersByTime(0));
    expect(slot()).toBe(0);
    act(() => vi.advanceTimersByTime(2500));
    expect(slot()).toBe(1);
    act(() => vi.advanceTimersByTime(2500));
    expect(slot()).toBe(2);
    act(() => vi.advanceTimersByTime(2500));
    // The duplicated first word, then the silent jump back to the real one.
    expect(slot()).toBe(3);
    act(() => vi.advanceTimersByTime(2000));
    expect(slot()).toBe(0);
    act(() => vi.advanceTimersByTime(500));
    expect(slot()).toBe(1);
  });

  it("never scrolls past the last slot, however late the timers run", () => {
    const words = ["Exception ID", "RRN", "ARN"];
    const { container } = render(<RotatingSearchInput words={words} onSearch={() => {}} />);
    // A background tab: timers fire in late bursts instead of on time. The old
    // step interval then overtook the snap back and the hint scrolled away.
    for (let i = 0; i < 40; i++) {
      act(() => vi.advanceTimersByTime(60_000));
      expect(shownSlot(container)).toBeLessThanOrEqual(words.length);
    }
  });
});

/** How many word slots the carousel is scrolled up by. */
function shownSlot(container: HTMLElement): number {
  const track = container.querySelector<HTMLElement>("[style*='translateY']");
  const match = track?.style.transform.match(/translateY\(-?(\d+)px\)/);
  return match ? Number(match[1]) / 20 : 0;
}
