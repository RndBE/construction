"use client";

import React, { useState } from "react";
import { FileDown, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/data/mock";

interface ReportData {
  project: {
    id: string;
    name: string;
    client: string;
    address: string;
    startDate: string;
    endDate: string;
    contractValue: number;
    progress: number;
    hppPlan: number;
    hppActual: number;
    pic: string;
    status: string;
  };
  progressUpdates: {
    date: string;
    itemPekerjaan: string;
    progress: number;
    weather: string;
    notes: string;
  }[];
  workItems: {
    name: string;
    unit: string | null;
    volume: string;
    unitPrice: number;
    currentProgress: number;
    parentId: string | null;
  }[];
}

export default function ReportGenerator({ data }: { data: ReportData }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = margin;

      // ── Header ──
      doc.setFillColor(14, 27, 44); // navy
      doc.rect(0, 0, pageWidth, 35, "F");
      doc.setTextColor(245, 197, 24); // safety yellow
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("LAPORAN PROGRESS PROYEK", margin, 15);
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.text(`${data.project.id} — ${data.project.name}`, margin, 23);
      doc.setFontSize(8);
      doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, margin, 30);

      y = 45;

      // ── Project Info ──
      doc.setTextColor(14, 27, 44);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("INFORMASI PROYEK", margin, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const info = [
        ["Klien", data.project.client],
        ["Alamat", data.project.address],
        ["PIC", data.project.pic || "—"],
        ["Status", data.project.status.toUpperCase()],
        ["Periode", `${data.project.startDate} s/d ${data.project.endDate}`],
        ["Nilai Kontrak", formatRupiah(data.project.contractValue)],
        ["HPP Rencana", formatRupiah(data.project.hppPlan)],
        ["HPP Aktual", formatRupiah(data.project.hppActual)],
      ];

      for (const [label, value] of info) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 100, 100);
        doc.text(`${label}:`, margin, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(14, 27, 44);
        doc.text(String(value), margin + 35, y);
        y += 5.5;
      }

      // ── Progress Bar ──
      y += 5;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(14, 27, 44);
      doc.text("PROGRESS KESELURUHAN", margin, y);
      y += 6;

      // Progress bar
      const barWidth = pageWidth - 2 * margin;
      const barHeight = 8;
      doc.setFillColor(230, 230, 230);
      doc.rect(margin, y, barWidth, barHeight, "F");
      doc.setFillColor(245, 197, 24);
      doc.rect(margin, y, barWidth * (data.project.progress / 100), barHeight, "F");
      doc.setFontSize(10);
      doc.setTextColor(14, 27, 44);
      doc.setFont("helvetica", "bold");
      doc.text(`${data.project.progress}%`, margin + barWidth / 2 - 5, y + 6);
      y += barHeight + 10;

      // ── Work Items Table ──
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("RINCIAN PEKERJAAN", margin, y);
      y += 7;

      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, pageWidth - 2 * margin, 6, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text("Uraian Pekerjaan", margin + 2, y + 4);
      doc.text("Sat", margin + 80, y + 4);
      doc.text("Volume", margin + 95, y + 4);
      doc.text("Harga Satuan", margin + 115, y + 4);
      doc.text("Progress", margin + 150, y + 4);
      y += 8;

      const leafItems = data.workItems.filter((w) => w.parentId);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(14, 27, 44);

      for (const item of leafItems) {
        if (y > 270) {
          doc.addPage();
          y = margin;
        }
        doc.setFontSize(7);
        doc.text(item.name, margin + 2, y + 4);
        doc.text(item.unit || "—", margin + 80, y + 4);
        doc.text(String(parseFloat(item.volume || "0")), margin + 95, y + 4);
        doc.text(formatRupiah(item.unitPrice), margin + 115, y + 4);
        doc.text(`${item.currentProgress}%`, margin + 155, y + 4);

        // Mini progress bar
        doc.setFillColor(230, 230, 230);
        doc.rect(margin + 145, y + 1, 20, 3, "F");
        doc.setFillColor(245, 197, 24);
        doc.rect(margin + 145, y + 1, 20 * (item.currentProgress / 100), 3, "F");

        y += 6;
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, y, pageWidth - margin, y);
        y += 1;
      }

      // ── Progress Updates ──
      y += 8;
      if (y > 250) { doc.addPage(); y = margin; }
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(14, 27, 44);
      doc.text("RIWAYAT PROGRESS TERBARU", margin, y);
      y += 7;

      for (const update of data.progressUpdates.slice(0, 10)) {
        if (y > 270) { doc.addPage(); y = margin; }

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 100, 100);
        doc.text(update.date, margin, y + 4);
        doc.setTextColor(14, 27, 44);
        doc.text(`${update.itemPekerjaan} — ${update.progress}%`, margin + 25, y + 4);
        y += 5;

        if (update.notes) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(120, 120, 120);
          const lines = doc.splitTextToSize(update.notes, pageWidth - 2 * margin - 25);
          doc.text(lines, margin + 25, y + 3);
          y += lines.length * 4;
        }
        y += 3;
      }

      // ── Footer ──
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `BEACON Konstruksi — Halaman ${i}/${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" }
        );
      }

      // Save
      doc.save(`Laporan_${data.project.id}_${new Date().toISOString().split("T")[0]}.pdf`);
      setIsDone(true);
      setTimeout(() => setIsDone(false), 3000);
    } catch (err) {
      console.error("PDF generation error:", err);
    }

    setIsGenerating(false);
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      variant="outline"
      size="sm"
      className={cn(
        "gap-1.5 text-xs uppercase tracking-wider",
        isDone && "text-success border-success/30"
      )}
    >
      {isGenerating ? (
        <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating...</>
      ) : isDone ? (
        <><CheckCircle className="w-3.5 h-3.5" />Downloaded</>
      ) : (
        <><FileDown className="w-3.5 h-3.5" />Export PDF</>
      )}
    </Button>
  );
}
