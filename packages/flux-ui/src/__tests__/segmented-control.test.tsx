import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SegmentedControl } from "../segmented-control";
import { ProgressTracker } from "../progress";

/** A radio group in a pill: it sets a value and announces itself as radios. */

describe("SegmentedControl", () => {
  it("is a labelled radio group that reports the picked value", () => {
    const onValueChange = vi.fn();
    render(
      <SegmentedControl
        label="Effect"
        value=""
        onValueChange={onValueChange}
        options={[
          { value: "ALLOW", label: "Allow" },
          { value: "DENY", label: "Deny", tone: "destructive" },
        ]}
      />
    );
    expect(screen.getByRole("radiogroup", { name: "Effect" })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    fireEvent.click(screen.getByRole("radio", { name: "Deny" }));
    expect(onValueChange).toHaveBeenCalledWith("DENY");
  });

  it("marks the chosen segment checked", () => {
    render(
      <SegmentedControl
        label="Level"
        value="S"
        onValueChange={() => {}}
        options={[
          { value: "B", label: "Both" },
          { value: "S", label: "Self" },
        ]}
      />
    );
    expect(screen.getByRole("radio", { name: "Self" }).getAttribute("data-state")).toBe("checked");
    expect(screen.getByRole("radio", { name: "Both" }).getAttribute("data-state")).toBe("unchecked");
  });
});

describe("ProgressTracker inline", () => {
  it("renders an ordered list with the current step marked", () => {
    render(
      <ProgressTracker
        variant="inline"
        steps={[
          { label: "Configure", status: "complete" },
          { label: "Confirm", status: "current" },
        ]}
      />
    );
    expect(screen.getByRole("list", { name: "Steps" })).toBeTruthy();
    expect(screen.getByText("Confirm").closest("li")?.getAttribute("aria-current")).toBe("step");
  });
});
