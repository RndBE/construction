"use client";

import React, { useState } from "react";
import { Users, Search, Plus, Phone, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/data/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Worker {
  id: string;
  code: string;
  name: string;
  skill: string;
  dailyRate: number;
  phone: string;
  isActive: boolean;
}

const skillColors: Record<string, string> = {
  batu: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  kayu: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  besi: "bg-slate-500/10 text-slate-700 border-slate-500/20",
  las: "bg-red-500/10 text-red-700 border-red-500/20",
  finishing: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  listrik: "bg-yellow-400/10 text-yellow-600 border-yellow-400/20",
  pipa: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
};

export default function TukangClient({ workers }: { workers: Worker[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSkill, setFilterSkill] = useState<string>("semua");

  const filtered = workers
    .filter((w) => {
      const matchSkill = filterSkill === "semua" || w.skill === filterSkill;
      const matchSearch = searchQuery === "" || w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSkill && matchSearch;
    });

  const skills = [...new Set(workers.map((w) => w.skill))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Master Tukang</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {workers.length} tukang terdaftar · {workers.filter((w) => w.isActive).length} aktif
          </p>
        </div>
        <Button className="gap-2 bg-safety text-safety-foreground hover:bg-safety/90 rounded font-semibold text-xs uppercase tracking-wider">
          <Plus className="w-4 h-4" />Tambah Tukang
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Cari tukang..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-card border border-border rounded text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-safety focus:ring-1 focus:ring-safety/30 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setFilterSkill("semua")} className={cn("px-2.5 py-1 rounded text-xs transition-colors", filterSkill === "semua" ? "bg-safety/10 text-safety font-medium" : "text-muted-foreground hover:text-foreground")}>Semua</button>
          {skills.map((skill) => (
            <button key={skill} onClick={() => setFilterSkill(skill)} className={cn("px-2.5 py-1 rounded text-xs capitalize transition-colors", filterSkill === skill ? "bg-safety/10 text-safety font-medium" : "text-muted-foreground hover:text-foreground")}>{skill}</button>
          ))}
        </div>
      </div>

      <Card className="card-architectural">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 label-architectural">Kode</th>
                  <th className="text-left p-3 label-architectural">Nama</th>
                  <th className="text-left p-3 label-architectural">Keahlian</th>
                  <th className="text-right p-3 label-architectural">Upah/Hari</th>
                  <th className="text-left p-3 label-architectural">Telepon</th>
                  <th className="text-center p-3 label-architectural">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <tr key={w.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs text-muted-foreground">{w.code}</td>
                    <td className="p-3 font-medium">{w.name}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider capitalize", skillColors[w.skill] || "")}>
                        {w.skill}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-mono tabular-nums">{formatRupiah(w.dailyRate)}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-1 text-muted-foreground"><Phone className="w-3 h-3" />{w.phone}</span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className={cn("text-[10px]", w.isActive ? "text-success border-success/30" : "text-muted-foreground border-border")}>
                        {w.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
