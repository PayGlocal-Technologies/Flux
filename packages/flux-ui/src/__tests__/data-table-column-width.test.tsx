import { describe, expect, it, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataTable, type Column } from "../data-table";

/**
 * A column's `width` is documented to accept `minmax(min, max)`, but the
 * `<col>` it lands on is a real table column, not a CSS Grid track —
 * `width: minmax(...)` is invalid CSS and the whole declaration is dropped
 * silently, leaving the column with no floor at all. On a narrow viewport
 * that squeezed the column down to nothing, and the header's deliberately
 * un-truncated text spilled into the next column's header — "Batch" and
 * "Currency" rendering as "Batchency".
 */

beforeAll(() => {
  if (!(globalThis as any).ResizeObserver) {
    (globalThis as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

interface Row {
  id: string;
  name: string;
}

const DATA: Row[] = [{ id: "1", name: "Row one" }];

function columns(width: string): Column<Row>[] {
  return [
    { key: "id", header: "Batch", width, render: (r) => r.id },
    { key: "name", header: "Currency", width: "84px", render: (r) => r.name },
  ];
}

/** The `<col>` for a given column key, inside the fixed-layout `<colgroup>`. */
function colFor(key: string, container: HTMLElement) {
  const th = screen.getAllByRole("columnheader").find((h) => h.textContent === key);
  expect(th).toBeTruthy();
  const index = Array.from(th!.parentElement!.children).indexOf(th!);
  const cols = container.querySelectorAll("colgroup col");
  return cols[index] as HTMLTableColElement;
}

describe("DataTable minmax() column widths", () => {
  it("gives a minmax(min, 1fr) column a real min-width instead of dropping it", () => {
    const { container } = render(<DataTable columns={columns("minmax(250px, 1fr)")} data={DATA} rowKey={(r) => r.id} />);

    const col = colFor("Batch", container);
    // The floor survives as `min-width` — a legal CSS property — rather than
    // being lost inside an illegal `width: minmax(...)` declaration.
    expect(col.style.minWidth).toBe("250px");
    // `1fr` is a Grid unit and means nothing as a table `width`; leaving it
    // unset is what lets the column take whatever `table-layout: fixed`
    // leaves over, the same as a grid track's `1fr` would.
    expect(col.style.width).toBe("");
  });

  it("gives a minmax(min, max) column both bounds as real CSS", () => {
    const { container } = render(<DataTable columns={columns("minmax(230px, 260px)")} data={DATA} rowKey={(r) => r.id} />);

    const col = colFor("Batch", container);
    expect(col.style.minWidth).toBe("230px");
    expect(col.style.width).toBe("260px");
  });

  it("leaves a plain width untouched", () => {
    const { container } = render(<DataTable columns={columns("180px")} data={DATA} rowKey={(r) => r.id} />);

    const col = colFor("Batch", container);
    expect(col.style.width).toBe("180px");
    expect(col.style.minWidth).toBe("");
  });
});
