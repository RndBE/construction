"use client";

import React, { useState } from "react";
import {
  FileBarChart,
  FileDown,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  Calendar,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah, getStatusColor } from "@/lib/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ExportExcel from "@/components/shared/ExportExcel";

interface LaporanProject {
  id: string;
  name: string;
  client: string;
  progress: number;
  contractValue: number;
  hppActual: number;
  status: string;
  lastUpdate: string | null;
}

export default function LaporanClient({
  projects,
}: {
  projects: LaporanProject[];
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const generateSummaryPDF = async () => {
    setIsGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF("l", "mm", "a4"); // Landscape
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = margin;

      // Header
      doc.setFillColor(14, 27, 44);
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setTextColor(245, 197, 24);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("LAPORAN RINGKASAN PROYEK", margin, 13);
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      doc.text(
        `BEACON Konstruksi — Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
        margin,
        22
      );
      y = 40;

      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      const cols = [
        { label: "Kode", x: margin + 2, w: 18 },
        { label: "Nama Proyek", x: margin + 22, w: 65 },
        { label: "Klien", x: margin + 90, w: 50 },
        { label: "Nilai Kontrak", x: margin + 142, w: 35 },
        { label: "HPP Aktual", x: margin + 178, w: 35 },
        { label: "Progress", x: margin + 215, w: 20 },
        { label: "Status", x: margin + 237, w: 25 },
      ];
      cols.forEach((c) => doc.text(c.label, c.x, y + 5));
      y += 9;

      // Table rows
      doc.setFont("helvetica", "normal");
      doc.setTextColor(14, 27, 44);
      doc.setFontSize(7);

      for (const p of projects) {
        doc.text(p.id, cols[0].x, y + 4);
        doc.text(p.name.substring(0, 35), cols[1].x, y + 4);
        doc.text(p.client.substring(0, 28), cols[2].x, y + 4);
        doc.text(formatRupiah(p.contractValue), cols[3].x, y + 4);
        doc.text(formatRupiah(p.hppActual), cols[4].x, y + 4);

        // Progress bar
        doc.setFillColor(230, 230, 230);
        doc.rect(cols[5].x, y + 1, 15, 3, "F");
        doc.setFillColor(245, 197, 24);
        doc.rect(cols[5].x, y + 1, 15 * (p.progress / 100), 3, "F");
        doc.text(`${p.progress}%`, cols[5].x + 16, y + 4);

        doc.text(p.status.toUpperCase(), cols[6].x, y + 4);

        y += 7;
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, y, pageWidth - margin, y);
        y += 1;
      }

      // Totals
      y += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      const totalContract = projects.reduce((s, p) => s + p.contractValue, 0);
      const totalHpp = projects.reduce((s, p) => s + p.hppActual, 0);
      doc.text(`Total Kontrak: ${formatRupiah(totalContract)}`, margin, y + 4);
      doc.text(`Total HPP Aktual: ${formatRupiah(totalHpp)}`, margin + 90, y + 4);
      doc.text(
        `Avg Progress: ${Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)}%`,
        margin + 180,
        y + 4
      );

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `BEACON Konstruksi — Hal ${i}/${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" }
        );
      }

      doc.save(`Laporan_Ringkasan_${new Date().toISOString().split("T")[0]}.pdf`);
      setIsDone(true);
      setTimeout(() => setIsDone(false), 3000);
    } catch (err) {
      console.error("PDF error:", err);
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Laporan
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generate dan download laporan proyek
          </p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Summary PDF Report */}
        <Card className="card-architectural hover:border-safety/50 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded bg-safety/10 flex items-center justify-center shrink-0">
                <FileBarChart className="w-5 h-5 text-safety" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Laporan Ringkasan Proyek</h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                  Ringkasan seluruh proyek: progress, nilai kontrak, HPP, dan status
                </p>
                <Button
                  onClick={generateSummaryPDF}
                  disabled={isGenerating}
                  size="sm"
                  className={cn(
                    "gap-1.5 text-xs uppercase tracking-wider w-full",
                    isDone
                      ? "bg-success text-white"
                      : "bg-safety text-safety-foreground hover:bg-safety/90"
                  )}
                >
                  {isGenerating ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating...</>
                  ) : isDone ? (
                    <><CheckCircle className="w-3.5 h-3.5" />Downloaded</>
                  ) : (
                    <><FileDown className="w-3.5 h-3.5" />Download PDF</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Excel Export */}
        <Card className="card-architectural hover:border-safety/50 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded bg-success/10 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Export Data Proyek (Excel)</h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                  Export data proyek ke spreadsheet untuk analisis lanjutan
                </p>
                <ExportExcel
                  data={projects.map((p) => ({
                    "Kode": p.id,
                    "Nama Proyek": p.name,
                    "Klien": p.client,
                    "Nilai Kontrak": p.contractValue,
                    "HPP Aktual": p.hppActual,
                    "Progress %": p.progress,
                    "Status": p.status,
                    "Update Terakhir": p.lastUpdate || "-",
                  }))}
                  filename="Data_Proyek"
                  sheetName="Proyek"
                  label="Download Excel"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card className="card-architectural opacity-60">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Laporan Bulanan</h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                  Generate laporan progress bulanan per proyek dengan foto dan grafik
                </p>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                  Coming Soon
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Status Overview */}
      <Card className="card-architectural">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-safety" />
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              Status Proyek Saat Ini
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
                  <th className="text-right p-3 label-architectural">HPP</th>
                  <th className="text-center p-3 label-architectural">Progress</th>
                  <th className="text-center p-3 label-architectural">Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const status = getStatusColor(p.status);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3">
                        <div>
                          <span className="font-medium">{p.name}</span>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {p.id}
                          </p>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono tabular-nums">
                        {formatRupiah(p.contractValue)}
                      </td>
                      <td className="p-3 text-right font-mono tabular-nums">
                        {formatRupiah(p.hppActual)}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="progress-blueprint w-12 rounded-sm">
                            <div
                              className="progress-blueprint-fill rounded-sm"
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono tabular-nums">
                            {p.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] uppercase tracking-wider",
                            status.text
                          )}
                        >
                          {status.label}
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
