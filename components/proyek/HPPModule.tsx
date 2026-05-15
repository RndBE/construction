"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Layers,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Expense {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  status: string;
}

interface Payment {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
}

interface WorkItem {
  id: string;
  name: string;
  unit: string | null;
  volume: string;
  unitPrice: number;
  currentProgress: number;
  parentId: string | null;
}

interface HPPModuleProps {
  contractValue: number;
  expenses: Expense[];
  payments: Payment[];
  workItems: WorkItem[];
  projectName: string;
}

const expenseTypeLabels: Record<string, { label: string; color: string }> = {
  material: { label: "Material", color: "bg-blue-500" },
  upah: { label: "Upah", color: "bg-amber-500" },
  alat: { label: "Alat", color: "bg-purple-500" },
  overhead: { label: "Overhead", color: "bg-slate-500" },
  lainnya: { label: "Lainnya", color: "bg-gray-500" },
};

export default function HPPModule({
  contractValue,
  expenses,
  payments,
  workItems,
  projectName,
}: HPPModuleProps) {
  // Calculate HPP Plan from work items
  const leafItems = workItems.filter((w) => w.parentId);
  const hppPlan = leafItems.reduce(
    (s, w) => s + parseFloat(w.volume || "0") * (w.unitPrice || 0),
    0
  );

  // Total expenses (HPP Aktual)
  const hppActual = expenses.reduce((s, e) => s + e.amount, 0);

  // Weighted progress
  let totalWeight = 0;
  let weightedProgress = 0;
  for (const item of leafItems) {
    const weight =
      (item.unitPrice || 0) * parseFloat(String(item.volume) || "1");
    totalWeight += weight;
    weightedProgress += weight * item.currentProgress;
  }
  const overallProgress = totalWeight > 0 ? weightedProgress / totalWeight : 0;

  // Expected HPP at current progress
  const expectedHpp = (overallProgress / 100) * hppPlan;
  const hppVariance = expectedHpp > 0 ? ((hppActual - expectedHpp) / expectedHpp) * 100 : 0;

  // Margin
  const margin = contractValue - hppPlan;
  const marginPct = contractValue > 0 ? (margin / contractValue) * 100 : 0;
  const actualMargin = contractValue - hppActual;

  // Total payments received
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const cashflow = totalPaid - hppActual;

  // Expenses by type
  const byType = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + e.amount;
    return acc;
  }, {});

  // Monthly expenses
  const byMonth = expenses.reduce<Record<string, number>>((acc, e) => {
    const month = e.date.substring(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + e.amount;
    return acc;
  }, {});
  const months = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-4">
      {/* HPP Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <HPPCard
          label="HPP Rencana"
          value={formatRupiah(hppPlan)}
          sub={`${((hppPlan / contractValue) * 100).toFixed(0)}% kontrak`}
        />
        <HPPCard
          label="HPP Aktual"
          value={formatRupiah(hppActual)}
          sub={`${((hppActual / contractValue) * 100).toFixed(0)}% kontrak`}
          alert={hppVariance > 10}
        />
        <HPPCard
          label="Variance"
          value={`${hppVariance > 0 ? "+" : ""}${hppVariance.toFixed(1)}%`}
          sub={formatRupiah(Math.abs(hppActual - expectedHpp))}
          alert={hppVariance > 10}
          icon={
            hppVariance > 5 ? (
              <TrendingUp className="w-4 h-4 text-critical" />
            ) : hppVariance > 0 ? (
              <TrendingUp className="w-4 h-4 text-warning" />
            ) : (
              <TrendingDown className="w-4 h-4 text-success" />
            )
          }
        />
        <HPPCard
          label="Margin Rencana"
          value={formatRupiah(margin)}
          sub={`${marginPct.toFixed(1)}% margin`}
          icon={
            margin > 0 ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-critical" />
            )
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* HPP Breakdown by Type */}
        <Card className="card-architectural">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-safety" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                Breakdown HPP per Kategori
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(byType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, amount]) => {
                  const pct = hppActual > 0 ? (amount / hppActual) * 100 : 0;
                  const meta = expenseTypeLabels[type] || {
                    label: type,
                    color: "bg-gray-500",
                  };
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "w-2.5 h-2.5 rounded-sm shrink-0",
                              meta.color
                            )}
                          />
                          <span className="text-sm font-medium">
                            {meta.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-mono tabular-nums">
                            {pct.toFixed(0)}%
                          </span>
                          <span className="text-sm font-mono font-semibold tabular-nums">
                            {formatRupiah(amount)}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-sm overflow-hidden">
                        <div
                          className={cn("h-full rounded-sm", meta.color)}
                          style={{ width: `${pct}%`, opacity: 0.7 }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly HPP */}
        <Card className="card-architectural">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-safety" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                HPP per Bulan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {months.map(([month, amount]) => {
                const maxAmount = Math.max(...months.map(([, a]) => a));
                const barPct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                const [year, m] = month.split("-");
                const monthNames = [
                  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
                  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
                ];
                const label = `${monthNames[parseInt(m) - 1]} ${year}`;

                return (
                  <div key={month} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono w-16 shrink-0">
                      {label}
                    </span>
                    <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden relative">
                      <div
                        className="h-full bg-safety/30 rounded-sm"
                        style={{ width: `${barPct}%` }}
                      />
                      <span className="absolute inset-0 flex items-center px-2 text-[10px] font-mono tabular-nums">
                        {formatRupiah(amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cashflow */}
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-xs">
                <span className="label-architectural">Total Pembayaran Masuk</span>
                <span className="font-mono font-semibold tabular-nums text-success">
                  {formatRupiah(totalPaid)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="label-architectural">Total Pengeluaran</span>
                <span className="font-mono font-semibold tabular-nums text-critical">
                  {formatRupiah(hppActual)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border">
                <span className="label-architectural">Cashflow</span>
                <span
                  className={cn(
                    "font-mono tabular-nums",
                    cashflow >= 0 ? "text-success" : "text-critical"
                  )}
                >
                  {formatRupiah(cashflow)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses Table */}
      <Card className="card-architectural">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-safety" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                Riwayat Pengeluaran
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              {expenses.length} transaksi
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 label-architectural">Tanggal</th>
                  <th className="text-left p-3 label-architectural">Kategori</th>
                  <th className="text-left p-3 label-architectural">Keterangan</th>
                  <th className="text-right p-3 label-architectural">Jumlah</th>
                  <th className="text-center p-3 label-architectural">Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 15)
                  .map((exp) => {
                    const meta = expenseTypeLabels[exp.type] || {
                      label: exp.type,
                      color: "bg-gray-500",
                    };
                    return (
                      <tr
                        key={exp.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3 font-mono text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat("id-ID", {
                            day: "numeric",
                            month: "short",
                          }).format(new Date(exp.date))}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-normal gap-1"
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                meta.color
                              )}
                            />
                            {meta.label}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground truncate max-w-[200px]">
                          {exp.description}
                        </td>
                        <td className="p-3 text-right font-mono tabular-nums font-semibold">
                          {formatRupiah(exp.amount)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              exp.status === "approved"
                                ? "text-success border-success/30"
                                : exp.status === "rejected"
                                ? "text-critical border-critical/30"
                                : "text-warning border-warning/30"
                            )}
                          >
                            {exp.status === "approved"
                              ? "Approved"
                              : exp.status === "rejected"
                              ? "Rejected"
                              : "Pending"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HPPCard({
  label,
  value,
  sub,
  alert,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  alert?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="p-3 rounded border border-border bg-card">
      <div className="flex items-center justify-between mb-1">
        <span className="label-architectural">{label}</span>
        {icon}
      </div>
      <span
        className={cn(
          "text-sm font-semibold font-mono tabular-nums truncate block",
          alert ? "text-critical" : "text-foreground"
        )}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[10px] text-muted-foreground font-mono">
          {sub}
        </span>
      )}
    </div>
  );
}
