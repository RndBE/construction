"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/data/mock";
import { formatRupiah, getStatusColor } from "@/lib/data/mock";

// We'll use a lightweight approach with MapLibre directly
// This avoids SSR issues with react-map-gl

interface MapDashboardProps {
  projects: Project[];
  height?: string;
  interactive?: boolean;
}

export default function MapDashboard({
  projects,
  height = "100%",
  interactive = true,
}: MapDashboardProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initMap = useCallback(async () => {
    if (!mapContainerRef.current) return;

    try {
      const maplibregl = (await import("maplibre-gl")).default;
      await import("maplibre-gl/dist/maplibre-gl.css");

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          name: "Blueprint",
          sources: {
            osm: {
              type: "raster",
              tiles: [
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: "osm-tiles",
              type: "raster",
              source: "osm",
              minzoom: 0,
              maxzoom: 19,
              paint: {
                "raster-saturation": -0.6,
                "raster-brightness-min": 0.1,
                "raster-contrast": 0.1,
                "raster-opacity": 0.75,
              },
            },
          ],
        },
        center: [110.38, -7.77], // Yogyakarta center
        zoom: 10.5,
        attributionControl: false,
        interactive,
      });

      if (interactive) {
        map.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "top-right"
        );
      }

      map.on("load", () => {
        setMapLoaded(true);

        // Add project markers
        projects.forEach((project) => {
          const status = getStatusColor(project.status);

          // Create custom marker element
          const el = document.createElement("div");
          el.className = "project-marker";
          el.innerHTML = `
            <div class="marker-pin" style="
              width: ${getMarkerSize(project.contractValue)}px;
              height: ${getMarkerSize(project.contractValue)}px;
              background: ${getMarkerColor(project.status)};
              border: 2px solid ${getMarkerBorderColor(project.status)};
              border-radius: 2px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              position: relative;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              transition: transform 0.15s ease;
              transform-origin: center bottom;
            ">
              <span style="
                color: white;
                font-size: 8px;
                font-weight: 700;
                font-family: monospace;
                letter-spacing: 0.5px;
                text-shadow: 0 1px 2px rgba(0,0,0,0.3);
              ">${project.id.replace("PRJ-", "")}</span>
              ${project.status === "berjalan" ? `
                <div style="
                  position: absolute;
                  bottom: -6px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 0;
                  height: 0;
                  border-left: 4px solid transparent;
                  border-right: 4px solid transparent;
                  border-top: 6px solid ${getMarkerColor(project.status)};
                "></div>
              ` : ""}
            </div>
          `;

          // Hover effect
          el.addEventListener("mouseenter", () => {
            el.querySelector<HTMLElement>(".marker-pin")!.style.transform =
              "scale(1.15)";
          });
          el.addEventListener("mouseleave", () => {
            el.querySelector<HTMLElement>(".marker-pin")!.style.transform =
              "scale(1)";
          });

          // Create popup
          const popup = new maplibregl.Popup({
            offset: 12,
            closeButton: false,
            maxWidth: "280px",
          }).setHTML(`
            <div style="
              padding: 12px;
              font-family: 'IBM Plex Sans', system-ui, sans-serif;
            ">
              <div style="
                font-family: monospace;
                font-size: 10px;
                color: #5C6A7A;
                letter-spacing: 0.05em;
                text-transform: uppercase;
                margin-bottom: 4px;
              ">${project.id} · ${status.label}</div>
              <div style="
                font-weight: 600;
                font-size: 14px;
                color: #0E1B2C;
                margin-bottom: 8px;
                line-height: 1.3;
              ">${project.name}</div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 11px; color: #5C6A7A;">${project.client}</span>
                <span style="
                  font-family: monospace;
                  font-size: 12px;
                  font-weight: 600;
                  color: #0E1B2C;
                ">${project.progress}%</span>
              </div>
              <div style="
                height: 3px;
                background: #DDD6C5;
                border-radius: 1px;
                overflow: hidden;
                margin-bottom: 8px;
              ">
                <div style="
                  height: 100%;
                  width: ${project.progress}%;
                  background: #F5C518;
                  border-radius: 1px;
                  transition: width 0.3s;
                "></div>
              </div>
              <div style="
                font-family: monospace;
                font-size: 11px;
                color: #0E1B2C;
                font-weight: 500;
              ">${formatRupiah(project.contractValue)}</div>
            </div>
          `);

          new maplibregl.Marker({ element: el })
            .setLngLat([project.longitude, project.latitude])
            .setPopup(popup)
            .addTo(map);
        });
      });

      mapRef.current = map;
    } catch (err) {
      console.error("Map init error:", err);
      setError("Gagal memuat peta. Coba refresh halaman.");
    }

    return () => {
      mapRef.current?.remove();
    };
  }, [projects, interactive]);

  useEffect(() => {
    initMap();
    return () => {
      mapRef.current?.remove();
    };
  }, [initMap]);

  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={mapContainerRef} className="absolute inset-0 rounded-b" />

      {/* Loading state */}
      {!mapLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-safety border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Memuat peta...
            </span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {/* Legend */}
      {mapLoaded && (
        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm border border-border rounded p-3 text-xs space-y-1.5">
          <p className="label-architectural text-[9px] mb-1">Status Proyek</p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#2D6A4F" }} />
            <span className="text-muted-foreground">Berjalan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#3B82F6" }} />
            <span className="text-muted-foreground">Perencanaan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#5C6A7A" }} />
            <span className="text-muted-foreground">Selesai</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ───
function getMarkerSize(contractValue: number): number {
  if (contractValue >= 5_000_000_000) return 32;
  if (contractValue >= 2_000_000_000) return 28;
  if (contractValue >= 1_000_000_000) return 24;
  return 20;
}

function getMarkerColor(status: Project["status"]): string {
  switch (status) {
    case "berjalan":
      return "#2D6A4F";
    case "perencanaan":
      return "#3B82F6";
    case "selesai":
      return "#5C6A7A";
    case "pemeliharaan":
      return "#E9A820";
    case "arsip":
      return "#8A96A8";
    default:
      return "#5C6A7A";
  }
}

function getMarkerBorderColor(status: Project["status"]): string {
  switch (status) {
    case "berjalan":
      return "#1B4332";
    case "perencanaan":
      return "#2563EB";
    case "selesai":
      return "#374151";
    case "pemeliharaan":
      return "#B8860B";
    case "arsip":
      return "#6B7280";
    default:
      return "#374151";
  }
}
