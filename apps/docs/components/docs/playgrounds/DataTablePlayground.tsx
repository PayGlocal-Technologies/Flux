"use client";

import { useMemo, useState } from "react";
import {
  DataTable,
  Button,
  type Column,
  type DataTableFooterSummary,
  type DataTableHeaderStyle,
  type DataTablePagination,
  type DataTableSortState,
  StatusBadge,
} from "@payglocal_ui/flux-ui";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsVariantField, DocsVariantSelect, DocsVariantToolbar } from "@/components/docs/DocsVariantToolbar";

type Row = { id: string; name: string; amount: number; status: "active" | "pending" };

/** Enough rows that paging, sorting and page-size changes all have an effect. */
const rows: Row[] = [
  { id: "1", name: "Acme Corp", amount: 48_200, status: "active" },
  { id: "2", name: "Globex", amount: 12_750, status: "pending" },
  { id: "3", name: "Initech", amount: 93_400, status: "active" },
  { id: "4", name: "Umbrella", amount: 5_120, status: "pending" },
  { id: "5", name: "Soylent", amount: 61_890, status: "active" },
  { id: "6", name: "Hooli", amount: 27_340, status: "pending" },
  { id: "7", name: "Vehement", amount: 8_960, status: "active" },
  { id: "8", name: "Massive Dynamic", amount: 74_010, status: "active" },
];

const STATUS_MAP = {
  active: { variant: "success", label: "Active", trailIcon: "check" },
  pending: { variant: "warning", label: "Pending" },
} as const;

const columns: Column<Row>[] = [
  {
    key: "name",
    header: "Merchant",
    // A comparator means the table does the sorting itself — no request, no
    // state in the page. `sorter: true` would instead report the click and
    // leave the ordering to a server query.
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: (r) => r.name,
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    sorter: (a, b) => a.amount - b.amount,
    // Money reads "largest first" on the first click far more often than
    // "smallest first", so this column starts its cycle at descending.
    sortDirections: ["descend", "ascend"],
    render: (r) => `₹${r.amount.toLocaleString("en-IN")}`,
  },
  {
    key: "status",
    header: "Status",
    render: (r) => <StatusBadge {...STATUS_MAP[r.status]} size="sm" />,
  },
];

type PagerMode = "client" | "page" | "cursor" | "none";

export function DataTablePlayground() {
  const [density, setDensity] = useState<"default" | "comfortable" | "compact">("default");
  const [pagerMode, setPagerMode] = useState<PagerMode>("client");
  const [pageSize, setPageSize] = useState(3);
  const [headerStyle, setHeaderStyle] = useState<DataTableHeaderStyle>("surface");
  const [summary, setSummary] = useState<DataTableFooterSummary>("range");
  const [tableLayout, setTableLayout] = useState<"auto" | "fixed" | "content">("fixed");
  const [rowsPerPage, setRowsPerPage] = useState(false);
  const [sortable, setSortable] = useState(true);
  const [showRowAction, setShowRowAction] = useState(false);
  const [rowClickable, setRowClickable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [clickedRow, setClickedRow] = useState<string | null>(null);

  /** Server-ish page state, driving both the `page` and `cursor` demos. */
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSortState>(null);

  const activeColumns = useMemo(
    () => (sortable ? columns : columns.map(({ sorter, sortDirections, ...c }) => c)),
    [sortable]
  );

  /**
   * `page` and `cursor` modes hand the table only the current page's rows, the
   * way a real endpoint would — the table must never slice in those modes.
   */
  const pageRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [page, pageSize]
  );
  const hasNext = page * pageSize < rows.length;

  const pagination = useMemo<DataTablePagination>(() => {
    const extras = {
      summary,
      ...(rowsPerPage
        ? {
            pageSizeOptions: [3, 5, 10],
            onPageSizeChange: (n: number) => {
              setPageSize(n);
              setPage(1);
            },
          }
        : {}),
    };
    if (pagerMode === "none") return { mode: "none" };
    if (pagerMode === "client") return { mode: "client", pageSize, ...extras };
    if (pagerMode === "page")
      return { mode: "page", page, pageSize, total: rows.length, onPageChange: setPage, ...extras };
    return {
      mode: "cursor",
      page,
      pageSize,
      hasNext,
      onNext: () => setPage((p) => p + 1),
      onPrev: () => setPage((p) => Math.max(1, p - 1)),
      ...extras,
    };
  }, [pagerMode, page, pageSize, summary, rowsPerPage, hasNext]);

  const data = pagerMode === "client" || pagerMode === "none" ? rows : pageRows;

  const code = useMemo(() => {
    const pagerSnippet =
      pagerMode === "none"
        ? `{ mode: "none" }`
        : pagerMode === "client"
          ? `{ mode: "client", pageSize: ${pageSize} }`
          : pagerMode === "page"
            ? `{
    mode: "page",
    page,
    pageSize: ${pageSize},
    total: data.totalCount,   // the response carries a total
    onPageChange: setPage,
  }`
            : `{
    mode: "cursor",
    page,
    pageSize: ${pageSize},
    hasNext: !!data.nextCursor,   // no total exists, so none is shown
    onNext: () => goToCursor(data.nextCursor),
    onPrev: () => goBack(),
  }`;
    const sortProp = sortable
      ? `\n  sorting={{ value: sort, onChange: setSort }}`
      : "";
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
  headerStyle="${headerStyle}"
  tableLayout="${tableLayout}"
  isLoading={${isLoading}}
  pagination={${pagerSnippet}}${sortProp}${rowActionProp}${rowClickProp}
/>`;
  }, [
    pagerMode,
    pageSize,
    sortable,
    density,
    headerStyle,
    tableLayout,
    isLoading,
    showRowAction,
    rowClickable,
  ]);

  return (
    <div className="w-full space-y-4">
      <DocsVariantToolbar className="max-w-none">
        <DocsVariantField label="Pagination">
          <DocsVariantSelect
            value={pagerMode}
            onChange={(v) => {
              setPagerMode(v as PagerMode);
              setPage(1);
            }}
            options={[
              { value: "client", label: "Client" },
              { value: "page", label: "Page (has total)" },
              { value: "cursor", label: "Cursor (no total)" },
              { value: "none", label: "None" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Rows per page">
          <DocsVariantSelect
            value={rowsPerPage ? "yes" : "no"}
            onChange={(v) => setRowsPerPage(v === "yes")}
            options={[
              { value: "no", label: "Hidden" },
              { value: "yes", label: "Shown" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Sorting">
          <DocsVariantSelect
            value={sortable ? "yes" : "no"}
            onChange={(v) => setSortable(v === "yes")}
            options={[
              { value: "yes", label: "Sortable headers" },
              { value: "no", label: "Off" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Summary">
          <DocsVariantSelect
            value={summary}
            onChange={(v) => setSummary(v as DataTableFooterSummary)}
            options={[
              { value: "range", label: "Range" },
              { value: "count", label: "Count" },
              { value: "none", label: "None" },
            ]}
          />
        </DocsVariantField>
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
        {pagerMode === "cursor" ? (
          <span className="text-sm text-muted-foreground">
            No total, so the footer numbers only the pages a cursor can step to.
          </span>
        ) : null}
        {rowClickable && clickedRow ? (
          <span className="text-sm text-muted-foreground">Row clicked: {clickedRow}</span>
        ) : null}
      </div>

      {showCode ? <CodeBlock code={code} /> : null}

      <DataTable
        className="w-full shadow-sm"
        rowKey={(r) => r.id}
        columns={activeColumns}
        data={data}
        density={density}
        headerStyle={headerStyle}
        tableLayout={tableLayout}
        isLoading={isLoading}
        skeletonRows={4}
        pagination={pagination}
        sorting={sortable ? { value: sort, onChange: setSort } : undefined}
        rowAction={
          showRowAction
            ? (row) => (
                <Button variant="outline" size="sm" onClick={() => setClickedRow(row.name)}>
                  View details
                </Button>
              )
            : undefined
        }
        onRowClick={rowClickable ? (row) => setClickedRow(row.name) : undefined}
      />
    </div>
  );
}
