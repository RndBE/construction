"use client";

import React, { useState, useRef } from "react";
import { Camera, X, MapPin, Loader2, Check, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  projectId: string;
  onUpload?: (urls: string[]) => void;
  maxFiles?: number;
}

interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  status: "uploading" | "done" | "error";
}

export default function PhotoUpload({
  projectId,
  onUpload,
  maxFiles = 5,
}: PhotoUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList) => {
    const newFiles = Array.from(fileList).slice(0, maxFiles - files.length);
    if (newFiles.length === 0) return;

    for (const file of newFiles) {
      const placeholder: UploadedFile = {
        url: URL.createObjectURL(file),
        filename: file.name,
        size: file.size,
        status: "uploading",
      };
      setFiles((prev) => [...prev, placeholder]);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", projectId);

        const res = await fetch("/api/upload", { method: "POST", body: formData });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        setFiles((prev) =>
          prev.map((f) =>
            f.filename === file.name
              ? { ...f, url: data.url, status: "done" as const }
              : f
          )
        );
        onUpload?.(files.filter((f) => f.status === "done").map((f) => f.url).concat(data.url));
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.filename === file.name ? { ...f, status: "error" as const } : f
          )
        );
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="label-architectural block mb-2">Foto Progress</label>

      {/* Upload Area */}
      <div
        className={cn(
          "w-full border-2 border-dashed rounded transition-colors cursor-pointer",
          isDragging
            ? "border-safety bg-safety/5"
            : "border-border hover:border-safety/50 hover:bg-safety/3",
          files.length >= maxFiles && "opacity-50 pointer-events-none"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center gap-1.5 py-4">
          <Camera className="w-5 h-5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {files.length >= maxFiles ? "Maksimum tercapai" : "Ambil Foto atau Upload"}
          </span>
          <span className="text-[9px] text-muted-foreground/50">
            Max {maxFiles} foto · JPEG, PNG, WebP · Max 10MB
          </span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {files.map((file, i) => (
            <div key={i} className="relative group rounded overflow-hidden border border-border aspect-square bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={file.url}
                alt={file.filename}
                className="w-full h-full object-cover"
              />
              {/* Status overlay */}
              {file.status === "uploading" && (
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-safety animate-spin" />
                </div>
              )}
              {file.status === "done" && (
                <div className="absolute top-1 left-1">
                  <span className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </span>
                </div>
              )}
              {file.status === "error" && (
                <div className="absolute inset-0 bg-critical/20 flex items-center justify-center">
                  <span className="text-[9px] text-critical font-semibold uppercase">Gagal</span>
                </div>
              )}
              {/* Remove button */}
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-critical/20"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60 mt-1.5 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        GPS akan otomatis tercatat saat foto diambil
      </p>
    </div>
  );
}
