"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  FileText,
  Layers,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WorkItem {
  id: string;
  parentId: string | null;
  name: string;
  unit: string | null;
  volume: string;
  unitPrice: number;
  currentProgress: number;
  sortOrder: number;
}

interface RABTreeItem extends WorkItem {
  children: RABTreeItem[];
  totalValue: number;
  depth: number;
  isExpanded: boolean;
}

function buildTree(items: WorkItem[]): RABTreeItem[] {
  const map = new Map<string, RABTreeItem>();
  const roots: RABTreeItem[] = [];

  // Create all nodes
  items.forEach((item) => {
    map.set(item.id, {
      ...item,
      children: [],
      totalValue: parseFloat(item.volume || "0") * (item.unitPrice || 0),
      depth: 0,
      isExpanded: true,
    });
  });

  // Build hierarchy
  items.forEach((item) => {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      const parent = map.get(item.parentId)!;
      parent.children.push(node);
      node.depth = parent.depth + 1;
    } else if (!item.parentId) {
      roots.push(node);
    }
  });

  // Calculate parent totals
  function calcTotal(node: RABTreeItem): number {
    if (node.children.length === 0) return node.totalValue;
    const sum = node.children.reduce((s, c) => s + calcTotal(c), 0);
    node.totalValue = sum;
    return sum;
  }
  roots.forEach(calcTotal);

  // Sort by sortOrder
  const sortItems = (items: RABTreeItem[]) => {
    items.sort((a, b) => a.sortOrder - b.sortOrder);
    items.forEach((item) => sortItems(item.children));
  };
  sortItems(roots);

  return roots;
}

export default function RABEditor({
  workItems,
  contractValue,
  projectName,
}: {
  workItems: WorkItem[];
  contractValue: number;
  projectName: string;
}) {
  const tree = buildTree(workItems);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(workItems.filter((w) => !w.parentId).map((w) => w.id))
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const grandTotal = tree.reduce((s, r) => s + r.totalValue, 0);
  const margin = contractValue - grandTotal;
  const marginPct = contractValue > 0 ? (margin / contractValue) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Nilai Kontrak" value={formatRupiah(contractValue)} />
        <SummaryCard label="Total RAB" value={formatRupiah(grandTotal)} highlight={grandTotal > contractValue} />
        <SummaryCard
          label="Margin Rencana"
          value={formatRupiah(margin)}
          sub={`${marginPct.toFixed(1)}%`}
          highlight={margin < 0}
        />
        <SummaryCard
          label="Item Pekerjaan"
          value={`${workItems.filter((w) => w.parentId).length}`}
          sub={`${tree.length} kategori`}
        />
      </div>

      {/* RAB Table */}
      <Card className="card-architectural">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-safety" />
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              Rencana Anggaran Biaya
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Item
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border bg-muted/30">
                  <th className="text-left p-3 label-architectural w-[40%]">
                    Uraian Pekerjaan
                  </th>
                  <th className="text-center p-3 label-architectural w-[8%]">
                    Satuan
                  </th>
                  <th className="text-right p-3 label-architectural w-[12%]">
                    Volume
                  </th>
                  <th className="text-right p-3 label-architectural w-[15%]">
                    Harga Satuan
                  </th>
                  <th className="text-right p-3 label-architectural w-[15%]">
                    Jumlah
                  </th>
                  <th className="text-right p-3 label-architectural w-[10%]">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody>
                {tree.map((root, rootIdx) => (
                  <React.Fragment key={root.id}>
                    <TreeRow
                      item={root}
                      expandedIds={expandedIds}
                      onToggle={toggleExpand}
                      index={rootIdx + 1}
                      grandTotal={grandTotal}
                    />
                  </React.Fragment>
                ))}
                {/* Grand Total Row */}
                <tr className="border-t-2 border-border bg-muted/40 font-semibold">
                  <td colSpan={4} className="p-3 text-right uppercase tracking-wider text-xs">
                    Grand Total RAB
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums text-base">
                    {formatRupiah(grandTotal)}
                  </td>
                  <td className="p-3" />
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TreeRow({
  item,
  expandedIds,
  onToggle,
  index,
  prefix = "",
  grandTotal,
}: {
  item: RABTreeItem;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  index: number;
  prefix?: string;
  grandTotal: number;
}) {
  const isExpanded = expandedIds.has(item.id);
  const hasChildren = item.children.length > 0;
  const isLeaf = !hasChildren;
  const itemNumber = prefix ? `${prefix}.${index}` : `${index}`;
  const pctOfTotal = grandTotal > 0 ? (item.totalValue / grandTotal) * 100 : 0;

  return (
    <>
      <tr
        className={cn(
          "border-b border-border/50 transition-colors",
          hasChildren
            ? "bg-muted/20 hover:bg-muted/40 cursor-pointer"
            : "hover:bg-muted/20",
          item.depth === 0 && "bg-muted/30"
        )}
        onClick={hasChildren ? () => onToggle(item.id) : undefined}
      >
        {/* Name */}
        <td className="p-3">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${item.depth * 20}px` }}
          >
            {hasChildren ? (
              <button className="w-5 h-5 flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <span className="w-5 h-5 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-safety/40" />
              </span>
            )}
            <span className="text-[10px] font-mono text-muted-foreground w-8 shrink-0">
              {itemNumber}
            </span>
            <span
              className={cn(
                "truncate",
                hasChildren ? "font-semibold" : "font-normal"
              )}
            >
              {item.name}
            </span>
            {pctOfTotal >= 10 && (
              <Badge variant="outline" className="text-[9px] font-mono shrink-0 ml-1">
                {pctOfTotal.toFixed(0)}%
              </Badge>
            )}
          </div>
        </td>

        {/* Unit */}
        <td className="p-3 text-center text-muted-foreground">
          {isLeaf ? item.unit || "—" : ""}
        </td>

        {/* Volume */}
        <td className="p-3 text-right font-mono tabular-nums">
          {isLeaf ? parseFloat(item.volume || "0").toLocaleString("id-ID") : ""}
        </td>

        {/* Unit Price */}
        <td className="p-3 text-right font-mono tabular-nums">
          {isLeaf ? formatRupiah(item.unitPrice || 0) : ""}
        </td>

        {/* Total */}
        <td
          className={cn(
            "p-3 text-right font-mono tabular-nums",
            hasChildren ? "font-semibold" : ""
          )}
        >
          {formatRupiah(item.totalValue)}
        </td>

        {/* Progress */}
        <td className="p-3">
          {isLeaf && (
            <div className="flex items-center gap-1.5 justify-end">
              <div className="progress-blueprint w-10 rounded-sm">
                <div
                  className="progress-blueprint-fill rounded-sm"
                  style={{ width: `${item.currentProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono tabular-nums w-8 text-right">
                {item.currentProgress}%
              </span>
            </div>
          )}
        </td>
      </tr>

      {/* Children */}
      {hasChildren &&
        isExpanded &&
        item.children.map((child, childIdx) => (
          <TreeRow
            key={child.id}
            item={child}
            expandedIds={expandedIds}
            onToggle={onToggle}
            index={childIdx + 1}
            prefix={itemNumber}
            grandTotal={grandTotal}
          />
        ))}
    </>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="p-3 rounded border border-border bg-card">
      <span className="label-architectural block mb-1">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold font-mono tabular-nums truncate block",
          highlight ? "text-critical" : "text-foreground"
        )}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[10px] text-muted-foreground font-mono">{sub}</span>
      )}
    </div>
  );
}
