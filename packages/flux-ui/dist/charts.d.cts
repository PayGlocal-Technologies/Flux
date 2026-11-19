import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { TooltipValueType } from 'recharts';

/**
 * Chart primitives from shadcn/ui (Recharts composition layer).
 * @see https://ui.shadcn.com/docs/components/radix/chart
 */

declare const THEMES: {
    readonly light: "";
    readonly dark: ".dark";
};
type TooltipNameType = number | string;
type ChartConfig = Record<string, {
    label?: React.ReactNode;
    icon?: React.ComponentType;
} & ({
    color?: string;
    theme?: never;
} | {
    color?: never;
    theme: Record<keyof typeof THEMES, string>;
})>;
declare function ChartContainer({ id, className, children, config, initialDimension, ...props }: React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
    initialDimension?: {
        width: number;
        height: number;
    };
}): React.JSX.Element;
declare const ChartStyle: ({ id, config }: {
    id: string;
    config: ChartConfig;
}) => React.JSX.Element | null;
declare const ChartTooltip: typeof RechartsPrimitive.Tooltip;
declare function ChartTooltipContent({ active, payload, className, indicator, hideLabel, hideIndicator, label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey, }: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
} & Omit<RechartsPrimitive.DefaultTooltipContentProps<TooltipValueType, TooltipNameType>, "accessibilityLayer">): React.JSX.Element | null;
declare const ChartLegend: React.MemoExoticComponent<(outsideProps: RechartsPrimitive.LegendProps) => React.ReactPortal | null>;
declare function ChartLegendContent({ className, hideIcon, payload, verticalAlign, nameKey, }: React.ComponentProps<"div"> & {
    hideIcon?: boolean;
    nameKey?: string;
} & RechartsPrimitive.DefaultLegendContentProps): React.JSX.Element | null;

/** ─── KPI + sparkline (dashboard stat tiles) ─────────────────────────── */
type MetricSparklinePoint = {
    x: string | number;
    y: number;
};
type MetricSparklineCardProps = {
    title: string;
    icon?: React.ReactNode;
    value: React.ReactNode;
    /** e.g. "+8.4% vs last month" */
    trend?: {
        direction: "up" | "down" | "flat";
        label: string;
    };
    data: MetricSparklinePoint[];
    /** Stroke / gradient accent (CSS color) */
    accentColor?: string;
    className?: string;
    onInfoClick?: () => void;
};
declare function MetricSparklineCard({ title, icon, value, trend, data, accentColor, className, onInfoClick, }: MetricSparklineCardProps): React.JSX.Element;
/** ─── Hero area + optional compare line + tabs + footer ──────────────── */
type DashboardAreaChartPoint = Record<string, string | number>;
type DashboardAreaChartTemplateProps = {
    title: string;
    tabs: {
        id: string;
        label: string;
    }[];
    activeTabId: string;
    onTabChange: (id: string) => void;
    headline: React.ReactNode;
    delta?: React.ReactNode;
    data: DashboardAreaChartPoint[];
    xKey: string;
    areaKey: string;
    compareLineKey?: string;
    height?: number;
    formatYAxis?: (v: number) => string;
    footer?: React.ReactNode;
    className?: string;
};
declare function DashboardAreaChartTemplate({ title, tabs, activeTabId, onTabChange, headline, delta, data, xKey, areaKey, compareLineKey, height, formatYAxis, footer, className, }: DashboardAreaChartTemplateProps): React.JSX.Element;
/** ─── Grouped vertical bars + legend (e.g. volume vs settled) ───────── */
type GroupedBarSeries = {
    key: string;
    label: string;
    color: string;
};
type GroupedBarChartTemplateProps = {
    title: string;
    subtitle?: string;
    data: DashboardAreaChartPoint[];
    xKey: string;
    series: GroupedBarSeries[];
    height?: number;
    formatYAxis?: (v: number) => string;
    className?: string;
};
declare function GroupedBarChartTemplate({ title, subtitle, data, xKey, series, height, formatYAxis, className, }: GroupedBarChartTemplateProps): React.JSX.Element;
/** ─── Ranked rows with horizontal bar (country / state insights) ────── */
type RankedBarItem = {
    id: string;
    leading?: React.ReactNode;
    label: string;
    value: string;
    /** 0–100 width of the filled bar */
    percent: number;
};
type RankedBarListTemplateProps = {
    title: string;
    subtitle?: string;
    headerRight?: React.ReactNode;
    items: RankedBarItem[];
    /** CSS colors for bar gradient */
    barFrom?: string;
    barTo?: string;
    className?: string;
};
declare function RankedBarListTemplate({ title, subtitle, headerRight, items, barFrom, barTo, className, }: RankedBarListTemplateProps): React.JSX.Element;
/** ─── Vertical category bars (e.g. T+N settlement mix) ──────────────── */
type CategoryBarPoint = {
    category: string;
    value: number;
};
type CategoryBarChartTemplateProps = {
    title: string;
    subtitle?: string;
    data: CategoryBarPoint[];
    valueLabel?: string;
    barColor?: string;
    height?: number;
    className?: string;
};
declare function CategoryBarChartTemplate({ title, subtitle, data, valueLabel, barColor, height, className, }: CategoryBarChartTemplateProps): React.JSX.Element;
/** ─── Mini sparkline + stat row (success / failed / avg) ────────────── */
type MiniSparklinePoint = {
    x: string | number;
    y: number;
    compare?: number;
};
type MiniSparklineStat = {
    label: string;
    value: string;
    dotClassName?: string;
};
type MiniSparklineChartCardProps = {
    title: string;
    value: React.ReactNode;
    data: MiniSparklinePoint[];
    accentColor?: string;
    stats: MiniSparklineStat[];
    height?: number;
    className?: string;
};
declare function MiniSparklineChartCard({ title, value, data, accentColor, height, stats, className, }: MiniSparklineChartCardProps): React.JSX.Element;
/** ─── “Needs attention” list with actions ───────────────────────────── */
type AttentionListItem = {
    id: string;
    title: string;
    value: string;
    valueTone?: "default" | "warning" | "danger";
    meta?: string;
    actionLabel: string;
    onAction?: () => void;
};
type AttentionListTemplateProps = {
    title: string;
    items: AttentionListItem[];
    className?: string;
};
declare function AttentionListTemplate({ title, items, className }: AttentionListTemplateProps): React.JSX.Element;

export { type AttentionListItem, AttentionListTemplate, type AttentionListTemplateProps, CategoryBarChartTemplate, type CategoryBarChartTemplateProps, type CategoryBarPoint, type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent, type DashboardAreaChartPoint, DashboardAreaChartTemplate, type DashboardAreaChartTemplateProps, GroupedBarChartTemplate, type GroupedBarChartTemplateProps, type GroupedBarSeries, MetricSparklineCard, type MetricSparklineCardProps, type MetricSparklinePoint, MiniSparklineChartCard, type MiniSparklineChartCardProps, type MiniSparklinePoint, type MiniSparklineStat, type RankedBarItem, RankedBarListTemplate, type RankedBarListTemplateProps };
