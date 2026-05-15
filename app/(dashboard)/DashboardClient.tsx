"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  FolderKanban,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ArrowRight,
  MapPin,
  Calendar,
  CloudSun,
  Cloud,
  CloudRain,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah, formatTanggalShort, getStatusColor } from "@/lib/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MapDashboard from "@/components/map/MapDashboard";

// ─── Types ───
interface ProjectData {
  id: string;
  name: string;
  client: string;
  address: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  contractValue: number;
  status: string;
  type: string;
  pic: string;
  progress: number;
  hppPlan: number;
  hppActual: number;
  workersCount: number;
  lastUpdate: string | null;
}

interface MetricsData {
  totalProyek: number;
  proyekAktif: number;
  totalNilaiKontrak: number;
  totalMargin: number;
  hppVariance: number;
  totalTukang: number;
}

interface ProgressUpdate {
  id: string;
  projectId: string;
  projectName: string;
  itemPekerjaan: string;
  progress: number;
  date: string;
  weather: string;
  mandor: string;
  notes: string;
}

interface DashboardClientProps {
  projects: ProjectData[];
  metrics: MetricsData;
  progressUpdates: ProgressUpdate[];
}

// ─── Count-Up Animation Hook ───
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return { value };
}

// ─── Metric Card ───
function MetricCard({
  label,
  value,
  formattedValue,
  icon: Icon,
  trend,
  trendLabel,
  delay = 0,
}: {
  label: string;
  value: number;
  formattedValue?: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendLabel?: string;
  delay?: number;
}) {
  const counter = useCountUp(value, 1200);

  return (
    <Card className="card-architectural group hover:border-safety/40 transition-colors duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded bg-primary/5 flex items-center justify-center">
            <Icon className="w-[18px] h-[18px] text-primary/70" />
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend === "up" ? "text-success" : "text-critical"
              )}
            >
              {trend === "up" ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{trendLabel}</span>
            </div>
          )}
        </div>
        <p
          className="metric-display text-2xl font-bold text-foreground tabular-nums font-heading animate-count-up"
          style={{ animationDelay: `${delay}ms` }}
        >
          {formattedValue
            ? formatRupiah(counter.value)
            : counter.value.toLocaleString("id-ID")}
        </p>
        <p className="label-architectural mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

// ─── Weather Icon ───
function WeatherIcon({ weather }: { weather: string }) {
  switch (weather) {
    case "cerah":
      return <CloudSun className="w-4 h-4 text-warning" />;
    case "mendung":
      return <Cloud className="w-4 h-4 text-muted-foreground" />;
    case "hujan":
      return <CloudRain className="w-4 h-4 text-blue-500" />;
    default:
      return null;
  }
}

// ─── Progress Update Card ───
function ProgressUpdateCard({
  update,
  index,
  total,
}: {
  update: ProgressUpdate;
  index: number;
  total: number;
}) {
  return (
    <div
      className="group flex gap-3 p-3 rounded border border-transparent hover:border-border hover:bg-card transition-all duration-150 animate-count-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex flex-col items-center pt-1.5">
        <div className="w-2 h-2 rounded-full bg-safety shrink-0" />
        {index < total - 1 && <div className="w-px flex-1 bg-border mt-1" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="project-ticket">{update.projectId}</span>
          <WeatherIcon weather={update.weather} />
          <span className="text-xs text-muted-foreground ml-auto">
            {formatTanggalShort(update.date)}
          </span>
        </div>
        <p className="text-sm font-medium text-foreground truncate">
          {update.itemPekerjaan}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {update.projectName}
        </p>
        {update.notes && (
          <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">
            {update.notes}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="progress-blueprint flex-1 w-20 rounded-sm">
              <div
                className="progress-blueprint-fill rounded-sm"
                style={{ width: `${update.progress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-medium tabular-nums">
              {update.progress}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            oleh {update.mandor}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Active Projects Mini List ───
function ActiveProjectsList({ projects }: { projects: ProjectData[] }) {
  const activeProjects = projects
    .filter((p) => p.status === "berjalan")
    .sort((a, b) => b.progress - a.progress);

  return (
    <div className="space-y-2">
      {activeProjects.map((project) => {
        const status = getStatusColor(project.status);
        const hppVariance =
          project.progress > 0 && project.hppPlan > 0
            ? ((project.hppActual -
                (project.progress / 100) * project.hppPlan) /
                ((project.progress / 100) * project.hppPlan)) *
              100
            : 0;

        return (
          <Link
            key={project.id}
            href={`/proyek/${project.id}`}
            className="flex items-center gap-3 p-3 rounded border border-transparent hover:border-border hover:bg-card transition-all duration-150 group"
          >
            <div className="shrink-0">
              <span className={cn("status-dot", status.dot)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="project-ticket">{project.id}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider",
                    status.text
                  )}
                >
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm font-medium truncate mt-0.5">
                {project.name}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5">
                  <div className="progress-blueprint w-16 rounded-sm">
                    <div
                      className="progress-blueprint-fill rounded-sm"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono tabular-nums">
                    {project.progress}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {project.workersCount}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-mono tabular-nums font-medium">
                {formatRupiah(project.contractValue)}
              </p>
              <p
                className={cn(
                  "text-[10px] font-mono tabular-nums",
                  hppVariance > 5
                    ? "text-critical"
                    : hppVariance > 0
                    ? "text-warning"
                    : "text-success"
                )}
              >
                HPP {hppVariance > 0 ? "+" : ""}
                {hppVariance.toFixed(1)}%
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard Client ───
export default function DashboardClient({
  projects,
  metrics,
  progressUpdates,
}: DashboardClientProps) {
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ringkasan seluruh proyek konstruksi aktif
          </p>
        </div>
        {dateStr && (
          <p className="text-xs text-muted-foreground font-mono tabular-nums">
            {dateStr}
          </p>
        )}
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Hero: Map (2/3 width) ── */}
        <div className="lg:col-span-2 row-span-2">
          <Card className="card-architectural h-full overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-safety" />
                <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                  Peta Sebaran Proyek
                </CardTitle>
              </div>
              <Link href="/peta">
                <Button
                  variant="ghost"
                  size="xs"
                  className="gap-1 text-xs text-muted-foreground"
                >
                  Lihat Penuh
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] lg:h-[480px]">
                <MapDashboard projects={projects} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Metrics Column (1/3 right) ── */}
        <div className="space-y-4">
          <MetricCard
            label="Proyek Aktif"
            value={metrics.proyekAktif}
            icon={FolderKanban}
            trend="up"
            trendLabel={`${metrics.totalProyek} total`}
          />
          <MetricCard
            label="Total Nilai Kontrak"
            value={metrics.totalNilaiKontrak}
            formattedValue="rupiah"
            icon={TrendingUp}
            trend="up"
            trendLabel="12.5%"
            delay={100}
          />
          <MetricCard
            label="Estimasi Margin"
            value={metrics.totalMargin}
            formattedValue="rupiah"
            icon={TrendingUp}
            trend={metrics.hppVariance < 0 ? "up" : "down"}
            trendLabel={`${metrics.hppVariance > 0 ? "+" : ""}${metrics.hppVariance}%`}
            delay={200}
          />
          <MetricCard
            label="Total Tukang"
            value={metrics.totalTukang}
            icon={Users}
            delay={300}
          />
        </div>
      </div>

      {/* Bottom Section: Progress Updates + Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Progress Updates */}
        <Card className="card-architectural">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CircleDot className="w-4 h-4 text-safety" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                Update Progress Terbaru
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              {progressUpdates.length} update
            </Badge>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0">
              {progressUpdates.map((update, i) => (
                <ProgressUpdateCard
                  key={update.id}
                  update={update}
                  index={i}
                  total={progressUpdates.length}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Projects List */}
        <Card className="card-architectural">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-safety" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                Proyek Aktif
              </CardTitle>
            </div>
            <Link href="/proyek">
              <Button
                variant="ghost"
                size="xs"
                className="gap-1 text-xs text-muted-foreground"
              >
                Semua Proyek
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <ActiveProjectsList projects={projects} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
