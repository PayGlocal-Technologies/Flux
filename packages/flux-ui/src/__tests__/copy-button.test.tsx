import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { CopyButton } from "../copy-button";

/**
 * The button owns the whole copy: the write, the "Copied" state and when it
 * goes back. A write that fails must never claim to have copied.
 */

const writeText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
  vi.useFakeTimers();
  writeText.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
});

afterEach(() => {
  vi.useRealTimers();
});

async function click(name: RegExp | string) {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name }));
  });
}

describe("CopyButton", () => {
  it("copies the value and reads Copied until the window ends", async () => {
    render(<CopyButton value="https://pay.example/abc">Copy Link</CopyButton>);
    await click("Copy Link");
    expect(writeText).toHaveBeenCalledWith("https://pay.example/abc");
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole("button", { name: "Copy Link" })).toBeTruthy();
  });

  it("restarts the window on a second copy", async () => {
    render(<CopyButton value="x">Copy</CopyButton>);
    await click("Copy");
    act(() => vi.advanceTimersByTime(1500));
    await click("Copied");
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByRole("button", { name: "Copy" })).toBeTruthy();
  });

  it("stays as it was when the clipboard refuses", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const onCopied = vi.fn();
    render(
      <CopyButton value="x" onCopied={onCopied}>
        Copy
      </CopyButton>
    );
    await click("Copy");
    expect(onCopied).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Copy" })).toBeTruthy();
  });

  it("shows errorMessage as a toast when the clipboard refuses", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const error = vi.spyOn(toast, "error").mockImplementation(() => "");
    render(
      <CopyButton value="x" errorMessage="Couldn't copy to clipboard">
        Copy
      </CopyButton>
    );
    await click("Copy");
    expect(error).toHaveBeenCalledWith("Couldn't copy to clipboard");
    error.mockRestore();
  });

  it("names an icon-only button by its label", async () => {
    render(<CopyButton value="x" label="Copy payment link" />);
    await click("Copy payment link");
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
  });

  it("does not let the click reach a clickable row", async () => {
    const onRow = vi.fn();
    render(
      <div onClick={onRow}>
        <CopyButton value="x">Copy</CopyButton>
      </div>
    );
    await click("Copy");
    expect(onRow).not.toHaveBeenCalled();
  });
});
