"use client";
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/charts.ts
var charts_exports = {};
__export(charts_exports, {
  AttentionListTemplate: () => AttentionListTemplate,
  CategoryBarChartTemplate: () => CategoryBarChartTemplate,
  ChartContainer: () => ChartContainer,
  ChartLegend: () => ChartLegend,
  ChartLegendContent: () => ChartLegendContent,
  ChartStyle: () => ChartStyle,
  ChartTooltip: () => ChartTooltip,
  ChartTooltipContent: () => ChartTooltipContent,
  DashboardAreaChartTemplate: () => DashboardAreaChartTemplate,
  GroupedBarChartTemplate: () => GroupedBarChartTemplate,
  MetricSparklineCard: () => MetricSparklineCard,
  MiniSparklineChartCard: () => MiniSparklineChartCard,
  RankedBarListTemplate: () => RankedBarListTemplate
});
module.exports = __toCommonJS(charts_exports);

// src/chart.tsx
var React = __toESM(require("react"), 1);
var RechartsPrimitive = __toESM(require("recharts"), 1);

// src/utils.ts
var import_clsx = require("clsx");
var import_tailwind_merge = require("tailwind-merge");
function cn(...inputs) {
  return (0, import_tailwind_merge.twMerge)((0, import_clsx.clsx)(inputs));
}

// src/chart.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var THEMES = { light: "", dark: ".dark" };
var INITIAL_DIMENSION = { width: 320, height: 200 };
var ChartContext = React.createContext(null);
function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}
function ChartContainer({
  id,
  className,
  children,
  config,
  initialDimension = INITIAL_DIMENSION,
  ...props
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContext.Provider, { value: { config }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      "data-slot": "chart",
      "data-chart": chartId,
      className: cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartStyle, { id: chartId, config }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          RechartsPrimitive.ResponsiveContainer,
          {
            initialDimension,
            children
          }
        )
      ]
    }
  ) });
}
var ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config2]) => config2.theme ?? config2.color
  );
  if (!colorConfig.length) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "style",
    {
      dangerouslySetInnerHTML: {
        __html: Object.entries(THEMES).map(
          ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.map(([key, itemConfig]) => {
            const color = itemConfig.theme?.[theme] ?? itemConfig.color;
            return color ? `  --color-${key}: ${color};` : null;
          }).join("\n")}
}
`
        ).join("\n")
      }
    }
  );
};
var ChartTooltip = RechartsPrimitive.Tooltip;
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey
}) {
  const { config } = useChart();
  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }
    const [item] = payload;
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value = !labelKey && typeof label === "string" ? config[label]?.label ?? label : itemConfig?.label;
    if (labelFormatter) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("font-medium", labelClassName), children: labelFormatter(value, payload) });
    }
    if (!value) {
      return null;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("font-medium", labelClassName), children: value });
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey
  ]);
  if (!active || !payload?.length) {
    return null;
  }
  const nestLabel = payload.length === 1 && indicator !== "dot";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      className: cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      ),
      children: [
        !nestLabel ? tooltipLabel : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid gap-1.5", children: payload.filter((item) => item.type !== "none").map((item, index) => {
          const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color ?? item.payload?.fill ?? item.color;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "div",
            {
              className: cn(
                "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                indicator === "dot" && "items-center"
              ),
              children: formatter && item?.value !== void 0 && item.name ? formatter(item.value, item.name, item, index, item.payload) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                itemConfig?.icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(itemConfig.icon, {}) : !hideIndicator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "div",
                  {
                    className: cn(
                      "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                      {
                        "h-2.5 w-2.5": indicator === "dot",
                        "w-1": indicator === "line",
                        "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                        "my-0.5": nestLabel && indicator === "dashed"
                      }
                    ),
                    style: {
                      "--color-bg": indicatorColor,
                      "--color-border": indicatorColor
                    }
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                  "div",
                  {
                    className: cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center"
                    ),
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid gap-1.5", children: [
                        nestLabel ? tooltipLabel : null,
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-muted-foreground", children: itemConfig?.label ?? item.name })
                      ] }),
                      item.value != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-mono font-medium text-foreground tabular-nums", children: typeof item.value === "number" ? item.value.toLocaleString() : String(item.value) })
                    ]
                  }
                )
              ] })
            },
            index
          );
        }) })
      ]
    }
  );
}
var ChartLegend = RechartsPrimitive.Legend;
function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey
}) {
  const { config } = useChart();
  if (!payload?.length) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      ),
      children: payload.filter((item) => item.type !== "none").map((item, index) => {
        const key = `${nameKey ?? item.dataKey ?? "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            className: cn(
              "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
            ),
            children: [
              itemConfig?.icon && !hideIcon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(itemConfig.icon, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "div",
                {
                  className: "h-2 w-2 shrink-0 rounded-[2px]",
                  style: {
                    backgroundColor: item.color
                  }
                }
              ),
              itemConfig?.label
            ]
          },
          index
        );
      })
    }
  );
}
function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) {
    return void 0;
  }
  const payloadPayload = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? payload.payload : void 0;
  let configLabelKey = key;
  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key];
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key] === "string") {
    configLabelKey = payloadPayload[key];
  }
  return configLabelKey in config ? config[configLabelKey] : config[key];
}

// src/chart-templates.tsx
var React3 = __toESM(require("react"), 1);
var import_recharts = require("recharts");
var import_lucide_react2 = require("lucide-react");

// src/elevation.ts
var elevation = {
  /**
   * Flat surfaces that sit ON the page and are delineated by their border:
   * Card, chart surfaces, Alert, SectionMessage, Spotlight, Skeleton.
   *
   * `shadow-xs` (one 2px blur at 5% black): the lightest lift that still reads
   * as a surface on the page, half the weight of `shadow-sm`. Chosen over
   * `shadow-none` deliberately, so cards keep a hint of depth beyond their
   * border. A call site that needs fully flat or a stronger lift passes
   * `shadow-none` / `shadow-sm` through `className`; tailwind-merge lets it win.
   */
  surface: "shadow-xs",
  /**
   * Button-shaped things: Button, IconButton, ButtonGroup segments, the
   * pagination page buttons, a table's row CTA. Just enough lift to read as
   * pressable. Ghost and link variants stay flat and do not use this.
   */
  control: "shadow-sm",
  /**
   * Anything you type into or pick from: Input, Textarea, every select
   * trigger, the date and time pickers, OTP boxes, Checkbox, Radio.
   *
   * Deliberately flat. A field is a well, not a raised object, and a form of
   * ten shadowed controls reads as clutter. Emitted as an explicit
   * `shadow-none` rather than by omitting the class so that a caller passing
   * `shadow-sm` through `className` still wins under tailwind-merge.
   */
  field: "shadow-none",
  /**
   * Things that genuinely float above the page, where depth is the signal that
   * says "this is detached and dismissible". Kept heavier than `surface` on
   * purpose — flattening these is what makes a dropdown look painted on.
   */
  tooltip: "shadow-md",
  popover: "shadow-lg",
  drawer: "shadow-xl",
  modal: "shadow-2xl"
};

// src/button.tsx
var import_lucide_react = require("lucide-react");
var import_react = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var variantClasses = {
  primary: `bg-primary text-primary-foreground border border-primary ${elevation.control} hover:bg-[var(--primary-hover)]`,
  secondary: `bg-muted text-foreground border border-border ${elevation.control} hover:bg-muted/85 dark:bg-muted/35 dark:text-foreground dark:border-border dark:hover:bg-muted/55`,
  ghost: "bg-transparent text-foreground border border-transparent hover:bg-muted focus-visible:bg-muted/80 active:bg-muted/90",
  danger: `bg-red-600 text-white border border-red-600 ${elevation.control} hover:bg-red-700`,
  outline: `bg-card text-foreground border border-border ${elevation.control} hover:bg-muted`,
  link: "h-auto min-h-0 rounded-md border border-transparent bg-transparent px-2 py-2 font-medium text-primary shadow-none underline-offset-4 hover:bg-primary/5 hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:no-underline"
};
var linkSizes = {
  sm: "text-[13px]",
  md: "text-sm",
  lg: "text-[15px]"
};
var LINK_DEFAULT_SIZE = "text-[15px]";
var sizes = {
  sm: "h-9 min-h-9 px-3.5 text-xs gap-1.5 rounded-lg",
  md: "h-10 min-h-10 px-5 text-sm gap-2 rounded-lg",
  lg: "h-[3.25rem] min-h-[3.25rem] px-10 text-[15px] gap-2.5 rounded-xl"
};
var Button = (0, import_react.forwardRef)(
  ({
    variant = "primary",
    // No default here: a link tells "no size given" apart from "md" (see linkSizes).
    size: sizeProp,
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className,
    disabled,
    ...props
  }, ref) => {
    const size = sizeProp ?? "md";
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "button",
      {
        ref,
        disabled: disabled || isLoading,
        className: cn(
          "inline-flex items-center justify-center font-medium transition-colors duration-pg-fast ease-pg-standard",
          // A button's label never wraps. Without this, a narrow button breaks
          // the line between an icon and its text — and an icon passed as a
          // child rather than through `leftIcon` sits inside the same span, so
          // it wraps with the words. Pass `whitespace-normal` in `className`
          // for the rare button that really should wrap.
          "whitespace-nowrap",
          variant !== "link" && "disabled:cursor-not-allowed disabled:opacity-50",
          variant === "link" && "justify-center",
          variant !== "link" && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
          variantClasses[variant],
          variant !== "link" && sizes[size],
          variant === "link" && (sizeProp ? linkSizes[sizeProp] : LINK_DEFAULT_SIZE),
          className
        ),
        ...props,
        children: [
          isLoading ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            import_lucide_react.Loader2,
            {
              className: cn(
                "animate-spin",
                size === "sm" ? "size-3.5" : size === "lg" ? "size-[1.125rem]" : "size-3.5"
              )
            }
          ) : leftIcon,
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: cn(isLoading && "opacity-70"), children }),
          !isLoading && rightIcon
        ]
      }
    );
  }
);
Button.displayName = "Button";

// src/separator.tsx
var React2 = __toESM(require("react"), 1);
var SeparatorPrimitive = __toESM(require("@radix-ui/react-separator"), 1);
var import_jsx_runtime3 = require("react/jsx-runtime");
var Separator = React2.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
  SeparatorPrimitive.Root,
  {
    ref,
    decorative,
    orientation,
    className: cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    ),
    ...props
  }
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

// src/chart-templates.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var gridStroke = "color-mix(in srgb, var(--border) 65%, transparent)";
var tickFill = "var(--muted-foreground)";
function MetricSparklineCard({
  title,
  icon,
  value,
  trend,
  data,
  accentColor = "var(--chart-1)",
  className,
  onInfoClick
}) {
  const gid = React3.useId().replace(/:/g, "");
  const chartData = data.map((d) => ({ ...d, y: d.y }));
  const trendCls = trend?.direction === "up" ? "text-emerald-600 dark:text-emerald-400" : trend?.direction === "down" ? "text-red-600 dark:text-red-400" : "text-muted-foreground";
  const TrendIcon = trend?.direction === "up" ? import_lucide_react2.ArrowUpRight : trend?.direction === "down" ? import_lucide_react2.ArrowDownRight : import_lucide_react2.Minus;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "div",
    {
      className: cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 text-card-foreground",
        elevation.surface,
        className
      ),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex min-w-0 items-center gap-2", children: [
            icon ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "flex shrink-0 text-muted-foreground [&_svg]:size-4", children: icon }) : null,
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "truncate text-sm font-semibold text-foreground", children: title })
          ] }),
          onInfoClick ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "button",
            {
              type: "button",
              onClick: onInfoClick,
              className: "shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              "aria-label": "More info",
              children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.Info, { className: "size-3.5" })
            }
          ) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "mt-3 text-2xl font-semibold tabular-nums tracking-tight text-foreground", children: value }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "pointer-events-none absolute bottom-3 right-3 h-14 w-[46%] max-w-[9rem] opacity-95", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_recharts.ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_recharts.AreaChart, { data: chartData, margin: { top: 4, right: 0, left: 0, bottom: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("linearGradient", { id: gid, x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("stop", { offset: "0%", stopColor: accentColor, stopOpacity: 0.35 }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("stop", { offset: "100%", stopColor: accentColor, stopOpacity: 0 })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_recharts.Area,
            {
              type: "monotone",
              dataKey: "y",
              stroke: accentColor,
              strokeWidth: 2,
              fill: `url(#${gid})`,
              isAnimationActive: false
            }
          )
        ] }) }) }),
        trend ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: cn("mt-10 flex items-center gap-1 text-xs font-medium", trendCls), children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(TrendIcon, { className: "size-3.5 shrink-0", "aria-hidden": true }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: trend.label })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "mt-10" })
      ]
    }
  );
}
function DashboardAreaChartTemplate({
  title,
  tabs,
  activeTabId,
  onTabChange,
  headline,
  delta,
  data,
  xKey,
  areaKey,
  compareLineKey,
  height = 220,
  formatYAxis = (v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}L` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : `${v}`,
  footer,
  className
}) {
  const areaGid = React3.useId().replace(/:/g, "");
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: cn("rounded-xl border border-border bg-card text-card-foreground", elevation.surface, className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex flex-col gap-4 border-b border-border px-5 pt-4 pb-3 sm:flex-row sm:items-start sm:justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "text-sm font-semibold text-foreground", children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-0.5", children: tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          type: "button",
          onClick: () => onTabChange(t.id),
          className: cn(
            "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
            activeTabId === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          ),
          children: t.label
        },
        t.id
      )) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "px-5 pt-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-2xl font-semibold tabular-nums tracking-tight text-foreground", children: headline }),
      delta ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "mt-1 text-sm", children: delta }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "px-3 pb-2 pt-2", style: { height }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_recharts.ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_recharts.AreaChart, { data, margin: { top: 8, right: 12, left: 0, bottom: 0 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("linearGradient", { id: areaGid, x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("stop", { offset: "0%", stopColor: "var(--chart-1)", stopOpacity: 0.35 }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("stop", { offset: "100%", stopColor: "var(--chart-1)", stopOpacity: 0.02 })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_recharts.CartesianGrid, { strokeDasharray: "3 3", stroke: gridStroke, vertical: false }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_recharts.XAxis,
        {
          dataKey: xKey,
          axisLine: false,
          tickLine: false,
          tick: { fontSize: 10, fill: tickFill },
          interval: "preserveStartEnd"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_recharts.YAxis,
        {
          axisLine: false,
          tickLine: false,
          tick: { fontSize: 10, fill: tickFill },
          tickFormatter: formatYAxis,
          width: 44
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_recharts.Tooltip,
        {
          contentStyle: {
            borderRadius: 10,
            border: "1px solid var(--border)",
            fontSize: 12,
            background: "var(--popover)",
            color: "var(--popover-foreground)"
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_recharts.Area,
        {
          type: "monotone",
          dataKey: areaKey,
          stroke: "var(--chart-1)",
          strokeWidth: 2,
          fill: `url(#${areaGid})`
        }
      ),
      compareLineKey ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_recharts.Line,
        {
          type: "monotone",
          dataKey: compareLineKey,
          stroke: "var(--muted-foreground)",
          strokeWidth: 1.5,
          strokeDasharray: "4 4",
          dot: false
        }
      ) : null
    ] }) }) }),
    footer ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Separator, {}),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "px-5 py-3", children: footer })
    ] }) : null
  ] });
}
function GroupedBarChartTemplate({
  title,
  subtitle,
  data,
  xKey,
  series,
  height = 200,
  formatYAxis = (v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : `${v}`,
  className
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: cn("rounded-xl border border-border bg-card px-5 pt-4 pb-3 text-card-foreground", elevation.surface, className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "text-sm font-semibold text-foreground", children: title }),
        subtitle ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "mt-0.5 text-xs text-muted-foreground", children: subtitle }) : null
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "flex flex-wrap items-center gap-4", children: series.map((s) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "size-2.5 rounded-sm", style: { background: s.color } }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-[11px] font-medium text-muted-foreground", children: s.label })
      ] }, s.key)) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { height }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_recharts.ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_recharts.BarChart, { data, barCategoryGap: "22%", barGap: 4, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_recharts.CartesianGrid, { strokeDasharray: "3 3", stroke: gridStroke, vertical: false }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_recharts.XAxis, { dataKey: xKey, axisLine: false, tickLine: false, tick: { fontSize: 11, fill: tickFill } }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_recharts.YAxis,
        {
          axisLine: false,
          tickLine: false,
          tick: { fontSize: 11, fill: tickFill },
          tickFormatter: formatYAxis,
          width: 40
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_recharts.Tooltip,
        {
          contentStyle: {
            borderRadius: 10,
            border: "1px solid var(--border)",
            fontSize: 12,
            background: "var(--popover)"
          }
        }
      ),
      series.map((s) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_recharts.Bar, { dataKey: s.key, name: s.label, fill: s.color, radius: [5, 5, 0, 0], maxBarSize: 36 }, s.key))
    ] }) }) })
  ] });
}
function RankedBarListTemplate({
  title,
  subtitle,
  headerRight,
  items,
  barFrom = "var(--chart-1)",
  barTo = "var(--chart-3)",
  className
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: cn("rounded-xl border border-border bg-card p-5 text-card-foreground", elevation.surface, className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "text-sm font-semibold text-foreground", children: title }),
        subtitle ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "mt-0.5 text-xs text-muted-foreground", children: subtitle }) : null
      ] }),
      headerRight ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "shrink-0", children: headerRight }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("ul", { className: "space-y-3", children: items.map((row) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("li", { className: "flex items-center gap-3 text-sm", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex min-w-0 flex-1 items-center gap-2", children: [
        row.leading ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "shrink-0 text-muted-foreground", children: row.leading }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "truncate font-medium text-foreground", children: row.label })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "relative hidden h-2 w-[min(40%,9rem)] overflow-hidden rounded-full bg-muted sm:block", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "div",
        {
          className: "absolute inset-y-0 left-0 rounded-full",
          style: {
            width: `${Math.min(100, Math.max(0, row.percent))}%`,
            background: `linear-gradient(90deg, ${barFrom}, ${barTo})`
          }
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "w-14 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground", children: row.value })
    ] }, row.id)) })
  ] });
}
function CategoryBarChartTemplate({
  title,
  subtitle,
  data,
  valueLabel = "Share",
  barColor = "var(--chart-1)",
  height = 200,
  className
}) {
  const chartData = data.map((d) => ({ name: d.category, v: d.value }));
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: cn("rounded-xl border border-border bg-card px-5 pt-4 pb-3 text-card-foreground", elevation.surface, className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mb-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "text-sm font-semibold text-foreground", children: title }),
      subtitle ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "mt-0.5 text-xs text-muted-foreground", children: subtitle }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { height }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_recharts.ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_recharts.BarChart, { data: chartData, barCategoryGap: "28%", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_recharts.CartesianGrid, { strokeDasharray: "3 3", stroke: gridStroke, vertical: false }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_recharts.XAxis, { dataKey: "name", axisLine: false, tickLine: false, tick: { fontSize: 11, fill: tickFill } }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_recharts.YAxis,
        {
          axisLine: false,
          tickLine: false,
          tick: { fontSize: 11, fill: tickFill },
          tickFormatter: (v) => `${v}%`,
          domain: [0, "dataMax + 5"],
          width: 36
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_recharts.Tooltip,
        {
          formatter: (value) => [`${value ?? 0}%`, valueLabel],
          contentStyle: {
            borderRadius: 10,
            border: "1px solid var(--border)",
            fontSize: 12,
            background: "var(--popover)"
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_recharts.Bar, { dataKey: "v", fill: barColor, radius: [6, 6, 0, 0], maxBarSize: 48 })
    ] }) }) })
  ] });
}
function MiniSparklineChartCard({
  title,
  value,
  data,
  accentColor = "var(--chart-4)",
  height = 100,
  stats,
  className
}) {
  const gid = React3.useId().replace(/:/g, "");
  const hasCompare = data.some((d) => d.compare != null);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: cn("rounded-xl border border-border bg-card p-5 text-card-foreground", elevation.surface, className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "text-sm font-semibold text-foreground", children: title }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "mt-2 text-2xl font-semibold tabular-nums", children: value }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "mt-2", style: { height }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_recharts.ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_recharts.AreaChart, { data, margin: { top: 4, right: 8, left: 0, bottom: 0 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("linearGradient", { id: gid, x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("stop", { offset: "0%", stopColor: accentColor, stopOpacity: 0.3 }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("stop", { offset: "100%", stopColor: accentColor, stopOpacity: 0 })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_recharts.XAxis, { dataKey: "x", hide: true }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_recharts.YAxis, { hide: true, domain: ["dataMin - 1", "dataMax + 1"] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_recharts.Area, { type: "monotone", dataKey: "y", stroke: accentColor, strokeWidth: 2, fill: `url(#${gid})` }),
      hasCompare ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_recharts.Line,
        {
          type: "monotone",
          dataKey: "compare",
          stroke: "var(--muted-foreground)",
          strokeWidth: 1.5,
          strokeDasharray: "4 4",
          dot: false,
          connectNulls: true
        }
      ) : null
    ] }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3 text-[11px]", children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-1.5", children: [
      s.dotClassName ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: cn("size-1.5 rounded-full", s.dotClassName) }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-muted-foreground", children: s.label }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "font-semibold tabular-nums text-foreground", children: s.value })
    ] }, s.label)) })
  ] });
}
var toneCls = {
  default: "text-foreground",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400"
};
function AttentionListTemplate({ title, items, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: cn("rounded-xl border border-border bg-card p-5 text-card-foreground", elevation.surface, className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "text-sm font-semibold text-foreground", children: title }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("ul", { className: "mt-4 space-y-4", children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
      "li",
      {
        className: "flex flex-col gap-3 border-b border-border/60 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "min-w-0 space-y-0.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "text-sm font-semibold text-foreground", children: item.title }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: cn("text-lg font-semibold tabular-nums", toneCls[item.valueTone ?? "default"]), children: item.value }),
            item.meta ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "text-xs text-muted-foreground", children: item.meta }) : null
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "md",
              className: "shrink-0 gap-1.5",
              onClick: item.onAction,
              children: [
                item.actionLabel,
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.ExternalLink, { className: "size-3.5 opacity-70", "aria-hidden": true })
              ]
            }
          )
        ]
      },
      item.id
    )) })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AttentionListTemplate,
  CategoryBarChartTemplate,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  DashboardAreaChartTemplate,
  GroupedBarChartTemplate,
  MetricSparklineCard,
  MiniSparklineChartCard,
  RankedBarListTemplate
});
//# sourceMappingURL=charts.cjs.map