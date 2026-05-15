"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarDay {
  date: string;
  dayOfWeek: number; // 0=Sun
  value: number; // 0=no activity, 1-5 intensity
  label?: string;
}

interface ProgressHeatmapProps {
  data: CalendarDay[];
  colorToken?: string; // CSS var for color
}

const dayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function ProgressHeatmap({
  data,
  colorToken = "#F5C518",
}: ProgressHeatmapProps) {
  // Group by weeks
  const weeks = useMemo(() => {
    const result: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];

    // Pad the beginning of the first week
    if (data.length > 0) {
      const firstDayOfWeek = data[0].dayOfWeek;
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push({
          date: "",
          dayOfWeek: i,
          value: -1,
        });
      }
    }

    data.forEach((day) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      // Pad the end
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: "",
          dayOfWeek: currentWeek.length,
          value: -1,
        });
      }
      result.push(currentWeek);
    }

    return result;
  }, [data]);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIdx) => {
      const firstValidDay = week.find((d) => d.date);
      if (firstValidDay) {
        const month = new Date(firstValidDay.date).getMonth();
        if (month !== lastMonth) {
          labels.push({
            label: new Date(firstValidDay.date).toLocaleDateString("id-ID", {
              month: "short",
            }),
            weekIndex: weekIdx,
          });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [weeks]);

  function getIntensityColor(value: number): string {
    if (value <= 0) return "transparent";
    const opacity = Math.min(value / 5, 1);
    return `color-mix(in srgb, ${colorToken} ${Math.round(opacity * 100)}%, transparent)`;
  }

  function getIntensityBorder(value: number): string {
    if (value <= 0) return "var(--border)";
    return `color-mix(in srgb, ${colorToken} ${Math.min(value * 25, 100)}%, transparent)`;
  }

  // Stats
  const totalDays = data.filter((d) => d.value > 0).length;
  const totalDataDays = data.filter((d) => d.date).length;

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {totalDays} dari {totalDataDays} hari ada aktivitas
        </span>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground/60 text-[10px]">Sedikit</span>
          {[1, 2, 3, 4, 5].map((v) => (
            <div
              key={v}
              className="w-2.5 h-2.5 rounded-sm border"
              style={{
                background: getIntensityColor(v),
                borderColor: getIntensityBorder(v),
              }}
            />
          ))}
          <span className="text-muted-foreground/60 text-[10px]">Banyak</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-0">
          {/* Month labels */}
          <div className="flex ml-7">
            {weeks.map((_, weekIdx) => {
              const monthLabel = monthLabels.find(
                (m) => m.weekIndex === weekIdx
              );
              return (
                <div
                  key={weekIdx}
                  className="w-3.5 text-center"
                  style={{ marginRight: "2px" }}
                >
                  {monthLabel && (
                    <span className="text-[9px] text-muted-foreground font-mono">
                      {monthLabel.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col mr-1" style={{ gap: "2px" }}>
              {dayLabels.map((label, i) => (
                <div
                  key={i}
                  className="h-3.5 flex items-center"
                >
                  {i % 2 === 1 && (
                    <span className="text-[9px] text-muted-foreground font-mono w-5 text-right">
                      {label}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex" style={{ gap: "2px" }}>
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col" style={{ gap: "2px" }}>
                  {week.map((day, dayIdx) => {
                    if (day.value === -1) {
                      return (
                        <div
                          key={dayIdx}
                          className="w-3.5 h-3.5 rounded-sm"
                        />
                      );
                    }

                    const dateLabel = day.date
                      ? new Date(day.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "";

                    return (
                      <Tooltip key={dayIdx}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-3.5 h-3.5 rounded-sm border cursor-default transition-colors",
                              day.value === 0 && "bg-muted/30 border-border/50"
                            )}
                            style={
                              day.value > 0
                                ? {
                                    background: getIntensityColor(day.value),
                                    borderColor: getIntensityBorder(day.value),
                                  }
                                : undefined
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">{dateLabel}</p>
                          {day.value > 0 ? (
                            <p className="text-muted-foreground">
                              {day.value} update progress
                            </p>
                          ) : (
                            <p className="text-muted-foreground">
                              Tidak ada aktivitas
                            </p>
                          )}
                          {day.label && (
                            <p className="text-muted-foreground">{day.label}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Generate mock heatmap data ──
export function generateHeatmapData(): CalendarDay[] {
  const data: CalendarDay[] = [];
  const start = new Date(2026, 0, 1); // 1 Jan 2026
  const end = new Date(2026, 4, 14); // 14 Mei 2026

  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dateStr = current.toISOString().split("T")[0];

    // Random activity — more on weekdays, less on weekends
    let value = 0;
    if (!isWeekend) {
      const random = Math.random();
      if (random > 0.2) value = Math.ceil(Math.random() * 5);
    } else {
      if (Math.random() > 0.7) value = Math.ceil(Math.random() * 2);
    }

    // No activity before project start (Jan 15)
    if (current < new Date(2026, 0, 15)) value = 0;

    data.push({
      date: dateStr,
      dayOfWeek,
      value,
    });

    current.setDate(current.getDate() + 1);
  }

  return data;
}
