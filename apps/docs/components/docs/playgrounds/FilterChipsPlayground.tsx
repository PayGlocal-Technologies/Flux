"use client";

import { useMemo, useState } from "react";
import {
  AddFilterMenu,
  DateRangeFilterChip,
  FilterToolbar,
  NumberRangeFilterChip,
  SelectFilterChip,
  SingleSelectFilterChip,
  type AddFilterDefinition,
  type DateRangeValue,
  type NumberRangeValue,
} from "@payglocal_ui/flux-ui";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsVariantField, DocsVariantSelect, DocsVariantToolbar } from "@/components/docs/DocsVariantToolbar";

const STATUS = [
  { value: "captured", label: "Captured" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const CURRENCY = [
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — Pound Sterling" },
];

const METHOD = [
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
  { value: "netbanking", label: "Netbanking" },
  { value: "wallet", label: "Wallet" },
];

const ACQUIRER = [
  { value: "hdfc", label: "HDFC Bank" },
  { value: "icici", label: "ICICI Bank" },
  { value: "axis", label: "Axis Bank" },
];

const SETTLEMENT = [
  { value: "t0", label: "Same day (T+0)" },
  { value: "t1", label: "Next day (T+1)" },
  { value: "t2", label: "T+2" },
];

/** Filters that are always on screen; the rest arrive via the add menu. */
const ALWAYS_VISIBLE = ["date", "status"];

export function FilterChipsPlayground() {
  const [showAddMenu, setShowAddMenu] = useState(true);
  const [showCode, setShowCode] = useState(false);

  const [date, setDate] = useState<DateRangeValue>({ from: "", to: "" });
  const [status, setStatus] = useState<string[]>([]);
  const [currency, setCurrency] = useState<string[]>([]);
  const [method, setMethod] = useState<string[]>([]);
  const [acquirer, setAcquirer] = useState<string[]>([]);
  const [settlement, setSettlement] = useState("");
  const [amount, setAmount] = useState<NumberRangeValue>({ min: "", max: "" });

  /** Which optional filters the user has promoted to real chips. */
  const [visible, setVisible] = useState<string[]>(ALWAYS_VISIBLE);

  const definitions = useMemo<AddFilterDefinition[]>(
    () => [
      { key: "date", label: "Date" },
      { key: "status", label: "Status", options: STATUS, activeCount: status.length },
      { key: "currency", label: "Currency", options: CURRENCY, activeCount: currency.length },
      { key: "method", label: "Payment method", options: METHOD, activeCount: method.length },
      { key: "acquirer", label: "Acquirer", options: ACQUIRER, activeCount: acquirer.length },
      {
        key: "settlement",
        label: "Settlement cycle",
        options: SETTLEMENT,
        activeCount: settlement ? 1 : 0,
      },
      { key: "amount", label: "Amount" },
    ],
    [status, currency, method, acquirer, settlement]
  );

  const addFilter = (key: string) =>
    setVisible((prev) => (prev.includes(key) ? prev : [...prev, key]));

  /**
   * Taking a filter back out clears it too. `visible` is not the only thing
   * keeping a chip on screen in a real toolbar — a filter holding values is
   * shown regardless — so a filter removed with values still applied would
   * either bounce straight back or keep narrowing the table invisibly.
   */
  const removeFilter = (key: string) => {
    setVisible((prev) => prev.filter((k) => k !== key));
    if (key === "status") setStatus([]);
    else if (key === "currency") setCurrency([]);
    else if (key === "method") setMethod([]);
    else if (key === "acquirer") setAcquirer([]);
    else if (key === "settlement") setSettlement("");
  };

  /** A value chosen straight out of the search results applies immediately. */
  const selectValue = (filterKey: string, value: string) => {
    const add = (prev: string[]) => (prev.includes(value) ? prev : [...prev, value]);
    if (filterKey === "status") setStatus(add);
    else if (filterKey === "currency") setCurrency(add);
    else if (filterKey === "method") setMethod(add);
    else if (filterKey === "acquirer") setAcquirer(add);
    else if (filterKey === "settlement") setSettlement(value);
  };

  const code = `import { FilterToolbar, SelectFilterChip, AddFilterMenu } from "@payglocal_ui/flux-ui";

// FilterToolbar wraps its chips in a FilterChipGroup, so exactly one popover
// is open at a time — and switching between two chips does not make the
// second one flash. No openChip state in the page.
<FilterToolbar
  search={<SearchInput />}
  chips={
    <>
      <DateRangeFilterChip value={date} onChange={setDate} />
      <SelectFilterChip label="Status" options={STATUS} selected={status} onChange={setStatus} />
      {visible.includes("currency") && (
        <SelectFilterChip label="Currency" options={CURRENCY} selected={currency} onChange={setCurrency} />
      )}
      <AddFilterMenu
        filters={definitions}      // { key, label, options?, activeCount? }[]
        visibleKeys={visible}
        onAddFilter={(key) => setVisible((v) => [...v, key])}
        onSelectValue={(filterKey, value) => apply(filterKey, value)}
      />
    </>
  }
  actions={<Button>Export</Button>}
/>`;

  return (
    <div className="w-full space-y-4">
      <DocsVariantToolbar className="max-w-none">
        <DocsVariantField label="Add-filter menu">
          <DocsVariantSelect
            value={showAddMenu ? "yes" : "no"}
            onChange={(v) => setShowAddMenu(v === "yes")}
            options={[
              { value: "yes", label: "Shown" },
              { value: "no", label: "Hidden" },
            ]}
          />
        </DocsVariantField>
      </DocsVariantToolbar>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowCode((s) => !s)}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {showCode ? "Hide generated code" : "Show generated code"}
        </button>
        <span className="text-sm text-muted-foreground">
          Open one chip, then click another — the second opens cleanly, with no flash.
        </span>
      </div>

      {showCode ? <CodeBlock code={code} /> : null}

      <div className="rounded-xl border border-border bg-card p-4">
        <FilterToolbar
          chips={
            <>
              <DateRangeFilterChip value={date} onChange={setDate} />
              <SelectFilterChip
                label="Status"
                options={STATUS}
                selected={status}
                onChange={setStatus}
              />
              {visible.includes("currency") && (
                <SelectFilterChip
                  label="Currency"
                  options={CURRENCY}
                  selected={currency}
                  onChange={setCurrency}
                />
              )}
              {visible.includes("method") && (
                <SelectFilterChip
                  label="Payment method"
                  options={METHOD}
                  selected={method}
                  onChange={setMethod}
                />
              )}
              {visible.includes("acquirer") && (
                <SelectFilterChip
                  label="Acquirer"
                  options={ACQUIRER}
                  selected={acquirer}
                  onChange={setAcquirer}
                />
              )}
              {visible.includes("settlement") && (
                <SingleSelectFilterChip
                  label="Settlement cycle"
                  options={SETTLEMENT}
                  value={settlement}
                  onChange={setSettlement}
                  showValueInLabel
                />
              )}
              {visible.includes("amount") && (
                <NumberRangeFilterChip value={amount} onChange={setAmount} prefix="₹" />
              )}
              {showAddMenu && (
                <AddFilterMenu
                  filters={definitions}
                  visibleKeys={visible}
                  onAddFilter={addFilter}
                  onRemoveFilter={removeFilter}
                  onSelectValue={selectValue}
                />
              )}
            </>
          }
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Try typing <code className="rounded bg-muted px-1">usd</code> or{" "}
        <code className="rounded bg-muted px-1">hdfc</code> in the Filter menu: searching
        matches filter names and their values at once, and picking a value promotes that
        filter to a chip with the value already applied. With the query empty the rows are
        toggles — ticked filters are in the toolbar, and the menu stays open so turning
        several on is one visit.
      </p>
    </div>
  );
}
