"use client";

import * as React from "react";
import { ChevronRight, SearchX } from "lucide-react";
import { Checkbox } from "./checkbox";
import { EmptyState } from "./empty-state";
import { Input } from "./input";
import { cn } from "./utils";

/**
 * One node of a {@link CheckboxTree}. A node with `children` is a branch; one
 * without is a leaf. Only leaves are ever "checked": a branch's state is
 * derived from the leaves under it.
 */
export interface CheckboxTreeNode {
  /** Unique across the whole tree. */
  key: string;
  label: React.ReactNode;
  /**
   * The text search matches against. Defaults to `label` when it is a string,
   * plus the key. Set it when the label is markup.
   */
  searchText?: string;
  /** Native tooltip on the label, e.g. a machine name behind a friendly label. */
  title?: string;
  children?: CheckboxTreeNode[];
}

export interface CheckboxTreeProps {
  nodes: CheckboxTreeNode[];
  /** The checked leaf keys. Branch keys in here are ignored. */
  checkedKeys: ReadonlySet<string> | readonly string[];
  /**
   * Receives the next set of checked leaf keys. Omit it and the tree is a
   * read-only check list: same marks, nothing toggles, nothing greyed out.
   */
  onCheckedChange?: (next: string[]) => void;
  /** Show the tree's own filter box above it. Default true. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /**
   * The filter text, when the page owns the search box (a toolbar that holds
   * more than the search). Pass `searchable={false}` alongside it.
   */
  query?: string;
  /**
   * How matches show while filtering. `tree` keeps each match inside its
   * opened path; `flat` lists the matching leaves alone, each with its path
   * under its label, which scans faster when a match sits three levels down.
   * Default `tree`.
   */
  searchLayout?: "tree" | "flat";
  /**
   * Which branches start open, when the page does not control it. `"checked"`
   * opens every branch holding a checked leaf, the natural default for a
   * read-only view. Default `"none"`.
   */
  defaultExpanded?: "none" | "checked" | "all";
  /** The open branch keys, when the page controls them (an "Expand all" button). */
  expandedKeys?: ReadonlySet<string>;
  onExpandedChange?: (next: Set<string>) => void;
  /** Show `picked/total` beside each branch. Default true. */
  showCounts?: boolean;
  /** Lay a branch's leaves out in two columns from `sm` up. Default 1. */
  leafColumns?: 1 | 2;
  /** Shown when nothing matches the filter, or there are no nodes. */
  emptyTitle?: string;
  emptyDescription?: string;
  /** Draw the tree's own border. Off when a panel around it already has one. Default true. */
  bordered?: boolean;
  /** Prefix for the generated element ids, when two trees share a page. */
  idPrefix?: string;
  className?: string;
}

type CheckState = boolean | "indeterminate";

function collectLeaves(node: CheckboxTreeNode, out: string[] = []): string[] {
  if (!node.children?.length) out.push(node.key);
  else node.children.forEach((child) => collectLeaves(child, out));
  return out;
}

const plainLabel = (node: CheckboxTreeNode) => (typeof node.label === "string" ? node.label : node.key);

function textOf(node: CheckboxTreeNode) {
  const label = typeof node.label === "string" ? node.label : "";
  return `${node.searchText ?? label} ${node.key}`.toLowerCase();
}

/**
 * Keeps a node whole when it matches; otherwise keeps it only for the
 * descendants that do, so a match is always shown with its path.
 */
function filterTree(nodes: CheckboxTreeNode[], term: string): CheckboxTreeNode[] {
  const out: CheckboxTreeNode[] = [];
  for (const node of nodes) {
    if (textOf(node).includes(term)) {
      out.push(node);
      continue;
    }
    if (node.children?.length) {
      const children = filterTree(node.children, term);
      if (children.length) out.push({ ...node, children });
    }
  }
  return out;
}

/** The leaves of a (filtered) tree, each with the labels of the branches above it. */
function flattenLeaves(nodes: CheckboxTreeNode[], path: string[] = [], out: { node: CheckboxTreeNode; path: string[] }[] = []) {
  for (const node of nodes) {
    if (node.children?.length) flattenLeaves(node.children, [...path, plainLabel(node)], out);
    else out.push({ node, path });
  }
  return out;
}

/**
 * The keys of the branches in a tree, optionally only those `pick` accepts.
 * For a page that drives `expandedKeys`: "Expand all" is every branch key.
 */
export function getCheckboxTreeBranchKeys(
  nodes: CheckboxTreeNode[],
  pick: (node: CheckboxTreeNode, leaves: string[]) => boolean = () => true,
  out = new Set<string>()
): Set<string> {
  for (const node of nodes) {
    if (!node.children?.length) continue;
    if (pick(node, collectLeaves(node))) out.add(node.key);
    getCheckboxTreeBranchKeys(node.children, pick, out);
  }
  return out;
}

/**
 * A hierarchy of tri-state checkboxes: ticking a branch ticks every leaf under
 * it, and a branch shows checked, partly checked or empty from its leaves.
 *
 * The stand-in for antd's checkable `Tree` and multiple `Cascader`: a caller
 * that needs the selection in a collapsed form (a whole branch as one entry)
 * derives it from the leaf keys, which keeps this component free of any one
 * backend's encoding.
 */
export function CheckboxTree({
  nodes,
  checkedKeys,
  onCheckedChange,
  searchable = true,
  searchPlaceholder = "Search",
  query,
  searchLayout = "tree",
  defaultExpanded = "none",
  expandedKeys,
  onExpandedChange,
  showCounts = true,
  leafColumns = 1,
  emptyTitle = "Nothing found",
  emptyDescription,
  bordered = true,
  idPrefix,
  className,
}: CheckboxTreeProps) {
  const autoId = React.useId();
  const prefix = idPrefix ?? autoId;
  const readOnly = !onCheckedChange;
  const checked = React.useMemo(
    () => (checkedKeys instanceof Set ? (checkedKeys as ReadonlySet<string>) : new Set(checkedKeys)),
    [checkedKeys]
  );

  const [ownSearch, setOwnSearch] = React.useState("");
  const [ownExpanded, setOwnExpanded] = React.useState<Set<string>>(() => {
    if (defaultExpanded === "all") return getCheckboxTreeBranchKeys(nodes);
    if (defaultExpanded === "checked") {
      return getCheckboxTreeBranchKeys(nodes, (_node, leaves) => leaves.some((leaf) => checked.has(leaf)));
    }
    return new Set();
  });
  const expanded = expandedKeys ?? ownExpanded;

  const term = (query ?? ownSearch).trim().toLowerCase();
  const visible = term ? filterTree(nodes, term) : nodes;

  const setLeaves = (leaves: string[], on: boolean) => {
    if (!onCheckedChange) return;
    const next = new Set(checked);
    leaves.forEach((leaf) => (on ? next.add(leaf) : next.delete(leaf)));
    onCheckedChange([...next]);
  };

  const toggleOpen = (key: string) => {
    const next = new Set(expanded);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    if (onExpandedChange) onExpandedChange(next);
    if (!expandedKeys) setOwnExpanded(next);
  };

  const box = (id: string, state: CheckState, leaves: string[], label: string) => (
    <Checkbox
      id={id}
      checked={state}
      onCheckedChange={(next) => setLeaves(leaves, next === true)}
      tabIndex={readOnly ? -1 : undefined}
      aria-readonly={readOnly || undefined}
      aria-label={label}
      // Read-only keeps full contrast: a greyed list reads as "unavailable".
      className={cn(readOnly && "pointer-events-none")}
    />
  );

  const leafRow = (node: CheckboxTreeNode, id: string, path?: string[]) => {
    const isChecked = checked.has(node.key);
    return (
      <div
        key={node.key}
        role="treeitem"
        aria-selected={isChecked}
        className={cn(
          "flex min-w-0 items-start gap-2 rounded-md px-1.5 py-1 max-md:min-h-11 max-md:items-center",
          isChecked && "bg-accent"
        )}
      >
        <span className="mt-0.5 max-md:mt-0">{box(id, isChecked, [node.key], plainLabel(node))}</span>
        <label
          htmlFor={id}
          title={node.title}
          className={cn(
            "flex min-w-0 flex-col text-[13px] text-foreground",
            isChecked && "font-medium",
            !readOnly && "cursor-pointer"
          )}
        >
          <span className="break-words">{node.label}</span>
          {path && path.length > 0 && (
            <span className="truncate text-xs font-normal text-muted-foreground">{path.join(" / ")}</span>
          )}
        </label>
      </div>
    );
  };

  // Ids come from the node's position, not its key: keys are the caller's data
  // and may hold characters an id cannot.
  const renderNode = (node: CheckboxTreeNode, path: string): React.ReactNode => {
    const depth = path.split("-").length - 1;
    const id = `${prefix}-${path}`;
    if (!node.children?.length) return leafRow(node, id);

    const leaves = collectLeaves(node);
    const picked = leaves.filter((leaf) => checked.has(leaf)).length;
    const state: CheckState = picked === 0 ? false : picked === leaves.length ? true : "indeterminate";
    // While searching every match is shown open, so nothing found is hidden.
    const open = !!term || expanded.has(node.key);
    const allLeafChildren = node.children.every((child) => !child.children?.length);

    return (
      <div key={node.key} role="treeitem" aria-expanded={open} aria-selected={state === true}>
        <div className="flex min-w-0 items-center gap-1.5 py-1 max-md:min-h-11">
          <button
            type="button"
            onClick={() => toggleOpen(node.key)}
            disabled={!!term}
            aria-label={open ? `Collapse ${plainLabel(node)}` : `Expand ${plainLabel(node)}`}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:cursor-default max-md:h-10 max-md:w-10"
          >
            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform duration-pg-fast ease-pg-standard", open && "rotate-90")} />
          </button>
          {box(id, state, leaves, plainLabel(node))}
          <label
            htmlFor={id}
            title={node.title}
            className={cn(
              "min-w-0 break-words text-[13px] text-foreground",
              depth === 0 && "font-medium",
              !readOnly && "cursor-pointer"
            )}
          >
            {node.label}
          </label>
          {showCounts && (
            <span
              className={cn(
                "shrink-0 text-xs tabular-nums",
                picked > 0 ? "font-medium text-primary" : "text-muted-foreground"
              )}
            >
              {picked}/{leaves.length}
            </span>
          )}
        </div>
        {open && (
          <div
            role="group"
            className={cn(
              "pl-[3.25rem] max-md:pl-6",
              allLeafChildren && leafColumns === 2 && "grid grid-cols-1 gap-x-3 sm:grid-cols-2"
            )}
          >
            {node.children.map((child, i) => renderNode(child, `${path}-${i}`))}
          </div>
        )}
      </div>
    );
  };

  const flat = term && searchLayout === "flat" ? flattenLeaves(visible) : null;
  const isEmpty = flat ? flat.length === 0 : visible.length === 0;

  return (
    <div className={cn("space-y-3", className)}>
      {searchable && (
        <Input
          placeholder={searchPlaceholder}
          value={query ?? ownSearch}
          onChange={(e) => setOwnSearch(e.target.value)}
          className="h-8 max-md:h-11 max-md:text-base"
          aria-label={searchPlaceholder}
          readOnly={query !== undefined}
        />
      )}
      {isEmpty ? (
        <EmptyState icon={SearchX} title={emptyTitle} description={emptyDescription} className="py-10" />
      ) : (
        <div
          role="tree"
          aria-multiselectable
          className={cn(bordered && "rounded-lg border border-border px-3 py-1.5")}
        >
          {flat
            ? flat.map(({ node, path }, i) => leafRow(node, `${prefix}-flat-${i}`, path))
            : visible.map((node, i) => renderNode(node, String(i)))}
        </div>
      )}
    </div>
  );
}
