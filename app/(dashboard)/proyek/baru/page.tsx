"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProyekBaruPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <Link
        href="/proyek"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Daftar Proyek
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Proyek Baru
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Isi informasi proyek dan tandai lokasi di peta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="card-architectural">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              Informasi Proyek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5">
              <div>
                <label className="label-architectural block mb-1.5">
                  Nama Proyek
                </label>
                <input
                  type="text"
                  className="input-architectural w-full"
                  placeholder="Contoh: Koperasi Sleman Unit III"
                />
              </div>
              <div>
                <label className="label-architectural block mb-1.5">
                  Klien
                </label>
                <input
                  type="text"
                  className="input-architectural w-full"
                  placeholder="Nama klien / instansi"
                />
              </div>
              <div>
                <label className="label-architectural block mb-1.5">
                  Alamat / Lokasi
                </label>
                <input
                  type="text"
                  className="input-architectural w-full"
                  placeholder="Jl. Contoh No. 123, Kota"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-architectural block mb-1.5">
                    Tanggal Mulai
                  </label>
                  <input type="date" className="input-architectural w-full" />
                </div>
                <div>
                  <label className="label-architectural block mb-1.5">
                    Tanggal Selesai
                  </label>
                  <input type="date" className="input-architectural w-full" />
                </div>
              </div>
              <div>
                <label className="label-architectural block mb-1.5">
                  Nilai Kontrak (Rp)
                </label>
                <input
                  type="text"
                  className="input-architectural w-full font-mono tabular-nums"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="label-architectural block mb-1.5">
                  Jenis Bangunan
                </label>
                <input
                  type="text"
                  className="input-architectural w-full"
                  placeholder="Gedung / Perumahan / Infrastruktur / dll"
                />
              </div>
              <div>
                <label className="label-architectural block mb-1.5">
                  PIC / Project Manager
                </label>
                <input
                  type="text"
                  className="input-architectural w-full"
                  placeholder="Nama penanggung jawab"
                />
              </div>

              <Button className="w-full gap-2 bg-safety text-safety-foreground hover:bg-safety/90 rounded font-semibold text-xs uppercase tracking-wider mt-4">
                <Save className="w-4 h-4" />
                Simpan Proyek
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Map Pin Location */}
        <Card className="card-architectural overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-safety" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                Tandai Lokasi di Peta
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] lg:h-[540px] bg-muted flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Klik pada peta untuk menandai lokasi proyek
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Fitur peta interaktif akan tersedia setelah koneksi database
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
