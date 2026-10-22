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
});
