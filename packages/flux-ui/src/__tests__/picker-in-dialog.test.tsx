import { describe, expect, it, beforeAll, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { useState } from "react";
import { Drawer, DrawerContent } from "../drawer";
import { DatePicker } from "../date-picker";
import { TimePicker } from "../time-picker";

/**
 * Both pickers portal their panel to `document.body`. A modal Radix Dialog sets
 * `pointer-events: none` on `<body>` for as long as it is open, so a panel that
 * does not re-enable pointer events for itself renders perfectly and answers no
 * click — which is exactly how the MCA "Start a new batch" drawer's date and
 * time fields failed.
 */

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
  // jsdom implements neither, and both pickers call them when opening.
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.scrollTo = vi.fn();
});

function DateHarness({
  onChange,
  showTime = false,
  initial = "2026-09-10",
}: {
  onChange: (v: string) => void;
  showTime?: boolean;
  initial?: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <Drawer open onOpenChange={() => {}} side="right">
      <DrawerContent>
        <DatePicker
          value={value}
          showTime={showTime}
          onChange={(v) => {
            setValue(v);
            onChange(v);
          }}
        />
      </DrawerContent>
    </Drawer>
  );
}

function TimeHarness({ onChange }: { onChange: (v: string) => void }) {
  const [value, setValue] = useState("09:30");
  return (
    <Drawer open onOpenChange={() => {}} side="right">
      <DrawerContent>
        <TimePicker
          value={value}
          onValueChange={(v) => {
            setValue(v);
            onChange(v);
          }}
        />
      </DrawerContent>
    </Drawer>
  );
}

describe("pickers inside a modal drawer", () => {
  it("DatePicker selects a day while the drawer holds body pointer events", async () => {
    const onChange = vi.fn();
    render(<DateHarness onChange={onChange} />);

    expect(document.body.style.pointerEvents).toBe("none");

    fireEvent.click(screen.getByText("10 Sep 2026"));

    const day = await screen.findByRole("button", { name: "17" });
    // The panel must opt back into pointer events, or this click never lands
    // on the day in a real browser.
    const panel = day.closest("[style*='position: fixed']") as HTMLElement;
    expect(panel.style.pointerEvents).toBe("auto");

    fireEvent.click(day);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("2026-09-17"));
  });

  it("TimePicker selects an hour while the drawer holds body pointer events", async () => {
    const onChange = vi.fn();
    render(<TimeHarness onChange={onChange} />);

    expect(document.body.style.pointerEvents).toBe("none");

    fireEvent.click(screen.getByText("09:30 AM"));

    const panel = (await screen.findByText("Hr")).closest(
      "[style*='position: fixed']"
    ) as HTMLElement;
    expect(panel.style.pointerEvents).toBe("auto");

    // "11" appears once per column pair; the hour column is the first.
    const eleven = screen.getAllByText("11")[0];
    fireEvent.click(eleven);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("11:30"));
  });

  it("DatePicker's time columns are clickable inside the drawer too", async () => {
    const onChange = vi.fn();
    render(
      <DateHarness onChange={onChange} showTime initial="2026-09-10 14:30" />
    );

    expect(document.body.style.pointerEvents).toBe("none");

    fireEvent.click(screen.getByText("10 Sep 2026, 02:30 PM"));

    // The whole panel, time columns and footer included, opts back in.
    const panel = (await screen.findByText("OK")).closest(
      "[style*='position: fixed']"
    ) as HTMLElement;
    expect(panel.style.pointerEvents).toBe("auto");

    const minutes = screen.getByText("Min").parentElement as HTMLElement;
    fireEvent.click(within(minutes).getByRole("button", { name: "45" }));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("2026-09-10 14:45"));
  });
});

/**
 * The other half of the same problem. Pointer events are what stopped clicks;
 * the scroll lock is what stopped the wheel — the drawer's lock cancels
 * wheel events for anything portalled outside it, which is every picker panel.
 * A panel opened under a lock takes over with one of its own, and only the
 * topmost lock acts, so its scrollable regions work again.
 */
describe("pickers take over the scroll lock inside a drawer", () => {
  it("DatePicker's panel pushes its own lock", async () => {
    render(<DateHarness onChange={() => {}} />);
    expect(document.body.getAttribute("data-scroll-locked")).toBe("1");

    fireEvent.click(screen.getByText("10 Sep 2026"));

    const day = await screen.findByRole("button", { name: "17" });
    expect(day.closest("[data-scroll-lock-takeover]")).not.toBeNull();
  });

  it("TimePicker's panel pushes its own lock", async () => {
    render(<TimeHarness onChange={() => {}} />);
    expect(document.body.getAttribute("data-scroll-locked")).toBe("1");

    fireEvent.click(screen.getByText("09:30 AM"));

    const hours = await screen.findByText("Hr");
    expect(hours.closest("[data-scroll-lock-takeover]")).not.toBeNull();
  });

  it("does not wrap the panel when there is no lock to take over", async () => {
    render(<DatePicker value="2026-09-10" onChange={() => {}} />);
    fireEvent.click(screen.getByText("10 Sep 2026"));

    const day = await screen.findByRole("button", { name: "17" });
    expect(day.closest("[data-scroll-lock-takeover]")).toBeNull();
  });
});
