"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Users, Calendar, TrendingUp, TrendingDown,
  FileText, Package, Hammer, Wallet, BarChart3, CloudSun, Cloud, CloudRain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah, formatTanggal, formatTanggalShort, getStatusColor, getHealthScore } from "@/lib/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapDashboard from "@/components/map/MapDashboard";
import dynamic from "next/dynamic";
import { generateSCurveData } from "@/components/charts/SCurveChart";
import { generateGanttData } from "@/components/charts/GanttChart";
import { generateHeatmapData } from "@/components/charts/ProgressHeatmap";
import ProgressForm from "@/components/proyek/ProgressForm";
import RABEditor from "@/components/proyek/RABEditor";
import HPPModule from "@/components/proyek/HPPModule";
import ReportGenerator from "@/components/proyek/ReportGenerator";
import ExportExcel from "@/components/shared/ExportExcel";

const SCurveChart = dynamic(() => import("@/components/charts/SCurveChart"), { ssr: false });
const GanttChart = dynamic(() => import("@/components/charts/GanttChart"), { ssr: false });
const ProgressHeatmap = dynamic(() => import("@/components/charts/ProgressHeatmap"), { ssr: false });

const projectTabs = [
  { id: "ringkasan", label: "Ringkasan", icon: BarChart3 },
  { id: "peta", label: "Peta", icon: MapPin },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "rab", label: "RAB", icon: FileText },
  { id: "material", label: "Material", icon: Package },
  { id: "tukang", label: "Tukang", icon: Hammer },
  { id: "hpp", label: "HPP", icon: BarChart3 },
  { id: "keuangan", label: "Keuangan", icon: Wallet },
];

function WeatherIcon({ weather }: { weather: string }) {
  switch (weather) {
    case "cerah": return <CloudSun className="w-4 h-4 text-warning" />;
    case "mendung": return <Cloud className="w-4 h-4 text-muted-foreground" />;
    case "hujan": return <CloudRain className="w-4 h-4 text-blue-500" />;
    default: return null;
  }
}

interface ProjectDetailClientProps {
  project: any;
  progressUpdates: any[];
  workItems?: any[];
  expenses?: any[];
  payments?: any[];
}

export default function ProjectDetailClient({ project, progressUpdates, workItems = [], expenses = [], payments = [] }: ProjectDetailClientProps) {
  const [activeTab, setActiveTab] = useState("ringkasan");

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Proyek tidak ditemukan</p>
        <Link href="/proyek">
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="w-4 h-4" />Kembali ke Daftar
          </Button>
        </Link>
      </div>
    );
  }

  const status = getStatusColor(project.status);
  const health = getHealthScore(project.progress, project.hppPlan, project.hppActual);
  const hppVariance = project.progress > 0 && project.hppPlan > 0
    ? ((project.hppActual - (project.progress / 100) * project.hppPlan) / ((project.progress / 100) * project.hppPlan)) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link href="/proyek" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />Kembali ke Daftar Proyek
        </Link>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="project-ticket text-xs">{project.id}</span>
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider", status.text)}>
                <span className={cn("status-dot mr-1.5 w-1.5 h-1.5", status.dot)} />{status.label}
              </Badge>
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.address}</span>
              <span>{project.client}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatTanggalShort(project.startDate)} — {formatTanggalShort(project.endDate)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Export Buttons */}
            <div className="flex gap-1.5">
              <ReportGenerator data={{ project, progressUpdates, workItems }} />
              <ExportExcel
                data={workItems.filter((w: any) => w.parentId).map((w: any) => ({
                  "Uraian": w.name,
                  "Satuan": w.unit || "-",
                  "Volume": parseFloat(w.volume || "0"),
                  "Harga Satuan": w.unitPrice,
                  "Jumlah": parseFloat(w.volume || "0") * (w.unitPrice || 0),
                  "Progress %": w.currentProgress,
                }))}
                filename={`RAB_${project.id}`}
                sheetName="RAB"
                label="Export RAB"
              />
            </div>
            <div className="text-right">
              <span className="label-architectural block mb-1">Kesehatan Proyek</span>
              <span className="text-xs" style={{ color: health.color }}>{health.label}</span>
            </div>
            <div className="w-14 h-14 rounded-full border-[3px] flex items-center justify-center" style={{ borderColor: health.color }}>
              <span className="metric-display text-xl font-bold font-heading tabular-nums" style={{ color: health.color }}>{health.score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto gap-0 w-full justify-start overflow-x-auto">
          {projectTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className={cn(
                "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                "rounded-none border-b-2 border-transparent px-4 py-2.5",
                "data-[state=active]:border-safety data-[state=active]:text-foreground",
                "text-muted-foreground hover:text-foreground text-xs uppercase tracking-wider font-semibold",
                "transition-colors duration-150 gap-1.5"
              )}>
                <Icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ── RINGKASAN TAB ── */}
        <TabsContent value="ringkasan" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricMini label="Progress" value={`${project.progress}%`} icon={TrendingUp} />
                <MetricMini label="Nilai Kontrak" value={formatRupiah(project.contractValue)} icon={Wallet} mono />
                <MetricMini label="HPP Aktual" value={formatRupiah(project.hppActual)} icon={BarChart3} mono alert={hppVariance > 5} />
                <MetricMini label="Tukang" value={String(project.workersCount || 0)} icon={Users} />
              </div>
              <Card className="card-architectural overflow-hidden">
                <CardHeader className="pb-2"><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-safety" /><CardTitle className="text-sm font-semibold uppercase tracking-wider">Lokasi Proyek</CardTitle></div></CardHeader>
                <CardContent className="p-0"><div className="h-[250px]"><MapDashboard projects={[project]} interactive={false} /></div></CardContent>
              </Card>
              <Card className="card-architectural">
                <CardHeader className="pb-2"><div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-safety" /><CardTitle className="text-sm font-semibold uppercase tracking-wider">HPP Rencana vs Aktual</CardTitle></div></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1"><span className="label-architectural">HPP Rencana</span><span className="text-sm font-mono tabular-nums font-medium">{formatRupiah(project.hppPlan)}</span></div>
                      <div className="h-6 bg-muted rounded-sm overflow-hidden relative">
                        <div className="h-full bg-primary/20 border-r-2 border-primary/50" style={{ width: `${(project.hppPlan / project.contractValue) * 100}%` }} />
                        <span className="absolute inset-0 flex items-center px-2 text-[10px] font-mono text-muted-foreground">{((project.hppPlan / project.contractValue) * 100).toFixed(0)}% dari kontrak</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1"><span className="label-architectural">HPP Aktual</span><span className={cn("text-sm font-mono tabular-nums font-medium", hppVariance > 5 ? "text-critical" : hppVariance > 0 ? "text-warning" : "text-success")}>{formatRupiah(project.hppActual)}</span></div>
                      <div className="h-6 bg-muted rounded-sm overflow-hidden relative">
                        <div className="h-full rounded-sm" style={{ width: `${(project.hppActual / project.contractValue) * 100}%`, background: hppVariance > 5 ? "var(--critical)" : hppVariance > 0 ? "var(--warning)" : "var(--success)", opacity: 0.3 }} />
                        <span className="absolute inset-0 flex items-center px-2 text-[10px] font-mono text-muted-foreground">{((project.hppActual / project.contractValue) * 100).toFixed(0)}% dari kontrak</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="label-architectural">Variance</span>
                      <span className={cn("text-sm font-mono tabular-nums font-semibold flex items-center gap-1", hppVariance > 5 ? "text-critical" : hppVariance > 0 ? "text-warning" : "text-success")}>
                        {hppVariance > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {hppVariance > 0 ? "+" : ""}{hppVariance.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Card className="card-architectural">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold uppercase tracking-wider">Informasi Proyek</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <InfoRow label="Klien" value={project.client} />
                    <InfoRow label="Alamat" value={project.address} />
                    <InfoRow label="PIC" value={project.pic || "—"} />
                    <InfoRow label="Jenis" value={project.type || "—"} />
                    <InfoRow label="Mulai" value={formatTanggal(project.startDate)} />
                    <InfoRow label="Selesai" value={formatTanggal(project.endDate)} />
                    <InfoRow label="Update" value={project.lastUpdate ? formatTanggal(project.lastUpdate) : "—"} />
                  </div>
                </CardContent>
              </Card>
              <Card className="card-architectural">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold uppercase tracking-wider">Update Terbaru</CardTitle></CardHeader>
                <CardContent>
                  {progressUpdates.length > 0 ? (
                    <div className="space-y-3">
                      {progressUpdates.map((update: any) => (
                        <div key={update.id} className="text-sm border-l-2 border-safety pl-3">
                          <div className="flex items-center gap-2 mb-0.5">
                            <WeatherIcon weather={update.weather} />
                            <span className="text-xs text-muted-foreground">{formatTanggalShort(update.date)}</span>
                          </div>
                          <p className="font-medium text-sm">{update.itemPekerjaan}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="progress-blueprint w-12 rounded-sm"><div className="progress-blueprint-fill rounded-sm" style={{ width: `${update.progress}%` }} /></div>
                            <span className="text-xs font-mono tabular-nums">{update.progress}%</span>
                          </div>
                          {update.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{update.notes}</p>}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">Belum ada update progress</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── PETA TAB ── */}
        <TabsContent value="peta" className="mt-6">
          <Card className="card-architectural overflow-hidden">
            <CardContent className="p-0"><div className="h-[600px]"><MapDashboard projects={[project]} /></div></CardContent>
          </Card>
        </TabsContent>

        {/* ── PROGRESS TAB ── */}
        <TabsContent value="progress" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Card className="card-architectural">
                <CardHeader className="pb-2"><div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-safety" /><CardTitle className="text-sm font-semibold uppercase tracking-wider">S-Curve Progress</CardTitle></div><p className="text-xs text-muted-foreground">Perbandingan rencana vs realisasi kumulatif</p></CardHeader>
                <CardContent><SCurveChart data={generateSCurveData()} height={300} /></CardContent>
              </Card>
              <Card className="card-architectural">
                <CardHeader className="pb-2"><div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-safety" /><CardTitle className="text-sm font-semibold uppercase tracking-wider">Jadwal Pekerjaan (Gantt)</CardTitle></div></CardHeader>
                <CardContent>{(() => { const g = generateGanttData(); return <GanttChart items={g.items} totalWeeks={g.totalWeeks} currentWeek={g.currentWeek} startDate={new Date(2026, 0, 15)} />; })()}</CardContent>
              </Card>
              <Card className="card-architectural">
                <CardHeader className="pb-2"><div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-safety" /><CardTitle className="text-sm font-semibold uppercase tracking-wider">Aktivitas Harian</CardTitle></div></CardHeader>
                <CardContent><ProgressHeatmap data={generateHeatmapData()} /></CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <ProgressForm projectId={project._dbId || project.id} projectName={project.name} />
            </div>
          </div>
        </TabsContent>

        {/* ── RAB TAB ── */}
        <TabsContent value="rab" className="mt-6">
          {workItems.length > 0 ? (
            <RABEditor
              workItems={workItems}
              contractValue={project.contractValue}
              projectName={project.name}
            />
          ) : (
            <Card className="card-architectural">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <FileText className="w-12 h-12 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">Belum ada item RAB</p>
                <p className="text-xs text-muted-foreground/60">Tambahkan item pekerjaan untuk memulai</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── HPP TAB ── */}
        <TabsContent value="hpp" className="mt-6">
          <HPPModule
            contractValue={project.contractValue}
            expenses={expenses}
            payments={payments}
            workItems={workItems}
            projectName={project.name}
          />
        </TabsContent>

        {/* Placeholder Tabs */}
        {["material", "tukang", "keuangan"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            <Card className="card-architectural">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <svg className="w-16 h-16 text-muted-foreground/20 mb-4" fill="none" viewBox="0 0 64 64" stroke="currentColor" strokeWidth={1}>
                  <rect x="4" y="4" width="56" height="56" rx="2" /><line x1="4" y1="20" x2="60" y2="20" /><line x1="20" y1="4" x2="20" y2="60" />
                  <line x1="40" y1="4" x2="40" y2="60" /><line x1="4" y1="36" x2="60" y2="36" /><line x1="4" y1="52" x2="60" y2="52" />
                </svg>
                <p className="text-sm text-muted-foreground mb-1">Modul {tab.charAt(0).toUpperCase() + tab.slice(1)}</p>
                <p className="text-xs text-muted-foreground/60">Akan tersedia di fase berikutnya</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function MetricMini({ label, value, icon: Icon, mono, alert }: { label: string; value: string; icon: React.ElementType; mono?: boolean; alert?: boolean }) {
  return (
    <div className="p-3 rounded border border-border bg-card">
      <div className="flex items-center gap-1.5 mb-1"><Icon className="w-3.5 h-3.5 text-muted-foreground" /><span className="label-architectural">{label}</span></div>
      <p className={cn("text-sm font-semibold truncate", mono && "font-mono tabular-nums", alert && "text-critical")}>{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="label-architectural shrink-0">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}
