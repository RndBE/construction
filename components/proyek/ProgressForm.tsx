"use client";

import React, { useState } from "react";
import {
  Camera,
  MapPin,
  CloudSun,
  Cloud,
  CloudRain,
  Send,
  Plus,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveProgressLog } from "@/lib/db/actions";
import PhotoUpload from "@/components/proyek/PhotoUpload";

interface ProgressFormProps {
  projectId: string;
  projectName: string;
  workItems?: { id: string; name: string; currentProgress: number }[];
  onSubmit?: (data: ProgressFormData) => void;
}

interface ProgressFormData {
  workItemId: string;
  progress: number;
  weather: "cerah" | "mendung" | "hujan";
  notes: string;
  photos: File[];
}

const weatherOptions = [
  { value: "cerah" as const, icon: CloudSun, label: "Cerah", color: "text-warning" },
  { value: "mendung" as const, icon: Cloud, label: "Mendung", color: "text-muted-foreground" },
  { value: "hujan" as const, icon: CloudRain, label: "Hujan", color: "text-blue-500" },
];

// Mock work items
const defaultWorkItems = [
  { id: "wi-1", name: "Kolom Beton K-225", currentProgress: 85 },
  { id: "wi-2", name: "Balok Beton K-225", currentProgress: 55 },
  { id: "wi-3", name: "Plat Lantai t=12cm", currentProgress: 45 },
  { id: "wi-4", name: "Pasangan Dinding Bata", currentProgress: 40 },
  { id: "wi-5", name: "Plester + Aci + Cat", currentProgress: 5 },
];

export default function ProgressForm({
  projectId,
  projectName,
  workItems = defaultWorkItems,
  onSubmit,
}: ProgressFormProps) {
  const [selectedItem, setSelectedItem] = useState(workItems[0]?.id || "");
  const [progress, setProgress] = useState(workItems[0]?.currentProgress || 0);
  const [weather, setWeather] = useState<"cerah" | "mendung" | "hujan">("cerah");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedWorkItem = workItems.find((w) => w.id === selectedItem);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await saveProgressLog({
        workItemId: selectedItem,
        projectId: projectId,
        progress,
        weather,
        notes,
      });
    } catch (e) {
      console.error("Failed to save progress:", e);
    }

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset after 2s
    setTimeout(() => {
      setIsSubmitted(false);
      setNotes("");
    }, 2000);
  };

  return (
    <Card className="card-architectural">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-safety" />
          <CardTitle className="text-sm font-semibold uppercase tracking-wider">
            Input Progress Harian
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {projectName} · {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Work Item Selection */}
        <div>
          <label className="label-architectural block mb-2">Item Pekerjaan</label>
          <div className="space-y-1">
            {workItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItem(item.id);
                  setProgress(item.currentProgress);
                }}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded border text-left transition-colors text-sm",
                  selectedItem === item.id
                    ? "border-safety/50 bg-safety/5"
                    : "border-transparent hover:bg-muted/50"
                )}
              >
                <span
                  className={cn(
                    "truncate",
                    selectedItem === item.id
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </span>
                <span className="text-xs font-mono tabular-nums text-muted-foreground shrink-0 ml-2">
                  {item.currentProgress}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Progress Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label-architectural">Progress (%)</label>
            <span className="metric-display text-2xl font-bold font-heading tabular-nums">
              {progress}
              <span className="text-sm font-normal text-muted-foreground">%</span>
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min={selectedWorkItem?.currentProgress || 0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-sm appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-sm
                [&::-webkit-slider-thumb]:bg-safety
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-safety-foreground/20
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-md
              "
              style={{
                background: `linear-gradient(to right, var(--safety) 0%, var(--safety) ${progress}%, var(--muted) ${progress}%, var(--muted) 100%)`,
              }}
            />
            {/* Tick marks */}
            <div className="flex justify-between mt-1 px-0.5">
              {[0, 25, 50, 75, 100].map((tick) => (
                <span
                  key={tick}
                  className="text-[9px] font-mono text-muted-foreground/50"
                >
                  {tick}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Weather */}
        <div>
          <label className="label-architectural block mb-2">Cuaca</label>
          <div className="flex gap-2">
            {weatherOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setWeather(opt.value)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 p-2.5 rounded border transition-colors",
                    weather === opt.value
                      ? "border-safety/50 bg-safety/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("w-5 h-5", opt.color)} />
                  <span className="text-[10px] uppercase tracking-wider font-medium">
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label-architectural block mb-2">Catatan</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan progress hari ini..."
            rows={3}
            className="w-full p-3 bg-transparent border-b-2 border-border rounded-none text-sm resize-none placeholder:text-muted-foreground/50 focus:outline-none focus:border-safety transition-colors"
          />
        </div>

        {/* Photo Capture */}
        <PhotoUpload projectId={projectId} />

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || isSubmitted}
          className={cn(
            "w-full gap-2 rounded font-semibold text-xs uppercase tracking-wider h-11 transition-all",
            isSubmitted
              ? "bg-success text-white"
              : "bg-safety text-safety-foreground hover:bg-safety/90"
          )}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-safety-foreground border-t-transparent rounded-full animate-spin" />
          ) : isSubmitted ? (
            <>
              <Check className="w-4 h-4" />
              Progress Tersimpan
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Simpan Progress
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
