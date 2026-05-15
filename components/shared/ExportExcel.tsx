"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExportExcelProps {
  data: Record<string, any>[];
  filename: string;
  sheetName?: string;
  label?: string;
}

export default function ExportExcel({
  data,
  filename,
  sheetName = "Data",
  label = "Export Excel",
}: ExportExcelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleExport = async () => {
    if (data.length === 0) return;
    setIsExporting(true);

    try {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(data);

      // Auto-width columns
      const colWidths = Object.keys(data[0]).map((key) => ({
        wch: Math.max(
          key.length,
          ...data.map((row) => String(row[key] ?? "").length)
        ) + 2,
      }));
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Generate and download
      XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);

      setIsDone(true);
      setTimeout(() => setIsDone(false), 3000);
    } catch (err) {
      console.error("Export error:", err);
    }

    setIsExporting(false);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting || data.length === 0}
      variant="outline"
      size="sm"
      className={cn(
        "gap-1.5 text-xs uppercase tracking-wider",
        isDone && "text-success border-success/30"
      )}
    >
      {isExporting ? (
        <><Loader2 className="w-3.5 h-3.5 animate-spin" />Exporting...</>
      ) : isDone ? (
        <><CheckCircle className="w-3.5 h-3.5" />Downloaded</>
      ) : (
        <><FileSpreadsheet className="w-3.5 h-3.5" />{label}</>
      )}
    </Button>
  );
}
