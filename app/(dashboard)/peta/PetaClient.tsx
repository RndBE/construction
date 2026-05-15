"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Search, Filter, ChevronRight, MapPin, Users, X, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah, getStatusColor } from "@/lib/data/mock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
  client: string;
  address: string;
  latitude: number;
  longitude: number;
  contractValue: number;
  status: string;
  progress: number;
  hppPlan: number;
  hppActual: number;
  workersCount: number;
}

export default function PetaClient({ projects }: { projects: Project[] }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);

  const filteredProjects = projects.filter((p) => {
    const matchStatus = filterStatus === "semua" || p.status === filterStatus;
    const matchSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const initMap = useCallback(async () => {
    if (!mapContainerRef.current) return;

    const maplibregl = (await import("maplibre-gl")).default;
    await import("maplibre-gl/dist/maplibre-gl.css");

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8, name: "Blueprint Full",
        sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap" } },
        layers: [{ id: "osm-tiles", type: "raster", source: "osm", paint: { "raster-saturation": -0.7, "raster-brightness-min": 0.08, "raster-contrast": 0.15, "raster-opacity": 0.7 } }],
      },
      center: [110.38, -7.75], zoom: 10, attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl(), "bottom-right");

    map.on("load", () => {
      setMapLoaded(true);

      projects.forEach((project) => {
        const el = createMarkerElement(project);
        el.addEventListener("click", () => {
          setSelectedProject(project);
          map.flyTo({ center: [project.longitude, project.latitude], zoom: 14, duration: 1200, essential: true });
        });
        new maplibregl.Marker({ element: el }).setLngLat([project.longitude, project.latitude]).addTo(map);
      });
    });

    mapRef.current = map;
  }, [projects]);

  useEffect(() => {
    initMap();
    return () => { mapRef.current?.remove(); };
  }, [initMap]);

  const flyToProject = async (project: Project) => {
    setSelectedProject(project);
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [project.longitude, project.latitude], zoom: 14, duration: 1200, essential: true });
    }
  };

  return (
    <div className="fixed inset-0 md:left-[240px] top-14 z-20 flex">
      {/* Left Panel */}
      <div className={cn("bg-background border-r border-border flex flex-col transition-all duration-300 shrink-0", panelOpen ? "w-[340px]" : "w-0 overflow-hidden")}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-safety" /><h2 className="text-sm font-semibold uppercase tracking-wider">Peta Proyek</h2></div>
            <Badge variant="outline" className="text-[10px] font-mono">{filteredProjects.length} proyek</Badge>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="Cari proyek..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 bg-muted/50 border border-border rounded text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:border-safety focus:ring-1 focus:ring-safety/30" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 text-xs"><Filter className="w-3 h-3 mr-1.5 text-muted-foreground" /><SelectValue placeholder="Filter status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Status</SelectItem>
              <SelectItem value="berjalan">Berjalan</SelectItem>
              <SelectItem value="perencanaan">Perencanaan</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
              <SelectItem value="pemeliharaan">Pemeliharaan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredProjects.map((project) => {
              const status = getStatusColor(project.status);
              const isSelected = selectedProject?.id === project.id;
              return (
                <button key={project.id} onClick={() => flyToProject(project)} className={cn("w-full text-left p-3 rounded transition-all duration-150", isSelected ? "bg-safety/10 border border-safety/30" : "hover:bg-muted/50 border border-transparent")}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("status-dot", status.dot)} />
                    <span className="project-ticket">{project.id}</span>
                    <Badge variant="outline" className={cn("text-[9px] px-1 py-0 h-3.5 uppercase tracking-wider", status.text)}>{status.label}</Badge>
                  </div>
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{project.client}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="progress-blueprint w-12 rounded-sm"><div className="progress-blueprint-fill rounded-sm" style={{ width: `${project.progress}%` }} /></div>
                      <span className="text-[10px] font-mono tabular-nums">{project.progress}%</span>
                    </div>
                    <span className="text-[10px] font-mono tabular-nums text-muted-foreground">{formatRupiah(project.contractValue)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Toggle */}
      <button onClick={() => setPanelOpen(!panelOpen)} className="absolute left-0 top-4 z-10 bg-card border border-border border-l-0 rounded-r px-1 py-3 hover:bg-muted transition-colors" style={{ left: panelOpen ? "340px" : 0 }}>
        <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", panelOpen && "rotate-180")} />
      </button>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-safety border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Memuat peta...</span>
            </div>
          </div>
        )}
        {selectedProject && (
          <div className="absolute top-4 right-14 w-[300px] bg-card border border-border rounded shadow-lg animate-scale-in">
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="project-ticket">{selectedProject.id}</span>
                <button onClick={() => setSelectedProject(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              <h3 className="font-heading font-semibold text-base mb-1">{selectedProject.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{selectedProject.client} · {selectedProject.address}</p>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1"><span className="label-architectural">Progress</span><span className="text-sm font-mono font-semibold tabular-nums">{selectedProject.progress}%</span></div>
                <div className="progress-blueprint rounded-sm"><div className="progress-blueprint-fill rounded-sm" style={{ width: `${selectedProject.progress}%` }} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div><span className="label-architectural block mb-0.5">Nilai Kontrak</span><span className="font-mono font-semibold tabular-nums">{formatRupiah(selectedProject.contractValue)}</span></div>
                <div><span className="label-architectural block mb-0.5">Tukang</span><span className="font-mono font-semibold tabular-nums flex items-center gap-1"><Users className="w-3 h-3" />{selectedProject.workersCount}</span></div>
                <div><span className="label-architectural block mb-0.5">HPP Rencana</span><span className="font-mono tabular-nums">{formatRupiah(selectedProject.hppPlan)}</span></div>
                <div><span className="label-architectural block mb-0.5">HPP Aktual</span><span className="font-mono tabular-nums">{formatRupiah(selectedProject.hppActual)}</span></div>
              </div>
              <Link href={`/proyek/${selectedProject.id}`}>
                <Button className="w-full gap-1.5 bg-primary text-primary-foreground rounded text-xs uppercase tracking-wider font-semibold">Buka Detail<ChevronRight className="w-3.5 h-3.5" /></Button>
              </Link>
            </div>
          </div>
        )}
        {mapLoaded && (
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded p-3 text-xs space-y-1.5">
            <p className="label-architectural text-[9px] mb-1">Legenda</p>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: "#2D6A4F" }} /><span className="text-muted-foreground">Berjalan</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: "#3B82F6" }} /><span className="text-muted-foreground">Perencanaan</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: "#5C6A7A" }} /><span className="text-muted-foreground">Selesai</span></div>
            <div className="mt-2 pt-2 border-t border-border"><p className="text-[9px] text-muted-foreground/70">Ukuran marker = nilai kontrak</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

function createMarkerElement(project: Project): HTMLElement {
  const size = project.contractValue >= 5_000_000_000 ? 32 : project.contractValue >= 2_000_000_000 ? 28 : project.contractValue >= 1_000_000_000 ? 24 : 20;
  const colorMap: Record<string, string> = { berjalan: "#2D6A4F", perencanaan: "#3B82F6", selesai: "#5C6A7A", pemeliharaan: "#E9A820", arsip: "#8A96A8" };
  const color = colorMap[project.status] || "#5C6A7A";
  const el = document.createElement("div");
  el.style.cssText = `width:${size}px;height:${size}px;background:${color};border:2px solid rgba(0,0,0,0.2);border-radius:2px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);transition:transform 0.15s ease;`;
  el.innerHTML = `<span style="color:white;font-size:8px;font-weight:700;font-family:monospace;letter-spacing:0.5px">${project.id.replace("PRJ-", "")}</span>`;
  el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.15)"; });
  el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });
  return el;
}
