import { describe, expect, it, beforeAll, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DataTable } from "../data-table";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

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
});

type Row = { id: string; name: string };
const ROWS: Row[] = [{ id: "a", name: "Widget" }];
const COLUMNS = [{ key: "name", header: "Name", render: (r: Row) => <span>{r.name}</span> }];

/** Mirrors SkuRowActions: a portalled popover menu in the row-action slot. */
function RowMenu({ onEdit }: { onEdit: () => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label="Actions">
          ...
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <button type="button" onClick={onEdit}>
          Edit item
        </button>
      </PopoverContent>
    </Popover>
  );
}

describe("onRowClick", () => {
  it("does not fire when a portalled row menu item is chosen", async () => {
    const onRowClick = vi.fn();
    const onEdit = vi.fn();
    render(
      <DataTable<Row>
        columns={COLUMNS}
        data={ROWS}
        rowKey={(r) => r.id}
        onRowClick={onRowClick}
        rowAction={() => <RowMenu onEdit={onEdit} />}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    await waitFor(() => expect(screen.queryByText("Edit item")).toBeTruthy());
    fireEvent.click(screen.getByText("Edit item"));

    expect(onEdit).toHaveBeenCalledTimes(1);
    // The menu is portalled to document.body, so React routes its click through
    // the row. Before the fix this opened the row's own view as well.
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("still fires for a click on the row body", () => {
    const onRowClick = vi.fn();
    render(
      <DataTable<Row>
        columns={COLUMNS}
        data={ROWS}
        rowKey={(r) => r.id}
        onRowClick={onRowClick}
      />
    );

    fireEvent.click(screen.getByText("Widget"));
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire for a control inside a cell", () => {
    const onRowClick = vi.fn();
    const onInner = vi.fn();
    render(
      <DataTable<Row>
        columns={[
          {
            key: "name",
            header: "Name",
            render: (r: Row) => (
              <button type="button" onClick={onInner}>
                {r.name}
              </button>
            ),
          },
        ]}
        data={ROWS}
        rowKey={(r) => r.id}
        onRowClick={onRowClick}
      />
    );

    fireEvent.click(screen.getByText("Widget"));
    expect(onInner).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
