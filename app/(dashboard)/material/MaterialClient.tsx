"use client";

import React, { useState } from "react";
import {
  Package, Search, Plus, AlertTriangle, ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Material {
  id: string;
  code: string;
  name: string;
  unit: string;
  category: string;
  defaultPrice: number;
  minStock: number;
  stock: number;
}

export default function MaterialClient({ materials }: { materials: Material[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "stock">("name");

  const filtered = materials
    .filter((m) =>
      searchQuery === "" ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === "stock" ? a.stock - b.stock : a.name.localeCompare(b.name)
    );

  const lowStockCount = materials.filter((m) => m.stock < m.minStock).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Master Material</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {materials.length} material terdaftar
            {lowStockCount > 0 && (
              <span className="text-critical ml-2">· {lowStockCount} stok rendah</span>
            )}
          </p>
        </div>
        <Button className="gap-2 bg-safety text-safety-foreground hover:bg-safety/90 rounded font-semibold text-xs uppercase tracking-wider">
          <Plus className="w-4 h-4" />Tambah Material
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Cari material..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-card border border-border rounded text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-safety focus:ring-1 focus:ring-safety/30 transition-colors"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setSortBy(sortBy === "name" ? "stock" : "name")}>
          <ArrowUpDown className="w-3 h-3" />{sortBy === "name" ? "Nama" : "Stok"}
        </Button>
      </div>

      <Card className="card-architectural">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 label-architectural">Kode</th>
                  <th className="text-left p-3 label-architectural">Nama Material</th>
                  <th className="text-left p-3 label-architectural">Kategori</th>
                  <th className="text-left p-3 label-architectural">Satuan</th>
                  <th className="text-right p-3 label-architectural">Harga</th>
                  <th className="text-right p-3 label-architectural">Stok</th>
                  <th className="text-right p-3 label-architectural">Min</th>
                  <th className="text-center p-3 label-architectural">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const isLow = m.stock < m.minStock;
                  return (
                    <tr key={m.id} className={cn("border-b border-border/50 hover:bg-muted/30 transition-colors", isLow && "bg-critical/3")}>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{m.code}</td>
                      <td className="p-3 font-medium">{m.name}</td>
                      <td className="p-3"><Badge variant="outline" className="text-[10px] font-normal">{m.category}</Badge></td>
                      <td className="p-3 text-muted-foreground">{m.unit}</td>
                      <td className="p-3 text-right font-mono tabular-nums">{formatRupiah(m.defaultPrice)}</td>
                      <td className={cn("p-3 text-right font-mono tabular-nums font-semibold", isLow ? "text-critical" : "text-foreground")}>{m.stock}</td>
                      <td className="p-3 text-right font-mono tabular-nums text-muted-foreground">{m.minStock}</td>
                      <td className="p-3 text-center">
                        {isLow ? (
                          <Badge variant="outline" className="text-[10px] text-critical border-critical/30 gap-1">
                            <AlertTriangle className="w-3 h-3" />Low
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-success border-success/30">OK</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
