"use client";

import React, { useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Receipt,
  Banknote,
  ChevronRight,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatRupiah, getStatusColor } from "@/lib/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExportExcel from "@/components/shared/ExportExcel";

interface KeuanganData {
  expenses: {
    id: string;
    type: string;
    amount: number;
    date: string;
    description: string;
    status: string;
    projectCode: string;
    projectName: string;
  }[];
  payments: {
    id: string;
    type: string;
    amount: number;
    date: string;
    description: string;
    projectCode: string;
    projectName: string;
  }[];
  monthlySummary: {
    month: string;
    expenses: number;
    payments: number;
  }[];
  projectSummaries: {
    code: string;
    name: string;
    contractValue: number;
    hppPlan: number;
    hppActual: number;
    progress: number;
    status: string;
  }[];
}

const expenseTypeLabels: Record<string, { label: string; color: string }> = {
  material: { label: "Material", color: "bg-blue-500" },
  upah: { label: "Upah", color: "bg-amber-500" },
  alat: { label: "Alat", color: "bg-purple-500" },
  overhead: { label: "Overhead", color: "bg-slate-500" },
  lainnya: { label: "Lainnya", color: "bg-gray-500" },
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export default function KeuanganClient({ data }: { data: KeuanganData }) {
  const [activeTab, setActiveTab] = useState("ringkasan");

  const totalExpenses = data.expenses.reduce((s, e) => s + e.amount, 0);
  const totalPayments = data.payments.reduce((s, p) => s + p.amount, 0);
  const totalContract = data.projectSummaries.reduce((s, p) => s + p.contractValue, 0);
  const cashflow = totalPayments - totalExpenses;

  // Expense breakdown by type
  const byType = data.expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Keuangan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ringkasan keuangan seluruh proyek
          </p>
        </div>
        <div className="flex gap-1.5">
          <ExportExcel
            data={data.expenses.map((e) => ({
              "Tanggal": e.date,
              "Proyek": e.projectName,
              "Kode Proyek": e.projectCode,
              "Kategori": e.type,
              "Keterangan": e.description,
              "Jumlah": e.amount,
              "Status": e.status,
            }))}
            filename="Pengeluaran"
            sheetName="Pengeluaran"
            label="Export Pengeluaran"
          />
          <ExportExcel
            data={data.payments.map((p) => ({
              "Tanggal": p.date,
              "Proyek": p.projectName,
              "Kode Proyek": p.projectCode,
              "Tipe": p.type,
              "Keterangan": p.description,
              "Jumlah": p.amount,
            }))}
            filename="Pembayaran"
            sheetName="Pembayaran"
            label="Export Pembayaran"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <FinCard icon={Wallet} label="Total Kontrak" value={formatRupiah(totalContract)} />
        <FinCard icon={Banknote} label="Pembayaran Masuk" value={formatRupiah(totalPayments)} color="text-success" />
        <FinCard icon={Receipt} label="Total Pengeluaran" value={formatRupiah(totalExpenses)} color="text-critical" />
        <FinCard
          icon={cashflow >= 0 ? TrendingUp : TrendingDown}
          label="Cashflow"
          value={formatRupiah(cashflow)}
          color={cashflow >= 0 ? "text-success" : "text-critical"}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto gap-0 w-full justify-start overflow-x-auto">
          {[
            { id: "ringkasan", label: "Ringkasan" },
            { id: "pengeluaran", label: "Pengeluaran" },
            { id: "pembayaran", label: "Pembayaran" },
            { id: "proyek", label: "Per Proyek" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                "rounded-none border-b-2 border-transparent px-4 py-2.5",
                "data-[state=active]:border-safety data-[state=active]:text-foreground",
                "text-muted-foreground hover:text-foreground text-xs uppercase tracking-wider font-semibold transition-colors duration-150"
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── RINGKASAN ── */}
        <TabsContent value="ringkasan" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly Cashflow */}
            <Card className="card-architectural">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-safety" />
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                    Arus Kas Bulanan
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.monthlySummary.map((m) => {
                    const [year, month] = m.month.split("-");
                    const label = `${monthNames[parseInt(month) - 1]} ${year}`;
                    const maxVal = Math.max(
                      ...data.monthlySummary.map((x) => Math.max(x.expenses, x.payments))
                    );

                    return (
                      <div key={m.month} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground font-mono w-16">{label}</span>
                          <div className="flex gap-4">
                            <span className="text-success font-mono tabular-nums">+{formatRupiah(m.payments)}</span>
                            <span className="text-critical font-mono tabular-nums">-{formatRupiah(m.expenses)}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 h-3">
                          <div
                            className="h-full bg-success/30 rounded-sm"
                            style={{ width: `${maxVal > 0 ? (m.payments / maxVal) * 50 : 0}%` }}
                          />
                          <div
                            className="h-full bg-critical/30 rounded-sm"
                            style={{ width: `${maxVal > 0 ? (m.expenses / maxVal) * 50 : 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Expense by Type */}
            <Card className="card-architectural">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-safety" />
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                    Komposisi Pengeluaran
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(byType)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, amount]) => {
                      const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                      const meta = expenseTypeLabels[type] || { label: type, color: "bg-gray-500" };
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={cn("w-2.5 h-2.5 rounded-sm shrink-0", meta.color)} />
                              <span className="text-sm font-medium">{meta.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-mono tabular-nums">{pct.toFixed(0)}%</span>
                              <span className="text-sm font-mono font-semibold tabular-nums">{formatRupiah(amount)}</span>
                            </div>
                          </div>
                          <div className="h-2.5 bg-muted rounded-sm overflow-hidden">
                            <div className={cn("h-full rounded-sm", meta.color)} style={{ width: `${pct}%`, opacity: 0.6 }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── PENGELUARAN ── */}
        <TabsContent value="pengeluaran" className="mt-6">
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
                  {data.expenses.length} transaksi
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 label-architectural">Tanggal</th>
                      <th className="text-left p-3 label-architectural">Proyek</th>
                      <th className="text-left p-3 label-architectural">Kategori</th>
                      <th className="text-left p-3 label-architectural">Keterangan</th>
                      <th className="text-right p-3 label-architectural">Jumlah</th>
                      <th className="text-center p-3 label-architectural">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.expenses.map((exp) => {
                      const meta = expenseTypeLabels[exp.type] || { label: exp.type, color: "bg-gray-500" };
                      return (
                        <tr key={exp.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                            {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(exp.date))}
                          </td>
                          <td className="p-3">
                            <span className="project-ticket text-[10px]">{exp.projectCode}</span>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <span className={cn("w-1.5 h-1.5 rounded-full", meta.color)} />{meta.label}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground truncate max-w-[200px]">{exp.description}</td>
                          <td className="p-3 text-right font-mono tabular-nums font-semibold">{formatRupiah(exp.amount)}</td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className={cn("text-[10px]", exp.status === "approved" ? "text-success border-success/30" : "text-warning border-warning/30")}>
                              {exp.status === "approved" ? "✓" : "⏳"}
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
        </TabsContent>

        {/* ── PEMBAYARAN ── */}
        <TabsContent value="pembayaran" className="mt-6">
          <Card className="card-architectural">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-safety" />
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                    Riwayat Pembayaran (Termin)
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {data.payments.length} transaksi
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 label-architectural">Tanggal</th>
                      <th className="text-left p-3 label-architectural">Proyek</th>
                      <th className="text-left p-3 label-architectural">Tipe</th>
                      <th className="text-left p-3 label-architectural">Keterangan</th>
                      <th className="text-right p-3 label-architectural">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(p.date))}
                        </td>
                        <td className="p-3">
                          <span className="project-ticket text-[10px]">{p.projectCode}</span>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px] uppercase">{p.type}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{p.description}</td>
                        <td className="p-3 text-right font-mono tabular-nums font-semibold text-success">{formatRupiah(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PER PROYEK ── */}
        <TabsContent value="proyek" className="mt-6">
          <Card className="card-architectural">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-safety" />
                <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                  Keuangan per Proyek
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 label-architectural">Proyek</th>
                      <th className="text-right p-3 label-architectural">Kontrak</th>
                      <th className="text-right p-3 label-architectural">HPP Rencana</th>
                      <th className="text-right p-3 label-architectural">HPP Aktual</th>
                      <th className="text-right p-3 label-architectural">Margin</th>
                      <th className="text-center p-3 label-architectural">Progress</th>
                      <th className="text-center p-3 label-architectural">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.projectSummaries.map((p) => {
                      const margin = p.contractValue - p.hppPlan;
                      const marginPct = p.contractValue > 0 ? (margin / p.contractValue) * 100 : 0;
                      const status = getStatusColor(p.status);
                      return (
                        <tr key={p.code} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <div>
                              <Link href={`/proyek/${p.code}`} className="font-medium hover:text-safety transition-colors">{p.name}</Link>
                              <p className="text-[10px] text-muted-foreground font-mono">{p.code}</p>
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono tabular-nums">{formatRupiah(p.contractValue)}</td>
                          <td className="p-3 text-right font-mono tabular-nums">{formatRupiah(p.hppPlan)}</td>
                          <td className="p-3 text-right font-mono tabular-nums">{formatRupiah(p.hppActual)}</td>
                          <td className="p-3 text-right">
                            <span className={cn("font-mono tabular-nums font-semibold", margin >= 0 ? "text-success" : "text-critical")}>
                              {formatRupiah(margin)}
                            </span>
                            <p className="text-[10px] text-muted-foreground font-mono">{marginPct.toFixed(1)}%</p>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="progress-blueprint w-10 rounded-sm">
                                <div className="progress-blueprint-fill rounded-sm" style={{ width: `${p.progress}%` }} />
                              </div>
                              <span className="text-xs font-mono tabular-nums">{p.progress}%</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className={cn("text-[9px] uppercase tracking-wider", status.text)}>{status.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/30 font-semibold">
                      <td className="p-3 uppercase text-xs tracking-wider">Total</td>
                      <td className="p-3 text-right font-mono tabular-nums">{formatRupiah(totalContract)}</td>
                      <td className="p-3 text-right font-mono tabular-nums">{formatRupiah(data.projectSummaries.reduce((s, p) => s + p.hppPlan, 0))}</td>
                      <td className="p-3 text-right font-mono tabular-nums">{formatRupiah(totalExpenses)}</td>
                      <td className="p-3 text-right font-mono tabular-nums text-success">{formatRupiah(totalContract - data.projectSummaries.reduce((s, p) => s + p.hppPlan, 0))}</td>
                      <td className="p-3" />
                      <td className="p-3" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FinCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Card className="card-architectural">
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="label-architectural">{label}</span>
        </div>
        <p className={cn("text-lg font-semibold font-mono tabular-nums truncate", color || "text-foreground")}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
