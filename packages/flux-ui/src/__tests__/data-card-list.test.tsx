import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataCardList } from "../data-card-list";

const rows = Array.from({ length: 25 }, (_, i) => ({ id: `r${i}`, name: `Row ${i}` }));
const card = (r: { name: string }) => <span>{r.name}</span>;

describe("DataCardList", () => {
  it("slices locally in client mode and pages through", () => {
    render(
      <DataCardList
        rows={rows}
        rowKey={(r) => r.id}
        renderCard={card}
        pagination={{ mode: "client", pageSize: 10 }}
      />
    );
    expect(screen.getAllByText(/^Row /).length).toBe(10);
    expect(screen.getByText(/Page 1 of 3/)).toBeTruthy();
  });

  it("does NOT slice in page mode — the caller sent this page", () => {
    const onPageChange = vi.fn();
    render(
      <DataCardList
        rows={rows.slice(0, 10)}
        rowKey={(r) => r.id}
        renderCard={card}
        pagination={{ mode: "page", page: 2, pageSize: 10, total: 25, onPageChange }}
      />
    );
    expect(screen.getAllByText(/^Row /).length).toBe(10);
    expect(screen.getByText(/Page 2 of 3/)).toBeTruthy();
    fireEvent.click(screen.getByText("Next"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("shows no total in cursor mode, and hides Next at the end", () => {
    const onNext = vi.fn();
    const { rerender } = render(
      <DataCardList
        rows={rows.slice(0, 5)}
        rowKey={(r) => r.id}
        renderCard={card}
        pagination={{ mode: "cursor", page: 2, pageSize: 5, hasNext: true, onNext, onPrev: () => {} }}
      />
    );
    expect(screen.getByText("Page 2")).toBeTruthy();
    expect(screen.queryByText(/of/)).toBeNull();
    fireEvent.click(screen.getByText("Next"));
    expect(onNext).toHaveBeenCalled();

    rerender(
      <DataCardList
        rows={rows.slice(0, 5)}
        rowKey={(r) => r.id}
        renderCard={card}
        pagination={{ mode: "cursor", page: 2, pageSize: 5, hasNext: false, onNext, onPrev: () => {} }}
      />
    );
    expect(screen.getByText("Next").closest("button")?.disabled).toBe(true);
  });

  it("shows skeletons while loading and an empty state with no rows", () => {
    const { rerender, container } = render(
      <DataCardList rows={[]} rowKey={(r: any) => r.id} renderCard={card} isLoading skeletonCount={4} />
    );
    // Four skeleton cards, each built from several Shimmer elements.
    expect(container.querySelectorAll(".shimmer").length).toBeGreaterThanOrEqual(4);

    rerender(<DataCardList rows={[]} rowKey={(r: any) => r.id} renderCard={card} emptyTitle="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeTruthy();
  });
});
