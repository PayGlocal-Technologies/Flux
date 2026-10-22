import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CheckboxTree, type CheckboxTreeNode } from "../checkbox-tree";

/**
 * Only leaves are checked; a branch derives its state from them, and ticking a
 * branch ticks everything under it. Without a handler the tree is read-only.
 */

const nodes: CheckboxTreeNode[] = [
  {
    key: "f",
    label: "Feature",
    children: [
      {
        key: "f:s",
        label: "Sub",
        children: [
          { key: "f:s:a", label: "Action A" },
          { key: "f:s:b", label: "Action B" },
        ],
      },
    ],
  },
];

const box = (name: string) => screen.getByRole("checkbox", { name });

describe("CheckboxTree", () => {
  it("derives a branch's state from its leaves", () => {
    render(<CheckboxTree nodes={nodes} checkedKeys={["f:s:a"]} defaultExpanded="all" />);
    expect(box("Feature").getAttribute("data-state")).toBe("indeterminate");
    expect(box("Sub").getAttribute("data-state")).toBe("indeterminate");
    expect(box("Action A").getAttribute("data-state")).toBe("checked");
    expect(box("Action B").getAttribute("data-state")).toBe("unchecked");
  });

  it("ticks every leaf under a branch, and only leaves", () => {
    const onChange = vi.fn();
    render(<CheckboxTree nodes={nodes} checkedKeys={[]} onCheckedChange={onChange} defaultExpanded="all" />);
    fireEvent.click(box("Feature"));
    expect(onChange).toHaveBeenCalledWith(["f:s:a", "f:s:b"]);
  });

  it("unticks a fully checked branch", () => {
    const onChange = vi.fn();
    render(
      <CheckboxTree nodes={nodes} checkedKeys={["f:s:a", "f:s:b"]} onCheckedChange={onChange} defaultExpanded="all" />
    );
    fireEvent.click(box("Sub"));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("filters to matches and keeps their path", () => {
    render(<CheckboxTree nodes={nodes} checkedKeys={[]} searchPlaceholder="Search resources" />);
    expect(screen.queryByText("Action B")).toBeNull();
    fireEvent.change(screen.getByLabelText("Search resources"), { target: { value: "action b" } });
    expect(screen.getByText("Feature")).toBeTruthy();
    expect(screen.getByText("Action B")).toBeTruthy();
    expect(screen.queryByText("Action A")).toBeNull();
  });

  it("opens the branches holding a checked leaf", () => {
    render(<CheckboxTree nodes={nodes} checkedKeys={["f:s:b"]} defaultExpanded="checked" />);
    expect(screen.getByText("Action B")).toBeTruthy();
  });

  it("lists matches flat with their path when searchLayout is flat", () => {
    render(<CheckboxTree nodes={nodes} checkedKeys={[]} searchable={false} query="action a" searchLayout="flat" />);
    expect(screen.getByText("Action A")).toBeTruthy();
    expect(screen.getByText("Feature / Sub")).toBeTruthy();
    expect(screen.queryByRole("checkbox", { name: "Feature" })).toBeNull();
  });

  it("shows the empty state when nothing matches", () => {
    render(
      <CheckboxTree nodes={nodes} checkedKeys={[]} searchable={false} query="zzz" emptyTitle="No resources found" />
    );
    expect(screen.getByText("No resources found")).toBeTruthy();
  });

  it("follows controlled expandedKeys and reports toggles", () => {
    const onExpandedChange = vi.fn();
    render(
      <CheckboxTree
        nodes={nodes}
        checkedKeys={[]}
        expandedKeys={new Set(["f"])}
        onExpandedChange={onExpandedChange}
      />
    );
    expect(screen.getByText("Sub")).toBeTruthy();
    expect(screen.queryByText("Action A")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Expand Sub" }));
    expect([...onExpandedChange.mock.calls[0][0]]).toEqual(["f", "f:s"]);
  });
});

