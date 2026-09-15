import { describe, expect, it, beforeAll } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useState } from "react";
import {
  DateRangeFilterChip,
  FilterToolbar,
  SelectFilterChip,
  AddFilterMenu,
  FilterChipGroup,
  useFilterChipState,
} from "../filter-chips";

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
  // Radix measures the trigger to position the popover.
  if (!(globalThis as any).ResizeObserver) {
    (globalThis as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

// The real toolbar has ~10 options per category, which crosses
// SelectFilterChip's searchThreshold and renders a search box in the panel.
const MANY = Array.from({ length: 10 }, (_, i) => ({
  value: `v${i}`,
  label: `Option ${i}`,
}));

/** Mirrors TxnFilters: search, Date chip, two category chips, an add menu. */
function Toolbar() {
  const [date, setDate] = useState({ from: "", to: "" });
  const [type, setType] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);
  return (
    <FilterToolbar
      search={<input aria-label="Search" />}
      chips={
        <>
          <DateRangeFilterChip value={date} onChange={setDate} />
          <SelectFilterChip label="Transaction Type" options={MANY} selected={type} onChange={setType} />
          <SelectFilterChip label="Transaction Status" options={MANY} selected={status} onChange={setStatus} />
          <AddFilterMenu filters={[{ key: "x", label: "Country", options: MANY }]} onAddFilter={() => {}} />
        </>
      }
    />
  );
}

function press(el: Element) {
  fireEvent.pointerDown(el, { pointerType: "mouse", button: 0, bubbles: true });
  fireEvent.mouseDown(el, { button: 0, bubbles: true });
  fireEvent.pointerUp(el, { pointerType: "mouse", button: 0, bubbles: true });
  fireEvent.mouseUp(el, { button: 0, bubbles: true });
  fireEvent.click(el, { button: 0, bubbles: true });
}

const which = () =>
  screen.queryAllByPlaceholderText(/^Search /).map((i) => i.getAttribute("placeholder"));

describe("switching straight between two open chips", () => {
  it("closes the first and leaves the second open", async () => {
    render(<Toolbar />);

    press(screen.getByRole("button", { name: /Transaction Type/ }));
    await waitFor(() => expect(which()).toContain("Search transaction type"));
    console.log("after opening Type   :", which());

    press(screen.getByRole("button", { name: /Transaction Status/ }));
    await new Promise((r) => setTimeout(r, 300));
    console.log("after clicking Status:", which());

    expect(which()).toEqual(["Search transaction status"]);
  });
});

describe("the handoff", () => {
  it("never has two chip popovers open at once", async () => {
    render(<Toolbar />);

    press(screen.getByRole("button", { name: /Transaction Type/ }));
    await waitFor(() => expect(which()).toContain("Search transaction type"));

    press(screen.getByRole("button", { name: /Transaction Status/ }));

    // Sample across the handoff frame; at no point should both be mounted.
    for (let i = 0; i < 20; i++) {
      expect(which().length).toBeLessThanOrEqual(1);
      await new Promise((r) => setTimeout(r, 20));
    }
    expect(which()).toEqual(["Search transaction status"]);
  });

  it("still closes on a second click of the same chip", async () => {
    render(<Toolbar />);
    const type = screen.getByRole("button", { name: /Transaction Type/ });

    press(type);
    await waitFor(() => expect(which().length).toBe(1));
    press(type);
    await waitFor(() => expect(which().length).toBe(0));
  });
});

/**
 * The regression this file exists for.
 *
 * Radix restores focus to a popover's trigger on close, skipping it only when
 * the popover was dismissed by an *outside interaction*. A handoff is neither:
 * the group closes the outgoing chip programmatically, so Radix restores focus
 * to its trigger — which lands outside the chip now opening and makes Radix
 * dismiss that one. The chip appears and vanishes.
 */
describe("handoff focus suppression", () => {
  it("suppresses the outgoing chip's focus restore exactly once", async () => {
    const seen: Array<{ key: string; prevented: boolean }> = [];

    function Probe() {
      const a = useFilterChipState("a");
      const b = useFilterChipState("b");
      return (
        <>
          <button onClick={() => a.onOpenChange(true)}>open a</button>
          <button onClick={() => b.onOpenChange(true)}>open b</button>
          <button
            onClick={() => {
              for (const [key, chip] of [
                ["a", a],
                ["b", b],
              ] as const) {
                const e = new Event("x", { cancelable: true });
                chip.onCloseAutoFocus(e);
                seen.push({ key, prevented: e.defaultPrevented });
              }
            }}
          >
            close-auto-focus
          </button>
        </>
      );
    }

    render(
      <FilterChipGroup>
        <Probe />
      </FilterChipGroup>
    );

    fireEvent.click(screen.getByText("open a"));
    fireEvent.click(screen.getByText("open b")); // handoff: a -> b
    fireEvent.click(screen.getByText("close-auto-focus"));

    // Only the chip handed off from suppresses its focus restore.
    expect(seen).toEqual([
      { key: "a", prevented: true },
      { key: "b", prevented: false },
    ]);

    // And only once — a later close must restore focus normally.
    seen.length = 0;
    fireEvent.click(screen.getByText("close-auto-focus"));
    expect(seen).toEqual([
      { key: "a", prevented: false },
      { key: "b", prevented: false },
    ]);
  });
});

/**
 * Both footer buttons commit and close. Clear used to reset only the draft and
 * leave the panel open, so the chip still read "Type 1" while the list in front
 * of you showed nothing ticked — and closing the panel kept the old filter.
 */
describe("the Apply / Clear footer", () => {
  function ApplyClearToolbar() {
    const [type, setType] = useState<string[]>([]);
    return (
      <FilterToolbar
        chips={<SelectFilterChip label="Type" options={MANY} selected={type} onChange={setType} />}
      />
    );
  }

  const openTypeChip = async () => {
    fireEvent.click(screen.getByRole("button", { name: /^Type/ }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeTruthy());
  };

  it("Apply commits the draft and closes", async () => {
    render(<ApplyClearToolbar />);
    await openTypeChip();
    fireEvent.click(screen.getByText("Option 1"));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeFalsy());
    expect(screen.getByRole("button", { name: /^Type/ }).textContent).toContain("1");
  });

  it("Clear drops the applied filter and closes", async () => {
    render(<ApplyClearToolbar />);
    await openTypeChip();
    fireEvent.click(screen.getByText("Option 1"));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeFalsy());

    await openTypeChip();
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeFalsy());
    expect(screen.getByRole("button", { name: /^Type/ }).textContent).not.toContain("1");
  });

  it("Clear stays live over an applied filter whose draft has been emptied", async () => {
    render(<ApplyClearToolbar />);
    await openTypeChip();
    fireEvent.click(screen.getByText("Option 1"));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeFalsy());

    await openTypeChip();
    // Untick it again: the draft is empty but there is still a filter applied.
    fireEvent.click(screen.getByText("Option 1"));
    const clear = screen.getByRole("button", { name: "Clear" }) as HTMLButtonElement;
    expect(clear.disabled).toBe(false);
  });
});
