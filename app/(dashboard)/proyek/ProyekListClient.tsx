"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  LayoutGrid,
  LayoutList,
  Plus,
  MapPin,
  Users,
  Calendar,
  ArrowUpDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatRupiah,
  formatTanggalShort,
  getStatusColor,
  getHealthScore,
} from "@/lib/data/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectData {
  id: string;
  name: string;
  client: string;
  address: string;
  contractValue: number;
  status: string;
  progress: number;
  hppPlan: number;
  hppActual: number;
  workersCount: number;
  endDate: string;
}

export default function ProyekListClient({
  projects,
}: {
  projects: ProjectData[];
}) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");

  const filteredProjects = projects
    .filter((p) => {
      const matchStatus =
        filterStatus === "semua" || p.status === filterStatus;
      const matchSearch =
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "progress":
          return b.progress - a.progress;
        case "value":
          return b.contractValue - a.contractValue;
        case "date":
          return (
            new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
          );
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Daftar Proyek
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects.length} proyek terdaftar ·{" "}
            {projects.filter((p) => p.status === "berjalan").length} aktif
          </p>
        </div>
        <Link href="/proyek/baru">
          <Button className="gap-2 bg-safety text-safety-foreground hover:bg-safety/90 rounded font-semibold text-xs uppercase tracking-wider">
            <Plus className="w-4 h-4" />
            Proyek Baru
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari proyek, klien, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-card border border-border rounded text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-safety focus:ring-1 focus:ring-safety/30 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 w-[140px] text-xs">
              <Filter className="w-3 h-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Status</SelectItem>
              <SelectItem value="berjalan">Berjalan</SelectItem>
              <SelectItem value="perencanaan">Perencanaan</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
              <SelectItem value="pemeliharaan">Pemeliharaan</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <ArrowUpDown className="w-3 h-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nama A-Z</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="value">Nilai Kontrak</SelectItem>
              <SelectItem value="date">Tanggal Selesai</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center bg-muted rounded p-0.5 gap-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === "list"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">
            Tidak ada proyek ditemukan
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProjects.map((project, index) => (
            <ProjectRow key={project.id} project={project} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: ProjectData;
  index: number;
}) {
  const status = getStatusColor(project.status);
  const health = getHealthScore(
    project.progress,
    project.hppPlan,
    project.hppActual
  );

  return (
    <Link
      href={`/proyek/${project.id}`}
      className="animate-count-up block"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Card className="card-architectural group hover:border-safety/40 transition-all duration-200 h-full">
        <CardContent className="p-0">
          <div className="p-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="project-ticket text-[11px]">{project.id}</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider border",
                  status.text
                )}
              >
                <span
                  className={cn("status-dot mr-1.5 w-1.5 h-1.5", status.dot)}
                />
                {status.label}
              </Badge>
            </div>
            <h3 className="font-heading font-semibold text-base leading-tight group-hover:text-safety transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{project.address}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {project.client}
            </p>
          </div>
          <div className="px-4 pb-3">
            <div className="flex items-end justify-between mb-1.5">
              <span className="metric-display text-3xl font-bold font-heading tabular-nums">
                {project.progress}
                <span className="text-base text-muted-foreground font-normal">
                  %
                </span>
              </span>
              <div
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: health.color }}
              >
                <span
                  className="text-[10px] font-mono font-bold tabular-nums"
                  style={{ color: health.color }}
                >
                  {health.score}
                </span>
              </div>
            </div>
            <div className="progress-blueprint rounded-sm">
              <div
                className="progress-blueprint-fill rounded-sm"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {project.workersCount}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatTanggalShort(project.endDate)}
              </span>
            </div>
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {formatRupiah(project.contractValue)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ProjectRow({
  project,
  index,
}: {
  project: ProjectData;
  index: number;
}) {
  const status = getStatusColor(project.status);
  const health = getHealthScore(
    project.progress,
    project.hppPlan,
    project.hppActual
  );

  return (
    <Link
      href={`/proyek/${project.id}`}
      className="animate-count-up block"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-4 p-3 rounded border border-transparent hover:border-border hover:bg-card transition-all duration-150 group">
        <span className={cn("status-dot shrink-0", status.dot)} />
        <span className="project-ticket w-16 shrink-0">{project.id}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate group-hover:text-safety transition-colors">
            {project.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {project.client}
          </p>
        </div>
        <div className="flex items-center gap-2 w-32 shrink-0">
          <div className="progress-blueprint flex-1 rounded-sm">
            <div
              className="progress-blueprint-fill rounded-sm"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-xs font-mono font-medium tabular-nums w-8 text-right">
            {project.progress}%
          </span>
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1 w-10 shrink-0">
          <Users className="w-3 h-3" />
          {project.workersCount}
        </span>
        <span className="text-xs font-mono font-semibold tabular-nums text-right w-28 shrink-0">
          {formatRupiah(project.contractValue)}
        </span>
        <div
          className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0"
          style={{ borderColor: health.color }}
        >
          <span
            className="text-[8px] font-mono font-bold tabular-nums"
            style={{ color: health.color }}
          >
            {health.score}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-safety transition-colors shrink-0" />
      </div>
    </Link>
  );
}
