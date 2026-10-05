import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Calendar } from "../calendar";

/**
 * `fullWidth` stretches the calendar to its container and drops the square
 * cells (wide cells keep the default height); without it the calendar keeps
 * its content-sized, square-cell layout.
 */

const MONTH = new Date(2026, 9, 1);

function root(container: HTMLElement): HTMLElement {
  return container.querySelector<HTMLElement>('[data-slot="calendar"]')!;
}

describe("Calendar fullWidth", () => {
  it("sizes to content with square cells by default", () => {
    const { container } = render(<Calendar mode="single" defaultMonth={MONTH} />);
    expect(root(container).className).toContain("w-fit");
    expect(root(container).hasAttribute("data-full-width")).toBe(false);
    const day = container.querySelector("td[data-day]") ?? container.querySelector("td");
    expect(day?.className).toContain("aspect-square");
  });

  it("stretches to its container and drops square cells when set", () => {
    const { container } = render(<Calendar mode="single" fullWidth defaultMonth={MONTH} />);
    expect(root(container).className).toContain("w-full");
    expect(root(container).getAttribute("data-full-width")).toBe("true");
    const day = container.querySelector("td[data-day]") ?? container.querySelector("td");
    expect(day?.className).not.toContain("aspect-square");
    expect(day?.className).toContain("h-[var(--cell-size)]");
  });
});
