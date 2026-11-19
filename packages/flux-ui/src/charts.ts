// Charts live behind their own entry point (`@payglocal_ui/flux-ui/charts`)
// rather than the root barrel.
//
// recharts and its d3 dependencies are ~144 KB gzipped. A bundler's smallest
// unit of chunking is a module, so while these lived in `index.ts` every app
// that imported anything at all from flux-ui — a Button, a Card — pulled
// recharts into its shared chunk. Measured on pg-internal-v2: recharts sat in
// the payload of all 176 routes to serve the 10 files that actually draw a
// chart. Splitting the entry is what lets it be dropped or lazily loaded.
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
} from "./chart";
export type { ChartConfig } from "./chart";
export {
  MetricSparklineCard,
  DashboardAreaChartTemplate,
  GroupedBarChartTemplate,
  RankedBarListTemplate,
  CategoryBarChartTemplate,
  MiniSparklineChartCard,
  AttentionListTemplate,
} from "./chart-templates";
export type {
  MetricSparklinePoint,
  MetricSparklineCardProps,
  DashboardAreaChartPoint,
  DashboardAreaChartTemplateProps,
  GroupedBarSeries,
  GroupedBarChartTemplateProps,
  RankedBarItem,
  RankedBarListTemplateProps,
  CategoryBarPoint,
  CategoryBarChartTemplateProps,
  MiniSparklinePoint,
  MiniSparklineStat,
  MiniSparklineChartCardProps,
  AttentionListItem,
  AttentionListTemplateProps,
} from "./chart-templates";
