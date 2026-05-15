"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface SCurveDataPoint {
  week: string;
  label: string;
  rencana: number;
  realisasi: number;
  milestone?: string;
}

interface SCurveChartProps {
  data: SCurveDataPoint[];
  height?: number;
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-card border border-border rounded p-3 shadow-lg text-xs">
      <p className="font-medium text-foreground mb-1.5">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-muted-foreground">
              {entry.dataKey === "rencana" ? "Rencana" : "Realisasi"}:
            </span>
            <span className="font-mono font-semibold tabular-nums">
              {entry.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SCurveChart({ data, height = 320 }: SCurveChartProps) {
  // Find milestones for reference lines
  const milestones = useMemo(
    () => data.filter((d) => d.milestone),
    [data]
  );

  // Current week index (last data point with realisasi > 0)
  const currentWeekIdx = useMemo(() => {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].realisasi > 0) return i;
    }
    return 0;
  }, [data]);

  // Deviation at current point
  const currentDeviation = useMemo(() => {
    if (!data[currentWeekIdx]) return 0;
    return data[currentWeekIdx].realisasi - data[currentWeekIdx].rencana;
  }, [data, currentWeekIdx]);

  return (
    <div className="space-y-3">
      {/* Header with deviation indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-primary/40" />
            <span className="text-muted-foreground">Rencana</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-safety rounded-full" />
            <span className="text-muted-foreground">Realisasi</span>
          </div>
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-mono font-semibold tabular-nums ${
            currentDeviation >= 0 ? "text-success" : "text-critical"
          }`}
        >
          <span>Deviasi:</span>
          <span>
            {currentDeviation >= 0 ? "+" : ""}
            {currentDeviation.toFixed(1)}%
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <pattern
              id="gridPattern"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="var(--grid)"
                strokeWidth="0.5"
              />
            </pattern>
            <linearGradient id="realisasiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F5C518" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F5C518" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            stroke="var(--grid)"
            strokeOpacity={0.8}
          />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            interval="preserveStartEnd"
          />

          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Milestone reference lines */}
          {milestones.map((m) => (
            <ReferenceLine
              key={m.week}
              x={m.label}
              stroke="var(--construction)"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{
                value: m.milestone || "",
                position: "insideTopRight",
                fill: "var(--construction)",
                fontSize: 9,
                fontWeight: 600,
                angle: -45,
              }}
            />
          ))}

          {/* Today indicator */}
          {data[currentWeekIdx] && (
            <ReferenceLine
              x={data[currentWeekIdx].label}
              stroke="var(--safety)"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{
                value: "Hari ini",
                position: "insideTopLeft",
                fill: "var(--safety)",
                fontSize: 10,
                fontWeight: 600,
              }}
            />
          )}

          {/* Rencana — dashed line */}
          <Area
            type="monotone"
            dataKey="rencana"
            stroke="var(--primary)"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            fill="none"
            dot={false}
            activeDot={{
              r: 3,
              fill: "var(--primary)",
              strokeWidth: 0,
            }}
          />

          {/* Realisasi — solid with gradient fill */}
          <Area
            type="monotone"
            dataKey="realisasi"
            stroke="#F5C518"
            strokeWidth={2}
            fill="url(#realisasiGradient)"
            dot={false}
            activeDot={{
              r: 4,
              fill: "#F5C518",
              strokeWidth: 2,
              stroke: "var(--card)",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Generate S-Curve mock data ──
export function generateSCurveData(): SCurveDataPoint[] {
  const totalWeeks = 32; // ~8 bulan
  const currentWeek = 17; // minggu saat ini

  const data: SCurveDataPoint[] = [];

  for (let i = 0; i <= totalWeeks; i++) {
    // S-curve formula (logistic function)
    const t = i / totalWeeks;
    const rencana = 100 / (1 + Math.exp(-10 * (t - 0.5)));

    // Realisasi dengan sedikit deviasi
    let realisasi = 0;
    if (i <= currentWeek) {
      const deviation = Math.sin(i * 0.8) * 3 + (i > 10 ? -2 : 1);
      realisasi = Math.max(0, Math.min(100, rencana + deviation));
    }

    const weekDate = new Date(2026, 0, 15 + i * 7);
    const label = weekDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

    data.push({
      week: `W${i + 1}`,
      label,
      rencana: Math.round(rencana * 10) / 10,
      realisasi: i <= currentWeek ? Math.round(realisasi * 10) / 10 : 0,
      milestone:
        i === 4
          ? "Pondasi"
          : i === 10
          ? "Struktur"
          : i === 18
          ? "Arsitektur"
          : i === 26
          ? "Finishing"
          : undefined,
    });
  }

  return data;
}
