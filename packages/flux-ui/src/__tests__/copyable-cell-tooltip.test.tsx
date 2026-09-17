import { describe, expect, it, beforeAll, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { CopyableCell } from "../copyable-cell";

/**
 * The full value belongs to the text that was shortened, not to the copy
 * button. Reading an id used to mean hovering the control that copies it.
 */

const FULL = "286234f3-6b18-4445-ba1f-0c814f154b0e";
const SHORT = "286234f3-6b1…4f154b0e";

beforeAll(() => {
  if (!(globalThis as any).PointerEvent) {
    class PE extends MouseEvent {
      pointerType: string;
      constructor(type: string, props: any = {}) {
        super(type, props);
        this.pointerType = props.pointerType ?? "mouse";
      }
    }
    (globalThis as any).PointerEvent = PE;
  }
  if (!(globalThis as any).ResizeObserver) {
    (globalThis as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  if (!(globalThis as any).DOMRect) {
    (globalThis as any).DOMRect = class {
      constructor(public x = 0, public y = 0, public width = 0, public height = 0) {}
    };
  }
});

describe("CopyableCell tooltips", () => {
  it("shows the whole value from the elided text, not from the copy button", async () => {
    render(<CopyableCell value={FULL} display={SHORT} label="Payout ID" />);

    // The copy button says what it does, and no longer carries the value.
    const button = screen.getByRole("button", { name: "Copy Payout ID" });
    fireEvent.pointerEnter(button);
    fireEvent.focus(button);
    await waitFor(() => expect(screen.getAllByText("Copy Payout ID").length).toBeGreaterThan(0));
    expect(screen.queryByText(`Copy ${FULL}`)).toBeNull();

    // Hovering the text is what reveals the id.
    fireEvent.pointerEnter(screen.getByText(SHORT));
    await waitFor(() => expect(screen.getAllByText(FULL).length).toBeGreaterThan(0));
  });

  it("does not add a tooltip when nothing was elided", async () => {
    render(<CopyableCell value="SHORTID" label="Batch" />);

    const text = screen.getByText("SHORTID");
    // The native title still covers a value the column's own truncate may cut.
    expect(text.getAttribute("title")).toBe("SHORTID");
    expect(text.getAttribute("aria-hidden")).toBeNull();
  });

  it("gives a screen reader the whole value, once", () => {
    const { container } = render(<CopyableCell value={FULL} display={SHORT} />);

    // The elided form is decorative; the sr-only twin is what gets read.
    expect(screen.getByText(SHORT).getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector(".sr-only")?.textContent).toBe(FULL);
  });

  it("names a clickable value with the full id instead of the elided one", () => {
    const onClick = vi.fn();
    render(<CopyableCell value={FULL} display={SHORT} onClick={onClick} />);

    const link = screen.getByRole("button", { name: FULL });
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalled();
    // No second copy of the value for a control that already names itself.
    expect(link.parentElement?.querySelector(".sr-only")).toBeNull();
  });
});
