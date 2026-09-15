"use client";

import { useMemo, useState } from "react";
import {
  ColumnManager,
  DataTable,
  applyColumnPreferences,
  useColumnPreferences,
  type Column,
  type ManagedColumn,
} from "@payglocal_ui/flux-ui";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsVariantField, DocsVariantSelect, DocsVariantToolbar } from "@/components/docs/DocsVariantToolbar";

type Row = { id: string; txn: string; merchant: string; amount: string; method: string; status: string };

const rows: Row[] = [
  { id: "1", txn: "TXN-88401", merchant: "Acme Corp", amount: "₹48,200", method: "Card", status: "Captured" },
  { id: "2", txn: "TXN-88402", merchant: "Globex", amount: "₹12,750", method: "UPI", status: "Pending" },
  { id: "3", txn: "TXN-88403", merchant: "Initech", amount: "₹93,400", method: "Netbanking", status: "Captured" },
];

const allColumns: Column<Row>[] = [
  { key: "txn", header: "Transaction ID", render: (r) => r.txn },
  { key: "merchant", header: "Merchant", render: (r) => r.merchant },
  { key: "amount", header: "Amount", align: "right", render: (r) => r.amount },
  { key: "method", header: "Method", render: (r) => r.method },
  { key: "status", header: "Status", render: (r) => r.status },
];

/** Plain-text names for the manager's list; a header can be a node. */
const managed: ManagedColumn[] = [
  { key: "txn", label: "Transaction ID" },
  { key: "merchant", label: "Merchant" },
  { key: "amount", label: "Amount" },
  { key: "method", label: "Method" },
  { key: "status", label: "Status" },
];

const DEFAULT_ORDER = managed.map((c) => c.key);

export function ColumnManagerPlayground() {
  const [locked, setLocked] = useState(true);
  const [canHide, setCanHide] = useState(true);
  const [showCode, setShowCode] = useState(false);

  const prefs = useColumnPreferences(DEFAULT_ORDER);

  /** The table's columns, rearranged and filtered to match the preferences. */
  const columns = useMemo(
    () => applyColumnPreferences(allColumns, { order: prefs.order, hidden: prefs.hidden }),
    [prefs.order, prefs.hidden]
  );

  const code = `import {
  ColumnManager,
  DataTable,
  applyColumnPreferences,
  useColumnPreferences,
} from "@payglocal_ui/flux-ui";

// Owns the arrangement. Pass a storageKey to remember it across visits.
const prefs = useColumnPreferences(DEFAULT_ORDER, { storageKey: "txn-columns" });

// Rearrange and filter the built column list to match.
const columns = applyColumnPreferences(allColumns, prefs);

<ColumnManager
  columns={managedColumns}      // { key, label }[]
  {...prefs.managerProps}       // order / hidden / reset, already wired
  fixedKeys={["txn"]}
  fixedReason="Every row is identified by its transaction ID."
/>

<DataTable columns={columns} data={rows} rowKey={(r) => r.id} />`;

  return (
    <div className="w-full space-y-4">
      <DocsVariantToolbar className="max-w-none">
        <DocsVariantField label="Visibility">
          <DocsVariantSelect
            value={canHide ? "yes" : "no"}
            onChange={(v) => setCanHide(v === "yes")}
            options={[
              { value: "yes", label: "Reorder + show/hide" },
              { value: "no", label: "Reorder only" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Locked column">
          <DocsVariantSelect
            value={locked ? "yes" : "no"}
            onChange={(v) => setLocked(v === "yes")}
            options={[
              { value: "yes", label: "Transaction ID locked" },
              { value: "no", label: "None locked" },
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
          Drag a row to reorder, or focus one and press Space, then the arrow keys.
        </span>
      </div>

      {showCode ? <CodeBlock code={code} /> : null}

      <div className="flex justify-end">
        <ColumnManager
          columns={managed}
          order={prefs.order}
          onOrderChange={prefs.setOrder}
          hiddenKeys={canHide ? prefs.hidden : undefined}
          onHiddenKeysChange={canHide ? prefs.setHidden : undefined}
          onReset={prefs.reset}
          fixedKeys={locked ? ["txn"] : []}
          fixedReason="Every row is identified by its transaction ID, so this column cannot be hidden."
        />
      </div>

      <DataTable
        className="w-full shadow-sm"
        rowKey={(r) => r.id}
        columns={columns}
        data={rows}
        density="compact"
        pagination={{ mode: "none" }}
      />
    </div>
  );
}
