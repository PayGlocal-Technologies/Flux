"use client";

import { useMemo, useState } from "react";
import {
  DataTable,
  Button,
  type Column,
  type DataTableFooterSummary,
  type DataTableHeaderStyle,
  StatusBadge,
} from "@payglocal_ui/flux-ui";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsVariantField, DocsVariantSelect, DocsVariantToolbar } from "@/components/docs/DocsVariantToolbar";

type Row = { id: string; name: string; status: "active" | "pending" };

const rows: Row[] = [
  { id: "1", name: "Acme Corp", status: "active" },
  { id: "2", name: "Globex",    status: "pending" },
  { id: "3", name: "Initech",   status: "active" },
];

const STATUS_MAP = {
  active:  { variant: "success",  label: "Active",  trailIcon: "check" },
  pending: { variant: "warning",  label: "Pending" },
} as const;

const columns: Column<Row>[] = [
  { key: "name", header: "Merchant", render: (r) => r.name },
  {
    key: "status",
    header: "Status",
    render: (r) => <StatusBadge {...STATUS_MAP[r.status]} size="sm" />,
  },
];

export function DataTablePlayground() {
  const [density, setDensity] = useState<
    "default" | "comfortable" | "compact"
  >("default");
  const [pageSize, setPageSize] = useState("5");
  const [headerStyle, setHeaderStyle] = useState<DataTableHeaderStyle>("surface");
  const [footerSummary, setFooterSummary] = useState<DataTableFooterSummary>("range");
  const [tableLayout, setTableLayout] = useState<"auto" | "fixed" | "content">("fixed");
  const [showRowAction, setShowRowAction] = useState(false);
  const [rowClickable, setRowClickable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  /** Last row clicked, so the toggle below has a visible effect. */
  const [clickedRow, setClickedRow] = useState<string | null>(null);

  const code = useMemo(() => {
    const rowActionProp = showRowAction
      ? `\n  rowAction={(row) => (\n    <Button variant="outline" size="sm" onClick={() => openDetails(row)}>\n      View details\n    </Button>\n  )}`
      : "";
    const rowClickProp = rowClickable ? `\n  onRowClick={(row) => openDetails(row)}` : "";
    return `import { DataTable, Button, type Column } from "@payglocal_ui/flux-ui";

<DataTable
  rowKey={(r) => r.id}
  columns={columns}
  data={rows}
  density="${density}"
  pageSize={${pageSize}}
  headerStyle="${headerStyle}"
  footerSummary="${footerSummary}"
  tableLayout="${tableLayout}"
  isLoading={${isLoading}}${rowActionProp}${rowClickProp}
/>`;
  }, [
    density,
    pageSize,
    headerStyle,
    footerSummary,
    tableLayout,
    isLoading,
    showRowAction,
    rowClickable,
  ]);

  return (
    <div className="w-full space-y-4">
      <DocsVariantToolbar className="max-w-none">
        <DocsVariantField label="Density">
          <DocsVariantSelect
            value={density}
            onChange={(v) => setDensity(v as typeof density)}
            options={[
              { value: "default", label: "Default" },
              { value: "compact", label: "Compact" },
              { value: "comfortable", label: "Comfortable" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Page size">
          <DocsVariantSelect
            value={pageSize}
            onChange={setPageSize}
            options={[
              { value: "3", label: "3" },
              { value: "5", label: "5" },
              { value: "10", label: "10" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Header">
          <DocsVariantSelect
            value={headerStyle}
            onChange={(v) => setHeaderStyle(v as DataTableHeaderStyle)}
            options={[
              { value: "surface", label: "Surface" },
              { value: "minimal", label: "Minimal" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Footer">
          <DocsVariantSelect
            value={footerSummary}
            onChange={(v) => setFooterSummary(v as DataTableFooterSummary)}
            options={[
              { value: "range", label: "Range" },
              { value: "count", label: "Count" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Table layout">
          <DocsVariantSelect
            value={tableLayout}
            onChange={(v) => setTableLayout(v as "auto" | "fixed" | "content")}
            options={[
              { value: "fixed", label: "Fixed" },
              { value: "auto", label: "Auto" },
              { value: "content", label: "Content" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Row action">
          <DocsVariantSelect
            value={showRowAction ? "yes" : "no"}
            onChange={(v) => setShowRowAction(v === "yes")}
            options={[
              { value: "no", label: "None" },
              { value: "yes", label: "View details" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Row click">
          <DocsVariantSelect
            value={rowClickable ? "yes" : "no"}
            onChange={(v) => setRowClickable(v === "yes")}
            options={[
              { value: "no", label: "None" },
              { value: "yes", label: "Whole row" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Loading">
          <DocsVariantSelect
            value={isLoading ? "yes" : "no"}
            onChange={(v) => setIsLoading(v === "yes")}
            options={[
              { value: "no", label: "No" },
              { value: "yes", label: "Yes" },
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
        {rowClickable && clickedRow ? (
          <span className="text-sm text-muted-foreground">Row clicked: {clickedRow}</span>
        ) : null}
      </div>
      {showCode ? <CodeBlock code={code} /> : null}
      <DataTable
        className="w-full shadow-sm"
        rowKey={(r) => r.id}
        columns={columns}
        data={rows}
        density={density}
        pageSize={Number(pageSize)}
        headerStyle={headerStyle}
        footerSummary={footerSummary}
        tableLayout={tableLayout}
        isLoading={isLoading}
        skeletonRows={4}
        rowAction={showRowAction ? (row) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log("view", row)}
          >
            View details
          </Button>
        ) : undefined}
        onRowClick={rowClickable ? (row) => setClickedRow(row.name) : undefined}
      />
    </div>
  );
}
