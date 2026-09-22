import { describe, expect, it, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import { Dialog, DialogContent } from "../dialog";
import { SingleSelect } from "../single-select";
import { CheckboxSelect } from "../checkbox-select";
import { defaultOptionFilter } from "../option-filter";

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

const CURRENCIES = [
  { value: "INR", label: "₹ - Indian Rupee" },
  { value: "USD", label: "$ - US Dollar" },
  { value: "GBP", label: "£ - Pound Sterling" },
];

function Single({ showSearch = true, filterOption }: any) {
  const [value, setValue] = useState("");
  return (
    <>
      <SingleSelect
        options={CURRENCIES}
        value={value}
        onChange={setValue}
        placeholder="Select currency"
        showSearch={showSearch}
        searchPlaceholder="Search currency"
        filterOption={filterOption}
      />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe("SingleSelect", () => {
  it("picks a value and reports it once", () => {
    render(<Single />);
    fireEvent.click(screen.getByRole("button", { name: /select currency/i }));
    fireEvent.click(screen.getByText("$ - US Dollar"));
    expect(screen.getByTestId("value").textContent).toBe("USD");
  });

  it("searches the value as well as the label, so a raw code finds its row", () => {
    render(<Single />);
    fireEvent.click(screen.getByRole("button", { name: /select currency/i }));
    // "GBP" appears only in the value; the label shows the symbol and name.
    fireEvent.change(screen.getByLabelText("Search currency"), { target: { value: "gbp" } });
    expect(screen.getByText("£ - Pound Sterling")).toBeDefined();
    expect(screen.queryByText("₹ - Indian Rupee")).toBeNull();
  });

  it("honours a custom filterOption", () => {
    // Matches nothing but INR, whatever is typed.
    render(<Single filterOption={(o: any) => o.value === "INR"} />);
    fireEvent.click(screen.getByRole("button", { name: /select currency/i }));
    fireEvent.change(screen.getByLabelText("Search currency"), { target: { value: "dollar" } });
    expect(screen.getByText("₹ - Indian Rupee")).toBeDefined();
    expect(screen.queryByText("$ - US Dollar")).toBeNull();
  });

  it("shows the empty line when nothing matches", () => {
    render(<Single />);
    fireEvent.click(screen.getByRole("button", { name: /select currency/i }));
    fireEvent.change(screen.getByLabelText("Search currency"), { target: { value: "zzz" } });
    expect(screen.getByText("No options found.")).toBeDefined();
  });
});

describe("CheckboxSelect search", () => {
  it("matches the value too, not only the label", () => {
    render(
      <CheckboxSelect
        options={CURRENCIES}
        value={[]}
        onChange={() => {}}
        placeholder="Select currencies"
        showSearch
        searchPlaceholder="Search currency"
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /select currencies/i }));
    fireEvent.change(screen.getByLabelText("Search currency"), { target: { value: "usd" } });
    expect(screen.getByText("$ - US Dollar")).toBeDefined();
    expect(screen.queryByText("₹ - Indian Rupee")).toBeNull();
  });
});

describe("defaultOptionFilter", () => {
  it("is case-insensitive across label and value", () => {
    const o = { value: "INR", label: "₹ - Indian Rupee" };
    expect(defaultOptionFilter(o, "inr")).toBe(true);
    expect(defaultOptionFilter(o, "RUPEE")).toBe(true);
    expect(defaultOptionFilter(o, "dollar")).toBe(false);
  });
});

/**
 * A picker inside a modal dialog: `react-remove-scroll` cancels wheel and
 * touch-move for anything outside the locked subtree, and a portalled popover
 * is outside it — so the list rendered but would not scroll. Only the topmost
 * lock acts, so the panel has to bring its own.
 *
 * It does that with `ScrollLockTakeover` rather than by going `modal`: the
 * modal route would also trap focus and swallow outside clicks, which would
 * change how every existing popover in a dialog behaves for a fix that is only
 * about the wheel.
 */
describe("SingleSelect inside a modal dialog", () => {
  it("takes over the scroll lock so its list can scroll", async () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>
          <Single />
        </DialogContent>
      </Dialog>
    );

    expect(document.body.getAttribute("data-scroll-locked")).toBe("1");

    fireEvent.click(screen.getByRole("button", { name: /select currency/i }));

    const option = await screen.findByText("$ - US Dollar");
    expect(option.closest("[data-scroll-lock-takeover]")).not.toBeNull();
  });

  it("stays modal-free: the dialog keeps the only lock counted on the body", async () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>
          <Single />
        </DialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByRole("button", { name: /select currency/i }));

    await screen.findByText("$ - US Dollar");
    // A `modal` popover would have pushed a second RemoveScrollBar here.
    expect(document.body.getAttribute("data-scroll-locked")).toBe("1");
  });

  it("does not wrap the panel when there is no dialog around it", async () => {
    render(<Single />);
    fireEvent.click(screen.getByRole("button", { name: /select currency/i }));

    const option = await screen.findByText("$ - US Dollar");
    expect(option.closest("[data-scroll-lock-takeover]")).toBeNull();
  });
});

describe("SingleSelect search threshold", () => {
  const many = Array.from({ length: 8 }, (_, i) => ({
    value: `v${i}`,
    label: `Option ${i}`,
  }));

  function Harness({ options, ...rest }: any) {
    const [value, setValue] = useState("");
    return (
      <SingleSelect
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Pick one"
        searchPlaceholder="Search options"
        {...rest}
      />
    );
  }

  it("shows the box on its own once the list is long enough", () => {
    render(<Harness options={many} />);
    fireEvent.click(screen.getByRole("button", { name: /pick one/i }));
    expect(screen.getByLabelText("Search options")).toBeDefined();
  });

  it("leaves a short list alone", () => {
    render(<Harness options={many.slice(0, 3)} />);
    fireEvent.click(screen.getByRole("button", { name: /pick one/i }));
    expect(screen.queryByLabelText("Search options")).toBeNull();
  });

  it("takes an explicit showSearch either way", () => {
    const { unmount } = render(<Harness options={many.slice(0, 3)} showSearch />);
    fireEvent.click(screen.getByRole("button", { name: /pick one/i }));
    expect(screen.getByLabelText("Search options")).toBeDefined();
    unmount();

    render(<Harness options={many} showSearch={false} />);
    fireEvent.click(screen.getByRole("button", { name: /pick one/i }));
    expect(screen.queryByLabelText("Search options")).toBeNull();
  });

  it("puts focus in the search box on open, and takes an id for its label", async () => {
    render(<Harness options={many} id="currency-field" />);
    const trigger = screen.getByRole("button", { name: /pick one/i });
    expect(trigger.id).toBe("currency-field");

    fireEvent.click(trigger);
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText("Search options"))
    );
  });
});
