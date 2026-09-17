import { describe, expect, it, beforeAll, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { useState } from "react";
import { DatePicker } from "../date-picker";

/**
 * `showTime` follows antd: time columns beside the calendar, a Now/OK footer,
 * and a day click that no longer closes the panel because the day is only half
 * the answer.
 */

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.scrollTo = vi.fn();
});

function Harness({
  initial,
  showTime,
  onChange,
}: {
  initial: string;
  showTime?: boolean | Record<string, unknown>;
  onChange?: (v: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <DatePicker
      value={value}
      showTime={showTime as never}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

/** The scrollable list under a column heading. */
function column(label: string) {
  return screen.getByText(label).parentElement as HTMLElement;
}

/**
 * A day cell in the calendar grid. Scoped by shape rather than by text, because
 * with the time columns up a label like "17" is also a minute.
 */
function day(n: number) {
  const cell = screen
    .getAllByRole("button", { name: String(n) })
    .find((b) => b.className.includes("rounded-full"));
  if (!cell) throw new Error(`no day cell ${n}`);
  return cell;
}

describe("DatePicker showTime", () => {
  it("leaves the date-only picker untouched", async () => {
    const onChange = vi.fn();
    render(<Harness initial="2026-09-10" onChange={onChange} />);

    fireEvent.click(screen.getByText("10 Sep 2026"));
    await screen.findByText("Su");
    fireEvent.click(day(17));

    // Date-only value, and the panel closes on the day click as it always did.
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("2026-09-17"));
    expect(screen.queryByText("OK")).toBeNull();
    await waitFor(() => expect(screen.queryByText("Hr")).toBeNull());
  });

  it("widens the value to date and time, and keeps the panel open on a day click", async () => {
    const onChange = vi.fn();
    render(<Harness initial="2026-09-10 14:30" showTime onChange={onChange} />);

    // Trigger reads back in 12-hour, like every other flux timestamp.
    fireEvent.click(screen.getByText("10 Sep 2026, 02:30 PM"));

    await screen.findByText("Hr");
    fireEvent.click(day(17));

    // Time carried across, and the panel is still up so a time can be picked.
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("2026-09-17 14:30"));
    expect(screen.getByText("OK")).toBeTruthy();
  });

  it("edits hour, minute and meridiem independently", async () => {
    const onChange = vi.fn();
    render(<Harness initial="2026-09-10 14:30" showTime onChange={onChange} />);
    fireEvent.click(screen.getByText("10 Sep 2026, 02:30 PM"));
    await screen.findByText("Hr");

    // 09 in the 12-hour column, still PM.
    fireEvent.click(within(column("Hr")).getByRole("button", { name: "09" }));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("2026-09-10 21:30"));

    fireEvent.click(within(column("Min")).getByRole("button", { name: "45" }));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("2026-09-10 21:45"));

    fireEvent.click(within(column("AM/PM")).getByRole("button", { name: "AM" }));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("2026-09-10 09:45"));
  });

  it("orders the 12-hour column 12 first, so midnight is the first AM hour", async () => {
    render(<Harness initial="2026-09-10 14:30" showTime />);
    fireEvent.click(screen.getByText("10 Sep 2026, 02:30 PM"));
    await screen.findByText("Hr");

    const labels = within(column("Hr"))
      .getAllByRole("button")
      .map((b) => b.textContent);
    expect(labels.slice(0, 3)).toEqual(["12", "01", "02"]);
    expect(labels).toHaveLength(12);

    // 12 AM is midnight, not noon.
    fireEvent.click(within(column("Hr")).getByRole("button", { name: "12" }));
    fireEvent.click(within(column("AM/PM")).getByRole("button", { name: "AM" }));
    await waitFor(() =>
      expect(screen.getByText("10 Sep 2026, 12:30 AM")).toBeTruthy()
    );
  });

  it("OK closes the panel and Now fills in the current instant", async () => {
    const onChange = vi.fn();
    render(<Harness initial="2026-09-10 14:30" showTime onChange={onChange} />);
    fireEvent.click(screen.getByText("10 Sep 2026, 02:30 PM"));

    fireEvent.click(await screen.findByText("OK"));
    await waitFor(() => expect(screen.queryByText("Hr")).toBeNull());

    fireEvent.click(screen.getByText("10 Sep 2026, 02:30 PM"));
    fireEvent.click(await screen.findByText("Now"));

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const emitted = onChange.mock.calls.at(-1)![0] as string;
    expect(emitted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
    // Now also dismisses, since it answers both halves at once.
    await waitFor(() => expect(screen.queryByText("Hr")).toBeNull());
  });

  it("honours showSecond and the step options", async () => {
    const onChange = vi.fn();
    render(
      <Harness
        initial="2026-09-10 14:30:00"
        showTime={{ showSecond: true, minuteStep: 15, use12Hours: false }}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByText("10 Sep 2026, 02:30:00 PM"));
    await screen.findByText("Sec");

    // 24-hour column, so no meridiem beside it.
    expect(screen.queryByText("AM/PM")).toBeNull();
    expect(within(column("Hr")).getAllByRole("button")).toHaveLength(24);
    expect(
      within(column("Min")).getAllByRole("button").map((b) => b.textContent)
    ).toEqual(["00", "15", "30", "45"]);

    fireEvent.click(within(column("Sec")).getByRole("button", { name: "20" }));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("2026-09-10 14:30:20"));
  });

  it("stamps today's date when a time is picked before a day", async () => {
    const onChange = vi.fn();
    render(<Harness initial="" showTime onChange={onChange} />);

    fireEvent.click(screen.getByText("Select date"));
    await screen.findByText("Hr");

    fireEvent.click(within(column("Min")).getByRole("button", { name: "45" }));

    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")} 00:45`;
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(expected));
  });

  it("reads a date-only value written before showTime was turned on", async () => {
    const onChange = vi.fn();
    render(<Harness initial="2026-09-10" showTime onChange={onChange} />);

    // Parsed as midnight rather than dropped.
    fireEvent.click(screen.getByText("10 Sep 2026, 12:00 AM"));
    await screen.findByText("Hr");
    fireEvent.click(day(17));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("2026-09-17 00:00"));
  });
});
