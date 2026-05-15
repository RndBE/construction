"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface GanttItem {
  id: string;
  name: string;
  startWeek: number;
  endWeek: number;
  progress: number;
  isDelay: boolean;
  parentId?: string;
  level: number;
}

interface GanttChartProps {
  items: GanttItem[];
  totalWeeks: number;
  currentWeek: number;
  startDate: Date;
}

export default function GanttChart({
  items,
  totalWeeks,
  currentWeek,
  startDate,
}: GanttChartProps) {
  // Generate week labels
  const weekLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 0; i < totalWeeks; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i * 7);
      if (i % 4 === 0) {
        labels.push(
          d.toLocaleDateString("id-ID", { month: "short", day: "numeric" })
        );
      } else {
        labels.push("");
      }
    }
    return labels;
  }, [totalWeeks, startDate]);

  const colWidth = `${100 / totalWeeks}%`;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header — week columns */}
        <div className="flex border-b border-border">
          <div className="w-[200px] shrink-0 p-2">
            <span className="label-architectural">Item Pekerjaan</span>
          </div>
          <div className="flex-1 flex relative">
            {weekLabels.map((label, i) => (
              <div
                key={i}
                className="flex-1 text-center border-l border-border/30"
              >
                {label && (
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex border-b border-border/30 hover:bg-muted/20 transition-colors group"
          >
            {/* Item name */}
            <div
              className="w-[200px] shrink-0 p-2 flex items-center"
              style={{ paddingLeft: `${8 + item.level * 16}px` }}
            >
              <span
                className={cn(
                  "text-xs truncate",
                  item.level === 0
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </span>
            </div>

            {/* Gantt bar area */}
            <div className="flex-1 flex relative py-1.5">
              {/* Grid columns */}
              {Array.from({ length: totalWeeks }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 border-l border-border/15",
                    i === currentWeek && "border-l-2 border-l-safety/40"
                  )}
                />
              ))}

              {/* Today line */}
              <div
                className="absolute top-0 bottom-0 w-px bg-safety/50 z-10"
                style={{
                  left: `${(currentWeek / totalWeeks) * 100}%`,
                }}
              />

              {/* Bar */}
              {item.startWeek < totalWeeks && (
                <div
                  className="absolute top-1.5 bottom-1.5 rounded-sm flex items-center overflow-hidden"
                  style={{
                    left: `${(item.startWeek / totalWeeks) * 100}%`,
                    width: `${((item.endWeek - item.startWeek) / totalWeeks) * 100}%`,
                  }}
                >
                  {/* Background */}
                  <div
                    className={cn(
                      "absolute inset-0 border rounded-sm",
                      item.isDelay
                        ? "border-critical/40 bg-critical/8"
                        : "border-primary/20 bg-primary/5"
                    )}
                    style={
                      item.isDelay
                        ? {
                            backgroundImage:
                              "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(193,41,46,0.08) 3px, rgba(193,41,46,0.08) 6px)",
                          }
                        : undefined
                    }
                  />

                  {/* Progress fill */}
                  <div
                    className={cn(
                      "absolute top-0 bottom-0 left-0 rounded-sm",
                      item.isDelay ? "bg-critical/25" : "bg-safety/40"
                    )}
                    style={{ width: `${item.progress}%` }}
                  />

                  {/* Progress text */}
                  <span className="relative z-10 text-[9px] font-mono font-semibold tabular-nums px-1.5 text-foreground/80">
                    {item.progress}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Today label */}
        <div className="flex">
          <div className="w-[200px] shrink-0" />
          <div className="flex-1 relative">
            <div
              className="absolute -top-1 text-[9px] font-mono text-safety font-semibold -translate-x-1/2"
              style={{
                left: `${(currentWeek / totalWeeks) * 100}%`,
              }}
            >
              ▲ Hari ini
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Generate mock Gantt data ──
export function generateGanttData(): {
  items: GanttItem[];
  totalWeeks: number;
  currentWeek: number;
} {
  return {
    totalWeeks: 32,
    currentWeek: 17,
    items: [
      { id: "1", name: "Pekerjaan Struktur", startWeek: 0, endWeek: 18, progress: 80, isDelay: false, level: 0 },
      { id: "1.1", name: "Pondasi Batu Kali", startWeek: 0, endWeek: 4, progress: 100, isDelay: false, parentId: "1", level: 1 },
      { id: "1.2", name: "Kolom Beton K-225", startWeek: 4, endWeek: 14, progress: 95, isDelay: false, parentId: "1", level: 1 },
      { id: "1.3", name: "Balok Beton K-225", startWeek: 8, endWeek: 14, progress: 75, isDelay: false, parentId: "1", level: 1 },
      { id: "1.4", name: "Plat Lantai t=12cm", startWeek: 12, endWeek: 18, progress: 70, isDelay: false, parentId: "1", level: 1 },
      { id: "2", name: "Pekerjaan Arsitektur", startWeek: 12, endWeek: 28, progress: 25, isDelay: true, level: 0 },
      { id: "2.1", name: "Pasangan Dinding", startWeek: 12, endWeek: 22, progress: 55, isDelay: true, parentId: "2", level: 1 },
      { id: "2.2", name: "Plester + Aci + Cat", startWeek: 16, endWeek: 26, progress: 5, isDelay: false, parentId: "2", level: 1 },
      { id: "2.3", name: "Rangka Atap Baja", startWeek: 18, endWeek: 24, progress: 0, isDelay: false, parentId: "2", level: 1 },
      { id: "3", name: "Pekerjaan MEP", startWeek: 20, endWeek: 30, progress: 0, isDelay: false, level: 0 },
    ],
  };
}
