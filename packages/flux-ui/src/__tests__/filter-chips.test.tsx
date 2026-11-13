import { describe, expect, it, beforeAll } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useState } from "react";
import {
  type DateRangeValue,
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
  // jsdom has no scrollTo; the time columns scroll their selected row up.
  if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo = function () {};
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

  it("Clear drops the applied filter and stays open", async () => {
    render(<ApplyClearToolbar />);
    await openTypeChip();
    fireEvent.click(screen.getByText("Option 1"));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeFalsy());

    await openTypeChip();
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    // The panel stays up, emptied, ready for a new pick.
    expect(screen.getByRole("dialog")).toBeTruthy();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Type/ }).textContent).not.toContain("1"),
    );
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

describe("DateRangeFilterChip withTime", () => {
  it("shows the applied clocks and reports them on Apply", async () => {
    const calls: unknown[] = [];
    render(
      <DateRangeFilterChip
        withTime
        value={{ from: "2026-11-01", to: "2026-11-02", fromTime: "10:00", toTime: "18:30" }}
        onChange={(next) => calls.push(next)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Date:.*10:00 AM.*6:30 PM/ }));
    // antd style: pick the End tab, then click hour 08 and minute 15 (it is already PM).
    fireEvent.click(await screen.findByRole("button", { name: /^End/ }));
    // Hour column comes first; minutes also have an 08.
    fireEvent.click(screen.getAllByRole("button", { name: "08" })[0]!);
    fireEvent.click(screen.getByRole("button", { name: "15" }));
    // Staged until Apply.
    expect(calls).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(calls).toEqual([
      { from: "2026-11-01", to: "2026-11-02", fromTime: "10:00", toTime: "20:15" },
    ]);
  });

  it("fills the default clocks and keeps whole days out of the label", async () => {
    const calls: unknown[] = [];
    render(
      <DateRangeFilterChip
        withTime
        value={{ from: "2026-11-01", to: "2026-11-02" }}
        onChange={(next) => calls.push(next)}
      />,
    );
    const trigger = screen.getByRole("button", { name: /^Date:/ });
    expect(trigger.textContent).not.toMatch(/AM|PM/);
    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole("button", { name: "Apply" }));
    expect(calls).toEqual([
      { from: "2026-11-01", to: "2026-11-02", fromTime: "00:00", toTime: "23:59" },
    ]);
  });

  it("blocks Apply when a one-day range ends before it starts", async () => {
    render(
      <DateRangeFilterChip
        withTime
        value={{ from: "2026-11-01", to: "2026-11-01", fromTime: "18:00", toTime: "09:00" }}
        onChange={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Date:/ }));
    expect(await screen.findByText("The end time must be after the start time.")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Apply" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("leaves a date-only chip's value without clocks", async () => {
    const calls: unknown[] = [];
    render(
      <DateRangeFilterChip
        value={{ from: "2026-11-01", to: "2026-11-02" }}
        onChange={(next) => calls.push(next)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Date:/ }));
    expect(screen.queryByText("AM/PM")).toBeNull();
    fireEvent.click(await screen.findByRole("button", { name: "Apply" }));
    expect(calls).toEqual([{ from: "2026-11-01", to: "2026-11-02" }]);
  });
});

describe("DateRangeFilterChip picking", () => {
  function DateHarness({ withTime = false }: { withTime?: boolean }) {
    const [value, setValue] = useState({ from: "2026-11-06", to: "2026-11-13" });
    return (
      <>
        <DateRangeFilterChip withTime={withTime} value={value} onChange={setValue} />
        <output data-testid="applied">{`${value.from}|${value.to}`}</output>
      </>
    );
  }
  const day = (n: number) =>
    screen.getAllByRole("button").find((b) => b.textContent === String(n) && !b.closest("[data-outside]"))!;

  it("Clear empties the range and keeps the popup open", async () => {
    render(<DateHarness />);
    fireEvent.click(screen.getByRole("button", { name: /^Date:/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Clear" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByTestId("applied").textContent).toBe("|");
  });

  it("lets the start date change after a range is picked", async () => {
    render(<DateHarness />);
    fireEvent.click(screen.getByRole("button", { name: /^Date:/ }));
    await screen.findByRole("dialog");
    // A complete range: the next click is a new start, the end is kept.
    fireEvent.click(day(9));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByTestId("applied").textContent).toBe("2026-11-09|2026-11-13");
  });

  it("with time, each picked day's time can be set straight away", async () => {
    let applied: unknown;
    function Harness() {
      const [value, setValue] = useState<DateRangeValue>({ from: "2026-11-06", to: "2026-11-13" });
      return (
        <DateRangeFilterChip
          withTime
          value={value}
          onChange={(v) => {
            applied = v;
            setValue(v);
          }}
        />
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: /^Date:/ }));
    await screen.findByRole("dialog");
    // Start day, then its time: Start is still the active tab.
    fireEvent.click(day(8));
    expect(screen.getByRole("button", { name: /^Start/ }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getAllByRole("button", { name: "09" })[0]!);
    // End day, then its time: End is active now.
    fireEvent.click(day(20));
    expect(screen.getByRole("button", { name: /^End/ }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getAllByRole("button", { name: "05" })[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(applied).toEqual({ from: "2026-11-08", to: "2026-11-20", fromTime: "09:00", toTime: "17:59" });
  });

  it("with time, the Start tab makes the next click change the start", async () => {
    render(<DateHarness withTime />);
    fireEvent.click(screen.getByRole("button", { name: /^Date:/ }));
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: /^End/ }));
    fireEvent.click(day(20));
    fireEvent.click(screen.getByRole("button", { name: /^Start/ }));
    fireEvent.click(day(4));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByTestId("applied").textContent).toBe("2026-11-04|2026-11-20");
  });
});
