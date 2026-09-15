import type { TocItem } from "@/lib/docs-toc";

export type ComponentDocPage = {
  slug: string;
  title: string;
  description: string;
  importSnippet: string;
  usageSnippet: string;
  toc: TocItem[];
};

const baseToc: TocItem[] = [
  { id: "preview", label: "Preview" },
  { id: "installation", label: "Installation" },
  { id: "usage", label: "Usage" },
];

export const COMPONENT_DOC_PAGES: ComponentDocPage[] = [
  {
    slug: "avatar",
    title: "Avatar",
    description: "Image with fallback for users and entities (Radix Avatar).",
    importSnippet: `import { Avatar, AvatarFallback, AvatarImage } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Avatar>
  <AvatarImage src="/photo.png" alt="User" />
  <AvatarFallback>FX</AvatarFallback>
</Avatar>`,
    toc: baseToc,
  },
  {
    slug: "button",
    title: "Button",
    description: "Actions and form submission with variants, sizes, loading, and icons.",
    importSnippet: `import { Button } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Button variant="primary">Continue</Button>
<Button variant="outline" isLoading>Save</Button>`,
    toc: baseToc,
  },
  {
    slug: "calendar",
    title: "Calendar",
    description:
      "React DayPicker with Flux tokens: single, range, dropdown captions, week numbers, presets, RTL, and timezone support.",
    importSnippet: `import { Calendar, type DateRange } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `const [date, setDate] = useState<Date | undefined>();

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  captionLayout="dropdown"
  className="rounded-xl border border-border"
/>`,
    toc: baseToc,
  },
  {
    slug: "card",
    title: "Card",
    description: "Surface with header, title, description, content, and footer slots.",
    importSnippet: `import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Supporting text.</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>`,
    toc: baseToc,
  },
  {
    slug: "chart",
    title: "Chart",
    description: "Recharts composition layer with ChartContainer, tooltips, and theme tokens.",
    importSnippet: `import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@payglocal_ui/flux-ui";
import { Bar, BarChart, XAxis } from "recharts";`,
    usageSnippet: `const config = {
  sales: { label: "Sales", color: "var(--chart-1)" },
} satisfies ChartConfig;

<ChartContainer config={config} className="h-48">
  <BarChart data={[{ m: "Jan", sales: 12 }]}>
    <XAxis dataKey="m" />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="sales" fill="var(--color-chart-1)" radius={4} />
  </BarChart>
</ChartContainer>`,
    toc: baseToc,
  },
  {
    slug: "chart-templates",
    title: "Chart templates",
    description:
      "Dashboard-ready chart and KPI layouts built on Recharts: hero area, grouped bars, ranked lists, category bars, metric sparklines, and attention lists. Pass your data and copy the pattern.",
    importSnippet: `import {
  MetricSparklineCard,
  DashboardAreaChartTemplate,
  GroupedBarChartTemplate,
  RankedBarListTemplate,
  CategoryBarChartTemplate,
  MiniSparklineChartCard,
  AttentionListTemplate,
} from "@payglocal_ui/flux-ui";`,
    usageSnippet: `// Compose templates with your data; each component is a styled card + chart.
<DashboardAreaChartTemplate
  title="Gross volume"
  tabs={[{ id: "gross", label: "Gross volume" }]}
  activeTabId="gross"
  onTabChange={() => {}}
  headline="₹9,42,800"
  data={series}
  xKey="hour"
  areaKey="amount"
  compareLineKey="yesterday"
/>

<MetricSparklineCard
  title="Total volume"
  value="₹8,47,250"
  trend={{ direction: "up", label: "+8.4% vs last month" }}
  data={sparkPoints}
/>`,
    toc: baseToc,
  },
  {
    slug: "currency-amount-input",
    title: "Currency amount input",
    description: "Amount field with currency selector for payment-style flows.",
    importSnippet: `import { CurrencyAmountInput } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `const [currency, setCurrency] = useState("USD");
const [amount, setAmount] = useState("");

<CurrencyAmountInput
  currency={currency}
  amount={amount}
  onCurrencyChange={setCurrency}
  onAmountChange={setAmount}
/>`,
    toc: baseToc,
  },
  {
    slug: "data-table",
    title: "Data table",
    description:
      "Column-driven table with page and cursor pagination, sortable headers, a rows-per-page picker, loading skeleton, and empty state.",
    importSnippet: `import { DataTable, Button, type Column } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `const columns: Column<Row>[] = [
  { key: "name", header: "Name", render: (r) => r.name },
];

// Basic usage — client-side paging at 10 rows a page.
<DataTable rowKey={(r) => r.id} columns={columns} data={rows} />

// ── Pagination ────────────────────────────────────────────────────────
// One \`pagination\` prop covers every mode, so which one an endpoint needs
// is the only thing that differs between two tables.

// The response carries a row TOTAL: a full numbered strip with ellipses,
// and "Showing 1–15 of 141 results".
<DataTable
  rowKey={(r) => r.id}
  columns={columns}
  data={page.rows}
  pagination={{
    mode: "page",
    page,
    pageSize: 15,
    total: page.totalCount,
    onPageChange: setPage,
  }}
/>

// The response carries NO total (a nextCursor / exclusiveStartKey API).
// "Showing 1–15" with no total and no page count, and the strip numbers
// only the pages a cursor can actually step to: the previous page, this
// one, and — only when hasNext says so — the next. On page 2 that reads
// 1 · 2 · 3, so the next page is visible as a number rather than hiding
// behind an arrow.
<DataTable
  rowKey={(r) => r.id}
  columns={columns}
  data={page.rows}
  pagination={{
    mode: "cursor",
    page,
    pageSize: 15,
    hasNext: !!page.nextCursor,
    onNext: () => goForward(page.nextCursor),
    onPrev: () => goBack(),
  }}
/>

// Rows per page — one prop pair, drawn at the far left of the footer.
// No hand-rolled footer, and no second pager in the same app.
<DataTable
  rowKey={(r) => r.id}
  columns={columns}
  data={rows}
  pagination={{
    mode: "page",
    page,
    pageSize,
    total,
    onPageChange: setPage,
    pageSizeOptions: [15, 25, 50, 100],
    onPageSizeChange: (n) => { setPageSize(n); setPage(1); },
  }}
/>

// No footer at all.
<DataTable rowKey={(r) => r.id} columns={columns} data={rows} pagination={{ mode: "none" }} />

// ── Sorting ───────────────────────────────────────────────────────────
// Modelled on antd's Table: a column opts in with \`sorter\`, and state is
// reported as { columnKey, order } using antd's "ascend" / "descend".
// Client and server sorting are told apart by the COLUMN, so one grid can
// mix them.
const columns: Column<Row>[] = [
  // The table sorts these rows itself, before paging.
  { key: "name", header: "Name", sorter: (a, b) => a.name.localeCompare(b.name), render: (r) => r.name },

  // \`true\` = the caller orders the rows (a server query). The table only
  // reports the click. sortDirections starts the cycle at descending,
  // which is the first click money and dates almost always want.
  { key: "amount", header: "Amount", sorter: true, sortDirections: ["descend", "ascend"], render: (r) => r.amount },
];

// Uncontrolled: the table remembers. All a client-sorted grid needs.
<DataTable rowKey={(r) => r.id} columns={columns} data={rows} />

// Controlled: feed the state into the request.
<DataTable
  rowKey={(r) => r.id}
  columns={columns}
  data={rows}
  sorting={{ value: sort, onChange: setSort }}
/>

// Content layout — columns shrink to their intrinsic width; leftover
// space stays empty to the right instead of stretching the columns.
<DataTable
  rowKey={(r) => r.id}
  columns={columns}
  data={rows}
  tableLayout="content"
/>

// Row action — a render-prop button revealed on row hover, pinned to
// the right edge of the viewport. Prefer this over rowCta when you
// need per-row navigation or a custom button style.
<DataTable
  rowKey={(r) => r.id}
  columns={columns}
  data={rows}
  rowAction={(row) => (
    <Button variant="outline" size="sm" onClick={() => openDetails(row)}>
      View details
    </Button>
  )}
/>

// Row click — the whole row is the target, including cell padding and
// the gaps between columns. The row gets cursor-pointer and keyboard
// access (focusable, Enter / Space). Clicks that start inside a button,
// link, form control or anything marked data-row-click-ignore do not
// fire it, so per-row buttons and copy controls keep working on their
// own without stopping propagation.
<DataTable
  rowKey={(r) => r.id}
  columns={columns}
  data={rows}
  onRowClick={(row) => openDetails(row)}
/>`,
    toc: baseToc,
  },
  {
    slug: "data-table-card",
    title: "Data table card",
    description:
      "The table surface: one bordered card holding a title, tabs, a filter toolbar, the grid and a footer \u2014 with the same dividers and gutters every time.",
    importSnippet: `import { DataTableCard, TableToolbarActions } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `// DataTable is the grid. DataTableCard is everything around it \u2014 which is
// where tables actually drift: one feature puts its filters above the card,
// another inside it; one draws a divider under the tabs, another does not.
<DataTableCard
  columns={columns}
  data={rows}
  rowKey={(r) => r.id}
  isLoading={isLoading}
  toolbar={<FilterToolbar search={<RotatingSearchInput \u2026 />} chips={\u2026} />}
  pagination={{ mode: "page", page, pageSize, total, onPageChange: setPage }}
  onRowClick={(row) => openDetails(row)}
  emptyTitle="No transactions found"
/>

// A named section \u2014 for a grid that titles itself, rather than a page-level
// grid whose name is the page header.
<DataTableCard
  title="Top 10 Merchants by Volume"
  description="Last 30 days"
  actions={<ToolbarButton>Refresh</ToolbarButton>}
  columns={columns}
  data={rows}
  rowKey={(r) => r.id}
  maxBodyHeight="34rem"
/>

// The body scrolls inside the card by default, so the toolbar and footer stay
// put and the page does not grow. Pass "none" to let the card grow instead.
<DataTableCard \u2026 maxBodyHeight="none" />

// \`errorState\` replaces the rows when the request failed, \`emptyState\` when it
// succeeded and returned none. Keeping them apart matters: column headers over
// nothing say "we looked and found none", which is wrong for a failed fetch.
<DataTableCard
  \u2026
  errorState={isError ? <PlaceholderState variant="error" \u2026 /> : undefined}
  emptyState={<PlaceholderState variant="no-transactions" \u2026 />}
/>

// Below the table's breakpoint, pair it with DataCardList rather than hiding
// columns: both mount, CSS shows one, and they take the same \`pagination\`
// object so they cannot disagree about which page they are on.
<DataTableCard className="hidden lg:block" \u2026 pagination={pagination} />
<DataCardList className="lg:hidden" \u2026 pagination={pagination} />`,
    toc: baseToc,
  },
  {
    slug: "data-card-list",
    title: "Data card list",
    description:
      "The narrow-viewport counterpart to the table: the same records as a stack of cards, sharing the table's pagination.",
    importSnippet: `import { DataCardList } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `// A card list is not a table with its columns hidden — it picks a handful
// of fields, gives them a hierarchy and drops the rest. So it is its own
// component rather than a mode of DataTableCard, which would otherwise
// carry two layouts and a breakpoint, and make every table pay for props
// it does not use.
//
// It owns the surface: the bordered container, the loading skeletons, the
// empty and error states, and the pager. The card itself stays with the
// feature, via renderCard — that is the part that genuinely differs.
<DataCardList
  rows={rows}
  rowKey={(r) => r.id}
  renderCard={(row) => <TransactionCard row={row} onOpen={open} />}
  renderSkeleton={() => <TransactionCardSkeleton />}
  emptyState={<PlaceholderState variant="no-transactions" size="sm" />}
  errorState={isError ? errorPanel : undefined}
  pagination={pagination}
/>

// ── Pair it with the table using CSS, never a breakpoint hook ─────────
// Both mount; CSS shows one. A JS hook has to guess on the server, so one
// cohort sees the wrong layout on first paint, and resizing across the
// breakpoint unmounts the visible half — taking scroll position and any
// open row with it.
<DataTableCard className="hidden lg:block" … pagination={pagination} />
<DataCardList  className="lg:hidden"      … pagination={pagination} />

// Hand both the SAME pagination object and the two surfaces cannot
// disagree about which page they are on. The list renders it as a compact
// Prev / Page X of Y / Next — a row of page numbers is the first thing to
// go wrong on a phone — and shows no "of N" in cursor mode, where there
// is no total to be honest about.`,
    toc: baseToc,
  },
  {
    slug: "copyable-cell",
    title: "Copyable cell",
    description:
      "An identifier cell: the value plus a copy button that fades in on the row's hover.",
    importSnippet: `import { CopyableCell } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `// Reveal-on-hover is the point. Twelve ids with twelve permanent copy buttons
// is twelve pieces of chrome competing with the data; the row the pointer is
// on is the only one whose button is useful.
<CopyableCell value={row.gid} label="Transaction ID" />

// \`onClick\` makes the id the handle that opens the row. The copy button stops
// propagation, so copying never also opens it.
<CopyableCell value={row.gid} label="Transaction ID" accent onClick={() => open(row)} />

// \`display\` shortens what is on SCREEN only \u2014 the clipboard, the tooltip and
// the accessible name all still carry the full value, so shortening what is
// shown never shortens what the user walks away with.
<CopyableCell value={row.utr} display={truncateMiddle(row.utr)} label="UTR" />

// It relies on the row's own \`group\` class, which every DataTable <tr> carries.
// Outside a DataTable row, put \`className="group"\` on an ancestor.`,
    toc: baseToc,
  },
  {
    slug: "rotating-search-input",
    title: "Rotating search input",
    description:
      "One search field whose placeholder cycles through the fields it can actually match.",
    importSnippet: `import { RotatingSearchInput } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `// A grid search usually spans half a dozen fields, and a static "Search"
// placeholder names none of them \u2014 so people guess at what is searchable and
// conclude the box is broken when the guess misses. Naming the fields in turn
// costs no space and answers it.
<RotatingSearchInput
  words={["Amount", "Transaction ID", "Email", "Customer name"]}
  onSearch={setQuery}
  ariaLabel="Search transactions"
  className="w-40 sm:w-56"
/>

// onSearch is debounced (300ms by default), so a search that hits the network
// fires once the user pauses rather than once per keystroke.
<RotatingSearchInput words={words} onSearch={runQuery} debounceDelay={500} />`,
    toc: baseToc,
  },
  {
    slug: "column-manager",
    title: "Column manager",
    description:
      "Drag to reorder, tick to show or hide, with independently locked and pinned columns and a reset — the one column editor every grid uses.",
    importSnippet: `import {
  ColumnManager,
  useColumnPreferences,
  applyColumnPreferences,
  type ManagedColumn,
} from "@payglocal_ui/flux-ui";`,
    usageSnippet: `// Plain-text names for the manager's list — a table header can be a node
// (an icon, a tooltip, a two-line stack), and this list needs text.
const managed: ManagedColumn[] = [
  { key: "txn", label: "Transaction ID" },
  { key: "merchant", label: "Merchant" },
  { key: "amount", label: "Amount" },
];

const DEFAULT_ORDER = managed.map((c) => c.key);

// Owns the arrangement. A storageKey remembers it across visits;
// omit it and the arrangement lasts the session, which is what a grid
// whose columns depend on the signed-in role wants.
const prefs = useColumnPreferences(DEFAULT_ORDER, { storageKey: "txn-columns" });

// Rearranges and filters the built column list to match. "action" stays
// pinned last whatever the saved order says, and a column added in a
// later release still appears for someone who saved an arrangement
// before it existed.
const columns = applyColumnPreferences(allColumns, prefs);

<ColumnManager
  columns={managed}
  {...prefs.managerProps}      // order / hidden / reset, already wired

  // Visibility and position are independent, and neither is inferred
  // from the other. A column the table cannot do without is still one
  // the user may want to move; a column frozen to the left edge is still
  // one they may want to hide.

  // Cannot be HIDDEN. Locked tick box, but still draggable.
  fixedKeys={["txn"]}
  fixedReason="Every row is identified by its transaction ID."

  // Cannot be MOVED. Dimmed grip, but its tick box still works. The usual
  // case is a frozen (sticky) column: its left offset is the running
  // total of the widths of the frozen columns before it, so the block
  // only works while they stay first and contiguous — drag one into the
  // middle and it keeps left-0, floating over the scrolling columns.
  pinnedKeys={["merchantId", "gid"]}
  pinnedReason="Frozen to the left of the table."
/>

<DataTable columns={columns} data={rows} rowKey={(r) => r.id} />

// Wiring the state by hand instead of using the hook:
<ColumnManager
  columns={managed}
  order={order}
  onOrderChange={setOrder}
  hiddenKeys={hidden}          // omit, with onHiddenKeysChange, for
  onHiddenKeysChange={setHidden}  // a reorder-only popover
  onReset={() => { setOrder(DEFAULT_ORDER); setHidden([]); }}
/>

// Reordering is @dnd-kit, so the rows animate out of each other's way
// as one is dragged past them. Keyboard users reorder without a mouse:
// Space picks a row up, the arrows move it, Space drops it, Escape
// abandons it.
//
// @dnd-kit is a peer of the bundle, not inlined into it — an app that
// uses ColumnManager needs @dnd-kit/core, /sortable and /utilities
// installed, which both PayGlocal apps already do.`,
    toc: baseToc,
  },
  {
    slug: "filter-chips",
    title: "Filter chips",
    description:
      "The filter toolbar: dashed pills that open staged editors, one open at a time, plus a searchable menu for reaching every filter a table has.",
    importSnippet: `import {
  FilterToolbar,
  FilterChipGroup,
  SelectFilterChip,
  SingleSelectFilterChip,
  DateRangeFilterChip,
  CalendarDateFilterChip,
  NumberRangeFilterChip,
  TextFilterChip,
  MonthRangeFilterChip,
  AddFilterMenu,
  FilterChip,
} from "@payglocal_ui/flux-ui";`,
    usageSnippet: `// FilterToolbar lays out search / chips / actions and wraps the chips in
// a FilterChipGroup, so exactly one popover is open at a time — and
// switching between two chips does not make the second one flash.
//
// That flash is why the group exists. Every chip sharing one openChip
// value while Radix reports the switch as two separate events means a
// naive setOpenChip(open ? key : null) lets whichever event lands second
// win: when the dismissal lands second it wipes out the chip that just
// opened, so it mounts, paints and unmounts. The group makes a close
// count only if the chip closing is still the one on screen. No page
// needs openChip state any more.
<FilterToolbar
  search={<SearchInput />}
  chips={
    <>
      <DateRangeFilterChip value={date} onChange={setDate} />
      <SelectFilterChip
        label="Status"
        options={STATUS}
        selected={status}
        onChange={setStatus}
      />
      <NumberRangeFilterChip value={amount} onChange={setAmount} prefix="₹" />
      <SingleSelectFilterChip
        label="Settlement cycle"
        options={CYCLES}
        value={cycle}
        onChange={setCycle}
        showValueInLabel
      />
    </>
  }
  actions={<Button>Export</Button>}
/>

// ── Reaching every filter ─────────────────────────────────────────────
// AddFilterMenu replaces a "More filters" drawer of leftovers. Typing
// searches filter NAMES and their VALUES at once, so someone who knows
// they want "USD" finds it without first knowing it lives under
// Currency — and choosing anything promotes that filter to a real chip,
// so there is exactly one place a filter can be.
<AddFilterMenu
  filters={[
    { key: "currency", label: "Currency", options: CURRENCY, activeCount: currency.length },
    { key: "acquirer", label: "Acquirer", options: ACQUIRER, activeCount: acquirer.length },
    { key: "amount", label: "Amount" },   // no options: findable by name
  ]}
  visibleKeys={visible}
  onAddFilter={(key) => setVisible((v) => [...v, key])}
  // Supply this and the filter rows become toggles: a ticked filter is in
  // the toolbar, and the menu stays open so turning several on is one
  // visit. Removing must also CLEAR that filter — a chip is shown whenever
  // it holds values, so a filter removed with values still applied would
  // either bounce straight back or keep narrowing the table invisibly.
  onRemoveFilter={(key) => { setVisible((v) => v.filter((k) => k !== key)); clear(key); }}
  onSelectValue={(filterKey, value) => apply(filterKey, value)}
/>

// A chip's own × only CLEARS its values; it stays in the toolbar. Removing
// it is a deliberate trip back to the menu, so clearing a filter you are
// still working with never makes the control vanish under the pointer.

// ── Both footer buttons commit and close ──────────────────────────────
// Apply commits the draft; Clear drops the filter. Clear is NOT "untick
// everything and carry on" — that leaves the panel open over a filter
// still in force, so the chip reads "Status 2" above a list showing
// nothing ticked, and closing the panel silently keeps the old value.
// Clear stays enabled whenever there is anything to drop, including an
// applied value whose draft has just been emptied by hand.

// ── Seven chips, one for each shape ───────────────────────────────────
// SelectFilterChip      multi-select; search past 8 options, count on the pill
// SingleSelectFilterChip one-of-many; applies on pick, nothing to stage
// DateRangeFilterChip   two typed date fields, optional relative tab
// CalendarDateFilterChip a real calendar, single or range, optional presets
// NumberRangeFilterChip min / max, optional currency prefix
// TextFilterChip        one free-text value, Enter applies
// MonthRangeFilterChip  start / end month on a year grid

// Pick between the two date chips by how people reach for the filter:
// typed fields for a known span, a calendar for "that Tuesday" or "the
// week of the 14th", where two text inputs make you count days.
<CalendarDateFilterChip
  label="Settlement date"
  value={date}
  onChange={setDate}
  // resolve() runs when the preset is CHOSEN, so "last 7 days" counts
  // back from the click rather than from whenever this array was built.
  presets={[
    { value: "today", label: "Today", resolve: () => lastDays(0) },
    { value: "last7", label: "Last 7 days", resolve: () => lastDays(6) },
  ]}
/>

// ── A relative date range ─────────────────────────────────────────────
// "Last 2 days" is a duration, not a pair of dates: resolving it when the
// user picks it quietly freezes it at that moment. The chip reports the
// duration and you resolve it at request time, where now is still now.
<DateRangeFilterChip
  value={range}
  onChange={setRange}
  relativeValue={relative}
  onRelativeChange={setRelative}   // adding this turns on the "Last…" tab
/>
const window = relativeRangeToMillis(relative);  // call in the handler

// The two modes are exclusive: applying one clears the other, so a
// request is never built from an absolute window AND a relative one.

// ── Excluding instead of including ────────────────────────────────────
// Supply onInvertChange and the panel grows an "Invert filter" tick. It
// is staged with the options and applied with them, because inverting
// without changing the set still changes what the table shows. An
// inverted chip says so on the pill — "Status (excluded)" — since the
// count alone would be identical either way.
<SelectFilterChip
  label="Status"
  options={STATUS}
  selected={status}
  onChange={setStatus}
  invert={invert}
  onInvertChange={setInvert}
/>

// ── A one-off chip ────────────────────────────────────────────────────
// Build on FilterChip rather than reassembling the shell, so a bespoke
// filter still opens, closes and clears like the rest. onOpen reseeds the
// draft from the applied value, so an abandoned edit never leaks back.
<FilterChip
  chipKey="risk"
  label="Risk score"
  active={score !== ""}
  onClear={() => setScore("")}
  onOpen={() => setDraft(score)}
>
  <RiskSlider value={draft} onChange={setDraft} />
  <FilterChipActions onClear={() => setDraft("")} onApply={() => setScore(draft)} />
</FilterChip>`,
    toc: baseToc,
  },
  {
    slug: "date-picker",
    title: "Date picker",
    description: "Single-date calendar popover with keyboard-friendly grid.",
    importSnippet: `import { DatePicker } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `const [value, setValue] = useState("");

<DatePicker value={value} onChange={setValue} placeholder="Pick a date" />

// Bound it. Days outside min/max are struck out and cannot be clicked, so
// an out-of-range date is refused BEFORE the click rather than rejected
// afterwards — a feature once hand-rolled a whole date chip to enforce an
// upper bound on Apply, which is the version of this that reads as a bug.
<DatePicker value={to} onChange={setTo} min={from} max={today} />`,
    toc: baseToc,
  },
  {
    slug: "dialog",
    title: "Dialog",
    description: "Modal layer with overlay, focus management, and close control.",
    importSnippet: `import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Dialog>
  <DialogTrigger asChild>
    <button type="button">Open</button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Description</DialogDescription>
  </DialogContent>
</Dialog>`,
    toc: baseToc,
  },
  {
    slug: "dropdown-menu",
    title: "Dropdown menu",
    description: "Anchored menu for row actions, headers, and compact command lists.",
    importSnippet: `import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button type="button">Open</button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
    toc: baseToc,
  },
  {
    slug: "empty-state",
    title: "Empty state",
    description: "Centered empty panels with title, description, and optional action.",
    importSnippet: `import { EmptyState, Button } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<EmptyState
  title="No results"
  description="Try adjusting filters."
  action={<Button variant="outline" size="sm">Reset</Button>}
/>`,
    toc: baseToc,
  },
  {
    slug: "field",
    title: "Field",
    description: "Form layout primitives: Field, FieldLabel, FieldError, FieldGroup, FieldSet.",
    importSnippet: `import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldDescription,
  FieldError,
  Input,
} from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<FieldGroup className="max-w-sm">
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <FieldDescription>We will never share your email.</FieldDescription>
    <Input id="email" type="email" />
    <FieldError>Invalid email</FieldError>
  </Field>
</FieldGroup>`,
    toc: [...baseToc, { id: "related", label: "Related" }],
  },
  {
    slug: "input",
    title: "Input",
    description: "Text field, textarea, and label primitives for forms.",
    importSnippet: `import { Input, Textarea, Label } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Label htmlFor="x">Name</Label>
<Input id="x" placeholder="Jane" />
<Textarea placeholder="Notes" rows={3} />`,
    toc: [
      { id: "preview", label: "Preview" },
      { id: "installation", label: "Installation" },
      { id: "usage", label: "Usage" },
    ],
  },
  {
    slug: "otp-input",
    title: "OTP input",
    description: "Multi-box numeric code entry with auto-advance, backspace navigation, and paste support.",
    importSnippet: `import { OtpInput } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `const [otp, setOtp] = useState("");

<OtpInput
  value={otp}
  onChange={setOtp}
  length={6}
  onComplete={(code) => console.log("done", code)}
/>`,
    toc: baseToc,
  },
  {
    slug: "input-group",
    title: "Input group",
    description: "Addons, icons, and inline actions around inputs and textareas.",
    importSnippet: `import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<InputGroup>
  <InputGroupAddon>https://</InputGroupAddon>
  <InputGroupInput placeholder="example.com" />
</InputGroup>`,
    toc: baseToc,
  },
  {
    slug: "layout-primitives",
    title: "Layout primitives",
    description:
      "Box, Stack, and Inline helpers with token-aligned spacing props (same Tailwind steps as the dashboard). Prefer Tailwind `className` for radii and colors.",
    importSnippet: `import { Box, Stack, Inline } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Stack gap="lg">
  <Box p="md" className="rounded-xl border border-border">
    <Stack gap="sm">…</Stack>
  </Box>
  <Inline gap="md" justify="between">
    <span>Title</span>
    <Button size="sm" variant="outline">Action</Button>
  </Inline>
</Stack>`,
    toc: baseToc,
  },
  {
    slug: "password-input",
    title: "Password input",
    description: "Secure text field with a show/hide visibility toggle.",
    importSnippet: `import { PasswordInput } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Label htmlFor="pwd">Password</Label>
<PasswordInput id="pwd" placeholder="Enter your password" />`,
    toc: baseToc,
  },
  {
    slug: "page-header",
    title: "Page header",
    description: "List and detail page titles with optional actions slot.",
    importSnippet: `import { PageHeader, Button } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<PageHeader
  title="Transactions"
  subtitle="Recent transactions"
  actions={<Button size="sm">Export</Button>}
/>`,
    toc: baseToc,
  },
  {
    slug: "popover",
    title: "Popover",
    description: "Anchored floating panel for filters, pickers, and compact forms.",
    importSnippet: `import { Popover, PopoverContent, PopoverTrigger } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Popover>
  <PopoverTrigger asChild>
    <button type="button">Open</button>
  </PopoverTrigger>
  <PopoverContent>Content</PopoverContent>
</Popover>

// ── A panel that must not run off the bottom ──────────────────────────
// A trigger low on a long page has very little room beneath it, and a
// tall list plus a footer will run past the fold — the last options, and
// often Apply itself, end up unreachable. Radix measures that space; cap
// the content to it and lay the panel out as a column, so the fixed
// chrome stays put and only the list scrolls.
<PopoverContent className="flex max-h-[var(--radix-popover-content-available-height)] flex-col overflow-hidden">
  <div className="shrink-0 …">{header}</div>
  <div className="min-h-0 flex-1 overflow-y-auto">{list}</div>
  <div className="shrink-0 …">{footer}</div>
</PopoverContent>

// min-h-0 is what lets a flex child shrink below its content height at
// all; without it the list refuses to scroll and pushes the footer out.
// PopoverContent already keeps a 12px gutter from the viewport edge.`,
    toc: baseToc,
  },
  {
    slug: "scroll-area",
    title: "Scroll area",
    description: "Custom scrollbars for dense panels and sidebars.",
    importSnippet: `import { ScrollArea } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<ScrollArea className="h-48 rounded-xl border border-border p-3">
  …long content…
</ScrollArea>`,
    toc: baseToc,
  },
  {
    slug: "select",
    title: "Select",
    description: "Styled native-style select built on Radix Select.",
    importSnippet: `import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Select defaultValue="a">
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Choose" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
    <SelectItem value="b">Option B</SelectItem>
  </SelectContent>
</Select>`,
    toc: baseToc,
  },
  {
    slug: "separator",
    title: "Separator",
    description: "Visual divider; also composed inside FieldSeparator.",
    importSnippet: `import { Separator } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Separator className="my-4" />
<Separator orientation="vertical" className="mx-2 h-6" />`,
    toc: baseToc,
  },
  {
    slug: "skeleton",
    title: "Skeleton",
    description: "Shimmer placeholders for tables, charts, and stat cards.",
    importSnippet: `import { Shimmer, StatCardSkeleton, TableRowSkeleton } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<StatCardSkeleton />
<TableRowSkeleton cols={4} />

// DataTable does NOT use TableRowSkeleton — it builds its loading rows
// from its own columns, so each placeholder cell carries that column's
// width, alignment and sticky classes and lines up under its header.
// A generic "n cells" row came up short against a table with a greedy
// spacer column, which read as a column missing while loading.
// TableRowSkeleton stays for a hand-rolled table outside DataTable.`,
    toc: baseToc,
  },
  {
    slug: "sonner",
    title: "Sonner",
    description: "Themed toast host and toast() API (wraps sonner + next-themes).",
    importSnippet: `import { Toaster, toast } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `// Root layout
<Toaster />

// Client
toast.success("Saved");`,
    toc: baseToc,
  },
  {
    slug: "status-badge",
    title: "Status badge",
    description: "Workflow states for payments, disputes, and settlements.",
    importSnippet: `import { StatusBadge } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<StatusBadge variant="success" label="Settled" trailIcon="check" />
<StatusBadge variant="warning" label="Pending" />
<StatusBadge variant="danger"  label="Failed"  trailIcon="x" />`,
    toc: baseToc,
  },
  {
    slug: "tabs",
    title: "Tabs",
    description: "Section switching without navigation (Radix Tabs).",
    importSnippet: `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Tabs defaultValue="a">
  <TabsList>
    <TabsTrigger value="a">Tab A</TabsTrigger>
    <TabsTrigger value="b">Tab B</TabsTrigger>
  </TabsList>
  <TabsContent value="a">Panel A</TabsContent>
  <TabsContent value="b">Panel B</TabsContent>
</Tabs>`,
    toc: baseToc,
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    description: "Hover and focus hints; wrap with TooltipProvider.",
    importSnippet: `import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button type="button">Hover</button>
    </TooltipTrigger>
    <TooltipContent>Hint</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
    toc: baseToc,
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    description: "Checkbox input with indeterminate state, sizes, and accessible label support.",
    importSnippet: `import { Checkbox } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Checkbox id="terms" />
<label htmlFor="terms">Accept terms and conditions</label>

{/* Indeterminate */}
<Checkbox checked="indeterminate" />`,
    toc: baseToc,
  },
  {
    slug: "radio",
    title: "Radio",
    description: "Radio group for single selection from a list of options.",
    importSnippet: `import { RadioGroup, RadioGroupItem } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<RadioGroup defaultValue="card">
  <RadioGroupItem value="card" id="card" />
  <label htmlFor="card">Card</label>
  <RadioGroupItem value="upi" id="upi" />
  <label htmlFor="upi">UPI</label>
</RadioGroup>`,
    toc: baseToc,
  },
  {
    slug: "switch",
    title: "Switch",
    description: "Toggle switch for binary on/off settings.",
    importSnippet: `import { Switch } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Switch id="notifications" />
<label htmlFor="notifications">Enable notifications</label>`,
    toc: baseToc,
  },
  {
    slug: "slider",
    title: "Slider",
    description: "Range slider for selecting numeric values within a min/max range.",
    importSnippet: `import { Slider } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `const [value, setValue] = useState([50]);

<Slider
  min={0}
  max={100}
  step={1}
  value={value}
  onValueChange={setValue}
  className="w-64"
/>`,
    toc: baseToc,
  },
  {
    slug: "breadcrumbs",
    title: "Breadcrumbs",
    description: "Navigation trail showing current page location within the hierarchy.",
    importSnippet: `import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/payments">Payments</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Details</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`,
    toc: baseToc,
  },
  {
    slug: "pagination",
    title: "Pagination",
    description: "Page navigation controls for multi-page lists and tables.",
    importSnippet: `import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>`,
    toc: baseToc,
  },
  {
    slug: "alert",
    title: "Alert",
    description: "Inline status messages for info, success, warning, and error states.",
    importSnippet: `import { Alert, AlertTitle, AlertDescription } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Alert variant="info">
  <AlertTitle>Heads up</AlertTitle>
  <AlertDescription>Your payout will be processed in 2 business days.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Payment failed. Please try again.</AlertDescription>
</Alert>`,
    toc: baseToc,
  },
  {
    slug: "badge",
    title: "Badge",
    description: "Generic label chip for categorization, counts, and status indicators.",
    importSnippet: `import { Badge } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>`,
    toc: baseToc,
  },
  {
    slug: "tag",
    title: "Tag",
    description: "Removable label chips for filters and multi-select values.",
    importSnippet: `import { Tag, TagGroup } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<TagGroup>
  <Tag onRemove={() => {}}>Visa</Tag>
  <Tag onRemove={() => {}}>Mastercard</Tag>
  <Tag onRemove={() => {}}>UPI</Tag>
</TagGroup>`,
    toc: baseToc,
  },
  {
    slug: "spinner",
    title: "Spinner",
    description: "Loading indicator for async operations and pending states.",
    importSnippet: `import { Spinner } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Spinner />
<Spinner size="sm" />
<Spinner size="lg" className="text-primary" />`,
    toc: baseToc,
  },
  {
    slug: "drawer",
    title: "Drawer",
    description: "Slide-in panel from any edge for secondary content and forms.",
    importSnippet: `import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Drawer>
  <DrawerTrigger asChild>
    <button type="button">Open drawer</button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Filter transactions</DrawerTitle>
    </DrawerHeader>
    <p className="px-4">Content goes here.</p>
  </DrawerContent>
</Drawer>`,
    toc: baseToc,
  },
  {
    slug: "progress",
    title: "Progress",
    description: "Progress bar and step tracker for multi-step flows and completion states.",
    importSnippet: `import { Progress, ProgressTracker } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `{/* Linear progress bar */}
<Progress value={60} className="w-full" />

{/* Step tracker */}
<ProgressTracker
  steps={["Details", "Review", "Confirm"]}
  currentStep={1}
/>`,
    toc: baseToc,
  },
  {
    slug: "accordion",
    title: "Accordion",
    description: "Collapsible content sections for FAQs and grouped settings.",
    importSnippet: `import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Accordion type="single" collapsible>
  <AccordionItem value="q1">
    <AccordionTrigger>What is the settlement cycle?</AccordionTrigger>
    <AccordionContent>Settlements are processed on T+1 business days.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="q2">
    <AccordionTrigger>How do I raise a dispute?</AccordionTrigger>
    <AccordionContent>Navigate to Disputes and click New Dispute.</AccordionContent>
  </AccordionItem>
</Accordion>`,
    toc: baseToc,
  },
  {
    slug: "callout",
    title: "Callout",
    description: "Prominent inline message for guidance, tips, and contextual information.",
    importSnippet: `import { Callout, CalloutTitle, CalloutText } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Callout variant="info">
  <CalloutTitle>Note</CalloutTitle>
  <CalloutText>Webhook retries are attempted up to 3 times with exponential backoff.</CalloutText>
</Callout>

<Callout variant="warning">
  <CalloutTitle>Action required</CalloutTitle>
  <CalloutText>Complete your KYC to unlock higher transaction limits.</CalloutText>
</Callout>`,
    toc: baseToc,
  },
  {
    slug: "code",
    title: "Code",
    description: "Inline code and multi-line code blocks with copy-to-clipboard.",
    importSnippet: `import { Code, CodeBlock } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `{/* Inline */}
<p>Pass the <Code>amount</Code> as a number in paise.</p>

{/* Block */}
<CodeBlock language="json">
  {JSON.stringify({ status: "SUCCESS", txnId: "TXN123" }, null, 2)}
</CodeBlock>`,
    toc: baseToc,
  },
  {
    slug: "command",
    title: "Command",
    description: "Command palette with keyboard navigation for search and quick actions.",
    importSnippet: `import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Command className="rounded-xl border border-border shadow-md">
  <CommandInput placeholder="Search components..." />
  <CommandList>
    <CommandGroup heading="Components">
      <CommandItem>Button</CommandItem>
      <CommandItem>Card</CommandItem>
      <CommandItem>Dialog</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`,
    toc: baseToc,
  },
  {
    slug: "icon-button",
    title: "Icon button",
    description: "Square icon-only button with variants, sizes, and required aria-label.",
    importSnippet: `import { IconButton } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<IconButton aria-label="Close" icon={<XIcon />} />`,
    toc: baseToc,
  },
  {
    slug: "button-group",
    title: "Button group",
    description: "Connected row of buttons sharing borders. Also includes SplitButton.",
    importSnippet: `import { ButtonGroup, SplitButton } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<ButtonGroup>
  <Button>Left</Button>
  <Button>Center</Button>
  <Button>Right</Button>
</ButtonGroup>`,
    toc: baseToc,
  },
  {
    slug: "time-picker",
    title: "Time picker",
    description: "Popover time selector with 12/24h format and scrollable hour/minute columns.",
    importSnippet: `import { TimePicker } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `const [time, setTime] = useState("");

<TimePicker value={time} onChange={setTime} />`,
    toc: baseToc,
  },
  {
    slug: "form",
    title: "Form",
    description: "Lightweight form validation wrapper with useForm hook, field errors, and accessible labels.",
    importSnippet: `import { Form, useForm } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `const form = useForm({ defaultValues: { email: "" } });

<Form form={form} onSubmit={(values) => console.log(values)}>
  <Input {...form.register("email")} />
</Form>`,
    toc: baseToc,
  },
  {
    slug: "inline-edit",
    title: "Inline edit",
    description: "Click-to-edit text component for in-place editing of values.",
    importSnippet: `import { InlineEdit } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `const [value, setValue] = useState("Click to edit");

<InlineEdit value={value} onChange={setValue} />`,
    toc: baseToc,
  },
  {
    slug: "lozenge",
    title: "Lozenge",
    description: "Compact bold uppercase status chip for workflow states.",
    importSnippet: `import { Lozenge } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Lozenge appearance="success">Approved</Lozenge>
<Lozenge appearance="removed">Rejected</Lozenge>`,
    toc: baseToc,
  },
  {
    slug: "section-message",
    title: "Section message",
    description: "Full-width prominent message block with colored border accent and action slots.",
    importSnippet: `import { SectionMessage } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<SectionMessage
  appearance="warning"
  title="KYC incomplete"
  actions={<Button size="sm">Complete KYC</Button>}
>
  Verify your details to unlock higher limits.
</SectionMessage>`,
    toc: baseToc,
  },
  {
    slug: "flag",
    title: "Flag",
    description: "Auto-dismissable floating notification with progress bar and useFlagGroup hook.",
    importSnippet: `import { Flag, useFlagGroup } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `const { addFlag } = useFlagGroup();

addFlag({ title: "Payment successful", appearance: "success" });`,
    toc: baseToc,
  },
  {
    slug: "heading",
    title: "Heading",
    description: "Typed h1–h6 heading component with size/color variants.",
    importSnippet: `import { Heading } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Heading as="h1" size="xl">Dashboard</Heading>
<Heading as="h2" size="lg" color="subtle">Overview</Heading>`,
    toc: baseToc,
  },
  {
    slug: "text",
    title: "Text",
    description: "Semantic text and MetricText primitives with size, weight, and color variants.",
    importSnippet: `import { Text, MetricText } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Text size="sm" color="subtle">Last updated 2 hours ago.</Text>
<MetricText size="xl">₹9,42,800</MetricText>`,
    toc: baseToc,
  },
  {
    slug: "visually-hidden",
    title: "Visually hidden",
    description: "Screen-reader-only wrapper; optionally visible on focus for skip links.",
    importSnippet: `import { VisuallyHidden } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<VisuallyHidden>Skip to main content</VisuallyHidden>`,
    toc: baseToc,
  },
  {
    slug: "blanket",
    title: "Blanket",
    description: "Full-screen overlay backdrop for modals and custom layered UI.",
    importSnippet: `import { Blanket } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Blanket isTinted onBlanketClicked={() => setOpen(false)} />`,
    toc: baseToc,
  },
  {
    slug: "inline-dialog",
    title: "Inline dialog",
    description: "Small anchored floating dialog with arrow pointer toward the trigger.",
    importSnippet: `import { InlineDialog } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<InlineDialog isOpen={open} onClose={() => setOpen(false)} placement="bottom-start">
  <p>Quick confirmation message.</p>
</InlineDialog>`,
    toc: baseToc,
  },
  {
    slug: "spotlight",
    title: "Spotlight",
    description: "Guided onboarding overlay with step cards, dot indicators, and useSpotlight hook.",
    importSnippet: `import { SpotlightManager, SpotlightTarget, useSpotlight } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<SpotlightManager>
  <SpotlightTarget name="export-button">
    <Button>Export</Button>
  </SpotlightTarget>
</SpotlightManager>`,
    toc: baseToc,
  },
  {
    slug: "menu",
    title: "Menu",
    description: "Standalone vertical navigation menu with sections, items, and danger states.",
    importSnippet: `import { Menu, MenuSection, MenuItem } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Menu>
  <MenuSection title="Account">
    <MenuItem>Profile</MenuItem>
    <MenuItem isDanger>Delete account</MenuItem>
  </MenuSection>
</Menu>`,
    toc: baseToc,
  },
  {
    slug: "side-nav",
    title: "Side nav",
    description: "Collapsible sidebar navigation with header, sections, and footer slots.",
    importSnippet: `import { SideNav, SideNavSection, SideNavItem } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<SideNav header={<Logo />} footer={<UserMenu />}>
  <SideNavSection title="Payments">
    <SideNavItem href="/transactions">Transactions</SideNavItem>
    <SideNavItem href="/disputes">Disputes</SideNavItem>
  </SideNavSection>
</SideNav>`,
    toc: baseToc,
  },
  {
    slug: "progress-indicator",
    title: "Progress indicator",
    description: "Dot-based step/page indicator with animated active pill.",
    importSnippet: `import { ProgressIndicator } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<ProgressIndicator steps={4} selectedIndex={1} />`,
    toc: baseToc,
  },
  {
    slug: "responsive",
    title: "Responsive",
    description: "Show/Hide components and useBreakpoint hook for responsive layouts.",
    importSnippet: `import { Show, Hide, useBreakpoint } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<Show above="md">
  <DesktopSidebar />
</Show>
<Hide above="md">
  <MobileDrawer />
</Hide>`,
    toc: baseToc,
  },
  {
    slug: "checkbox-select",
    title: "Checkbox select",
    description: "Multi-select dropdown with checkboxes, search, and select-all.",
    importSnippet: `import { CheckboxSelect } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `const [selected, setSelected] = useState<string[]>([]);

<CheckboxSelect
  options={[{ label: "Card", value: "card" }, { label: "UPI", value: "upi" }]}
  value={selected}
  onChange={setSelected}
  placeholder="Select methods"
/>`,
    toc: baseToc,
  },
  {
    slug: "country-select",
    title: "Country select",
    description: "Select with flag emoji, country name, and dial code.",
    importSnippet: `import { CountrySelect } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `const [country, setCountry] = useState("IN");

<CountrySelect value={country} onChange={setCountry} />`,
    toc: baseToc,
  },
  {
    slug: "avatar-tag",
    title: "Avatar tag",
    description: "Compact tag chip combining an avatar with a label and optional remove button.",
    importSnippet: `import { AvatarTag } from "@payglocal_ui/flux-ui";`,
    usageSnippet: `<AvatarTag
  src="/avatar.png"
  label="Deepankar Raj"
  onRemove={() => {}}
/>`,
    toc: baseToc,
  },
];

export const COMPONENT_BY_SLUG = Object.fromEntries(COMPONENT_DOC_PAGES.map((p) => [p.slug, p]));

export function getSortedComponentPages(): ComponentDocPage[] {
  return [...COMPONENT_DOC_PAGES].sort((a, b) => a.title.localeCompare(b.title));
}
