# Rancangan Website: Sistem Manajemen Proyek Konstruksi

> Sistem terintegrasi untuk mengelola proyek pembangunan koperasi dan bangunan sipil — pemetaan lokasi, tracking progress lapangan, manajemen material & tenaga kerja, hingga kalkulasi HPP.

---

## 1. Tujuan & Ruang Lingkup

### Tujuan Utama
- Mengelola banyak proyek konstruksi secara paralel (koperasi, gedung, renovasi, dll).
- **Memetakan seluruh lokasi proyek** dalam satu peta interaktif untuk monitoring sebaran & koordinasi.
- **Melacak progress fisik harian** per item pekerjaan dengan dokumentasi foto, S-Curve, dan timeline.
- Mencatat penggunaan material dan biaya tenaga kerja (tukang) secara real-time.
- Menghitung HPP aktual vs HPP rencana per proyek.
- Memberikan visibilitas finansial: cashflow, margin, dan biaya tak terduga.

### Pengguna (Roles)
| Role | Hak Akses |
|---|---|
| **Owner / Direktur** | Full access, laporan finansial, approval anggaran |
| **Project Manager** | CRUD proyek, approval pengeluaran, assign tukang |
| **Mandor / Site Supervisor** | Input progress harian, absensi tukang, request material |
| **Admin Keuangan** | Input invoice supplier, pembayaran upah, rekonsiliasi |
| **Viewer / Klien** | Read-only dashboard progress (opsional) |

---

## 2. Modul Inti

### 2.1 Manajemen Proyek
- Buat proyek baru (nama, lokasi/peta, klien, tanggal mulai-selesai, nilai kontrak).
- Status proyek: `Perencanaan` → `Berjalan` → `Selesai` → `Pemeliharaan` → `Arsip`.
- Upload dokumen: kontrak, gambar kerja (DWG/PDF), IMB, foto lapangan.
- Milestone & timeline (Gantt-style).

### 2.2 Pemetaan Lokasi Proyek (Geospasial)
Modul peta interaktif untuk monitoring seluruh proyek dalam satu pandangan.

**Peta Global (Dashboard Map):**
- Semua proyek aktif & selesai diplot sebagai marker di peta Indonesia.
- Marker custom berdasarkan status: 🟢 berjalan, 🔵 perencanaan, ⚫ selesai, 🔴 critical.
- Marker size berdasarkan nilai kontrak (proyek besar = marker besar).
- Cluster otomatis saat zoom-out (banyak proyek di area sama → grup).
- Click marker → popup ringkas: nama, klien, progress %, HPP variance, foto terbaru.
- Filter peta: by status, by tahun, by klien, by jenis bangunan, by PIC.
- Toggle layer: satellite view, street view, terrain.

**Geofencing Per Proyek:**
- Setiap proyek punya **batas area** (polygon) yang digambar di peta — area site sebenarnya, bukan cuma 1 titik.
- Validasi check-in tukang: hanya bisa absen kalau GPS-nya di dalam geofence (anti-titip absen).
- Foto progress yang di-tag GPS otomatis cek apakah diambil dari dalam site.

**Detail Peta Per Proyek:**
- Mini-map di halaman detail proyek dengan satellite view site.
- Plot titik-titik foto progress di peta site (lihat sebaran dokumentasi).
- Tandai titik-titik penting: pos jaga, gudang material, akses masuk, area parkir, lokasi MCK.
- Overlay siteplan/denah arsitektur di atas peta (georeferenced PDF).

**Use Case Operasional:**
- **Routing material**: hitung jarak dari supplier ke site, estimasi ongkir.
- **Koordinasi mandor**: lihat proyek terdekat untuk realokasi tukang.
- **Laporan ke klien**: share link peta read-only ke klien (lihat lokasi & progress).
- **Analisa cluster regional**: misal "proyek Jogja semua bermasalah cuaca minggu ini".

**Implementasi Teknis:**
- **MapLibre GL JS** (open source, performa baik untuk banyak marker) atau **Mapbox GL** (kalau butuh styling premium).
- Tile provider: **OpenStreetMap** (gratis) atau **MapTiler** untuk visual lebih bagus.
- Data: simpan koordinat sebagai PostGIS geometry di Postgres untuk query spasial (mis. "proyek dalam radius 10km").
- Custom map style: bikin style JSON sendiri yang match dengan aesthetic blueprint (lihat bagian UI/UX).

### 2.3 RAB & Item Pekerjaan
- Struktur hierarkis: **Proyek → Pekerjaan Utama → Sub-pekerjaan → Item**.
  - Contoh: `Koperasi Sleman → Struktur → Beton Kolom Lt.1 → Pengecoran K-225`.
- Setiap item punya: volume, satuan (m³, m², kg, ls), harga satuan, total.
- Analisa Harga Satuan (AHS) — breakdown ke material + upah + alat + overhead.
- Import RAB dari Excel/CSV.

### 2.4 Manajemen Material
- Master data material (semen, besi, pasir, batu bata, dll) dengan satuan & harga referensi.
- Stok per proyek (gudang on-site) + stok pusat (jika ada).
- Pencatatan: pembelian (PO), penerimaan, pemakaian harian, retur.
- Histori harga supplier (penting untuk HPP — harga semen Maret ≠ Juli).
- Alert: stok minimum, material kritis menipis.

### 2.5 Manajemen Tukang & Upah
- Master data tukang: nama, keahlian (tukang batu, kayu, besi, las), tarif harian/borongan, kontak.
- Sistem absensi: check-in/out harian dengan validasi geofence, atau borongan per item pekerjaan.
- Hitung upah otomatis (harian × hari kerja, atau % progress borongan).
- Pembayaran mingguan/bulanan dengan slip upah.

### 2.6 Progress Tracking & Laporan Lapangan
Modul inti operasional — ini "denyut" proyek harian.

**Update progress harian:**
- Mandor input progress per item pekerjaan dalam % atau volume aktual (mis. 12 m³ dari 50 m³).
- Mobile-friendly: form besar, kamera langsung, GPS auto-capture lokasi foto.
- Foto progress (before/after, multi-angle) dengan caption & tagging item pekerjaan.
- Voice note opsional untuk mandor yang lebih nyaman cerita lisan.

**Diary lapangan harian:**
- Cuaca (cerah/hujan/mendung) — penting untuk justifikasi delay.
- Jumlah tukang hadir per keahlian.
- Material masuk hari itu.
- Kendala & catatan (akses jalan, listrik mati, dll).
- Tamu kunjungan (klien, konsultan, pengawas).

**Visualisasi progress:**
- **S-Curve**: rencana vs realisasi per minggu/bulan, dengan deviation alert.
- **Gantt chart**: timeline item pekerjaan, dependency, critical path.
- **Progress bar per pekerjaan utama**: struktur, arsitektur, MEP, finishing.
- **Heatmap kalender**: aktivitas per hari (mirip GitHub contribution) — cepat lihat hari yang tidak ada progress.
- **Timeline foto**: galeri kronologis semua foto progress, bisa filter per item/minggu.
- **Before/After slider**: bandingkan foto titik yang sama dari waktu berbeda.

**Indikator kesehatan proyek:**
- 🟢 On track — sesuai jadwal & budget.
- 🟡 Watch — deviasi 5-15%.
- 🔴 Critical — deviasi > 15% atau ada blocker.
- Hitung otomatis berdasarkan S-Curve & HPP variance.

**Laporan mingguan otomatis:**
- Generate PDF setiap Senin pagi: progress minggu lalu, foto highlight, kendala, rencana minggu ini.
- Bisa kirim otomatis ke klien via email/WhatsApp.

### 2.7 Kalkulasi HPP (Harga Pokok Produksi)
Komponen finansial yang menggabungkan data dari modul material, tukang, dan progress untuk menjawab: "berapa biaya sebenarnya proyek ini?"

**Komponen HPP:**
- Biaya material langsung (dari pemakaian aktual)
- Biaya upah tukang (dari absensi & borongan)
- Biaya sewa alat (molen, scaffolding, dll)
- Overhead proyek (listrik site, konsumsi, transport)
- Biaya tak langsung yang dialokasikan

**Output:**
- HPP rencana (dari RAB) vs HPP aktual (running cost).
- Variance per item pekerjaan: di mana cost overrun terjadi?
- Margin proyek: nilai kontrak − HPP aktual.
- Forecast HPP final berdasarkan progress saat ini.

### 2.8 Keuangan & Cashflow
- Termin pembayaran klien (DP, progress, retensi).
- Pengeluaran: PO supplier, upah, sewa, lain-lain.
- Cashflow per proyek & cashflow konsolidasi.
- Approval workflow untuk pengeluaran > threshold tertentu.

### 2.9 Laporan & Analitik
- Dashboard eksekutif: proyek aktif, total nilai, profit estimasi, peta sebaran.
- Laporan progress mingguan & bulanan (PDF export dengan foto).
- Laporan HPP per proyek.
- Top 10 material termahal / paling boros.
- Produktivitas tukang per keahlian.
- Analisa delay: penyebab utama keterlambatan (cuaca, material, tukang, dll).
- Komparasi antar proyek: durasi, biaya per m², margin.

---

## 3. Arsitektur Teknis

### 3.1 Stack
- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Database**: PostgreSQL + **PostGIS extension** (Supabase atau Neon) — relasional + spasial untuk data peta
- **ORM**: Drizzle ORM (support PostGIS via custom types) atau Prisma
- **Auth**: Auth.js (NextAuth v5) atau Clerk
- **File Storage**: Supabase Storage / Cloudflare R2 (foto progress, dokumen)
- **Form & Validasi**: react-hook-form + Zod
- **Tabel Data**: TanStack Table (data grid besar, sortable, filterable)
- **Chart**: Recharts atau Tremor (laporan, S-curve, Gantt)
- **Peta**: **MapLibre GL JS** + **react-map-gl** untuk binding React; tile dari OpenStreetMap / MapTiler
- **Geospasial Utility**: Turf.js (kalkulasi jarak, area, geofence point-in-polygon)
- **Date**: date-fns (locale id-ID)
- **PDF Export**: react-pdf atau pdfmake (slip upah, laporan)
- **Image Optimization**: next/image + sharp untuk foto progress (banyak dan besar)

### 3.2 Struktur Folder (App Router)
```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── layout.tsx              # Sidebar + topbar
│   ├── page.tsx                # Dashboard ringkasan
│   ├── peta/page.tsx           # Peta global semua proyek
│   ├── proyek/
│   │   ├── page.tsx            # List proyek (toggle list/map view)
│   │   ├── baru/page.tsx       # Form + pin lokasi di peta
│   │   └── [id]/
│   │       ├── page.tsx        # Overview + mini-map
│   │       ├── peta/page.tsx   # Peta site detail + geofence editor
│   │       ├── rab/page.tsx
│   │       ├── material/page.tsx
│   │       ├── tukang/page.tsx
│   │       ├── progress/page.tsx
│   │       ├── hpp/page.tsx
│   │       └── keuangan/page.tsx
│   ├── material/               # Master material
│   ├── tukang/                 # Master tukang
│   ├── keuangan/
│   └── laporan/
├── api/
│   └── ...                     # Webhook/external + tile proxy jika perlu
components/
├── ui/                         # shadcn components
├── proyek/
├── map/                        # MapView, ProjectMarker, GeofenceEditor, dll
├── charts/
└── shared/
lib/
├── db/                         # Drizzle schema & queries
├── actions/                    # Server Actions
├── geo/                        # Turf utilities, geofence helpers
├── utils/
└── validations/                # Zod schemas
```

### 3.3 Skema Database (Inti)
```sql
users (id, name, email, role, ...)

-- PostGIS extension aktif
projects (
  id, name, client, address,
  location GEOMETRY(Point, 4326),       -- koordinat lat/lng proyek
  site_boundary GEOMETRY(Polygon, 4326), -- area site (geofence)
  start_date, end_date, contract_value, status
)

work_items (id, project_id, parent_id, name, unit, volume, unit_price)
materials (id, name, unit, default_price)
project_materials (id, project_id, material_id, qty_planned, qty_used, supplier, price)
workers (id, name, skill, daily_rate)

attendance (
  id, worker_id, project_id, date, hours,
  checkin_location GEOMETRY(Point, 4326), -- GPS saat check-in
  checkin_valid BOOLEAN,                  -- hasil cek geofence
  work_item_id, amount
)

expenses (id, project_id, type, amount, date, description, receipt_url)

progress_logs (
  id, work_item_id, date, percentage, notes, weather,
  photos JSONB                            -- array {url, gps_point, taken_at}
)

site_points (                             -- titik penting di site
  id, project_id, name, type,             -- pos_jaga|gudang|akses|mck|dll
  location GEOMETRY(Point, 4326)
)

payments (id, project_id, type, amount, date)
```

**Query spasial contoh:**
```sql
-- Proyek dalam radius 10km dari lokasi tertentu
SELECT * FROM projects
WHERE ST_DWithin(location, ST_MakePoint(110.37, -7.78)::geography, 10000);

-- Validasi absensi: titik GPS dalam geofence proyek?
SELECT ST_Contains(site_boundary, ST_MakePoint($lng, $lat))
FROM projects WHERE id = $project_id;
```

---

## 4. Panduan UI/UX — Tidak Monoton, Tetap Profesional

Konstruksi punya kesan kasar dan teknis — UI bisa **memanusiakan** itu tanpa kehilangan keseriusan. Hindari tampilan SaaS generik (sidebar abu-abu + tabel putih + tombol biru).

### 4.1 Arah Estetika (pilih satu, jangan campur)

**Opsi A — "Architectural / Blueprint"** *(rekomendasi)*
- Inspirasi dari gambar arsitektur teknik & blueprint.
- Latar krem hangat (`#F5F1E8`) atau navy dalam (`#0E1B2C`) — bukan putih steril.
- Garis tipis presisi, sudut tajam, grid halus seperti kertas milimeter.
- Aksen: kuning safety (`#F5C518`) atau oranye konstruksi (`#E85D04`).
- Cocok untuk industri sipil — terasa "tukang yang rapi", bukan "startup teknologi".

**Opsi B — "Editorial Industrial"**
- Tipografi besar bergaya majalah teknik.
- Warna dominan: hitam pekat, off-white, satu aksen merah bata.
- Banyak ruang kosong, layout asimetris di halaman ringkasan.

**Opsi C — "Warm Brutalist"**
- Border tebal, shadow keras (bukan soft shadow), tombol kotak.
- Palet earth tone: terracotta, kraft, ochre.
- Karakter kuat, tidak terlihat seperti dashboard mana-mana.

### 4.2 Tipografi
Hindari Inter / Roboto. Pilihan yang punya karakter:
- **Display/Heading**: `Fraunces`, `Instrument Serif`, `Editorial New`, atau `Söhne` — beri kepribadian.
- **Body**: `IBM Plex Sans`, `Geist`, atau `Inter Tight` — readable untuk data padat.
- **Mono (angka, kode item)**: `JetBrains Mono` atau `Geist Mono` — penting untuk tabel HPP & RAB.
- Pakai **tabular-nums** untuk semua angka uang dan volume agar rata kanan.

### 4.3 Sistem Warna (contoh untuk Opsi A)
```css
:root {
  --background: 43 33% 94%;        /* krem kertas */
  --foreground: 215 60% 12%;       /* navy tinta */
  --muted: 40 20% 88%;
  --accent: 45 92% 53%;            /* kuning safety */
  --destructive: 14 80% 45%;       /* oranye bata */
  --border: 215 30% 20%;           /* garis tipis tajam */
  --grid: 215 30% 88%;             /* grid blueprint */
}
```
Variabel ini langsung map ke `tailwind.config` shadcn.

### 4.4 Komponen Khas (Bukan shadcn Default)

shadcn jadi fondasi, tapi **kustomisasi** supaya tidak terlihat generik:

- **Card proyek**: bukan kotak shadow biasa. Buat header dengan nomor proyek besar bergaya tiket (`#PRJ-024`), nama proyek pakai display font, status pakai pill custom.
- **Tabel RAB/HPP**: hierarkis dengan indent, kolom angka pakai mono + tabular-nums, baris induk bold dengan latar tipis. Tambah mini-bar di kolom progress per baris.
- **S-Curve & chart**: pakai Recharts tapi style ulang — garis grid putus-putus (seperti blueprint), label di luar plot area, anotasi milestone manual.
- **Form input**: label di atas dengan caps kecil & letter-spacing, input border bawah saja (style architectural) — bukan border full keliling.
- **Tombol primary**: tidak rounded-full, tapi sudut 2px atau 0px untuk vibe industrial. Hover: sedikit shift posisi (1-2px) bukan opacity berubah.
- **Empty state**: ilustrasi minimalis pakai SVG line-art (kontur denah, palu, balok) bukan emoji.
- **Badge status proyek**: warna kuat tanpa bg-color penuh — pakai border + dot indicator + text caps.
- **Progress card**: stack vertikal — angka % besar di atas (display font, 48-60px), label di bawah caps kecil, bar tipis full-width di paling bawah. Lebih bermakna daripada gauge bulat.
- **Photo gallery progress**: grid dengan rasio konsisten, hover reveal metadata (tanggal, lokasi GPS, mandor yang upload). Lightbox dengan navigasi keyboard.

### 4.5 Styling Peta (Custom Map Style)

Peta default MapLibre/Mapbox terlihat generik. Untuk match dengan aesthetic blueprint, **buat custom style JSON**:

- **Palet peta minimalis monokrom**: jalan abu tua, air biru tipis tipe blueprint, label kota typography serif kecil.
- **Hilangkan POI bawaan** (restoran, toko, dll) — fokus ke proyek, bukan distraksi.
- **Garis kontur halus** kalau pakai terrain — kasih nuansa peta teknik.
- **Marker proyek custom**: SVG pin dengan nomor proyek di dalamnya, bukan ikon Google Maps default. Bentuk seperti tag/label gantung sesuai vibe konstruksi.
- **Geofence polygon**: stroke dashed kuning safety, fill semi-transparan, dengan label nama proyek di tengah polygon.
- **Cluster style**: lingkaran dengan angka jumlah proyek, warna gradasi sesuai density.
- **Popup marker**: bukan default — buat custom dengan border tipis tegas, foto thumbnail proyek, progress bar mini, dan tombol "Buka detail".
- **Toggle layer panel**: panel kanan-bawah dengan checkbox custom (satellite, geofence, marker by status).
- **Legend**: kiri-bawah dengan typography editorial — bukan box generik.

### 4.6 Visualisasi Progress (Distinctive)

Progress tracking butuh banyak visualisasi — hindari chart generik:

- **S-Curve**: bukan line chart biasa. Buat area chart dengan dua kurva (rencana = garis putus, realisasi = solid + fill gradient). Anotasi milestone sebagai vertical line dengan label miring 45°.
- **Gantt**: bar horizontal dengan border tipis, bukan solid fill. Beri tekstur diagonal-stripe untuk bar yang delay. Today indicator sebagai vertical dashed line kuning.
- **Heatmap kalender progress**: 7×N grid kotak kecil, intensitas warna brand (bukan hijau GitHub). Tooltip on hover.
- **Timeline foto**: scroll horizontal dengan card foto + tanggal di bawah, garis penghubung kronologis di atas — seperti timeline biografi.
- **Indikator status (🟢🟡🔴)**: jangan pakai emoji literal. Buat dot SVG dengan ring tipis di luar, warna sesuai status, animasi pulse halus untuk status critical.
- **Health score project**: angka besar 0-100 di sudut atas halaman proyek, dengan ring progress melingkar di belakangnya — cepat lihat kondisi proyek tanpa baca detail.

### 4.7 Layout & Komposisi
- **Sidebar**: kiri, sempit (60-72px ikon-only saat default, expand 240px on hover/pin). Bagi section dengan label kategori bukan garis pemisah.
- **Topbar**: tipis, breadcrumb di kiri, search global di tengah, user di kanan.
- **Dashboard utama**: bento grid asimetris. Card "Peta Sebaran Proyek" jadi hero (lebar 2/3 atas), card metrik kecil di sisi, list "Update Progress Terbaru" di bawah. Peta langsung terlihat tanpa klik.
- **Halaman Peta Global** (`/peta`): full-screen map dengan panel kiri collapsible (list proyek + filter), panel kanan untuk detail proyek terpilih. Layout split-screen yang fokus ke peta.
- **Halaman proyek detail**: tab horizontal di atas (`Ringkasan · Peta · Progress · RAB · Material · Tukang · HPP · Keuangan`) — style underline indicator, bukan bg pill. Tab Progress dan Peta sengaja diletakkan di depan supaya akses cepat.
- **Halaman Progress per Proyek**: split 2/3 - 1/3. Kiri: S-Curve + Gantt + diary timeline. Kanan: foto progress terbaru + form quick-update.
- **Data padat**: jangan takut tabel rapat. Tukang dan akuntan butuh lihat banyak baris sekaligus — utamakan density daripada padding besar. Kasih row hover yang halus.

### 4.8 Motion & Micro-interactions
- Page transition pakai `view-transition-api` (Next 15 support) untuk transisi mulus antar tab proyek.
- Skeleton loader bergaya — pakai shimmer dengan warna brand, bukan abu-abu default.
- Angka uang besar di dashboard pakai count-up animation saat pertama load.
- Saat submit progress: animasi checkmark drawing (SVG stroke-dashoffset), bukan toast biasa.
- **Peta**: fly-to animation saat klik proyek dari sidebar (smooth pan + zoom). Marker baru appear dengan scale-in halus.
- **Jangan over-animate**: ini tool kerja harian, animasi berlebihan akan mengganggu.

### 4.9 Hal-Hal Khusus Konteks Indonesia
- Format angka: `Rp 1.250.000` (titik ribuan, tanpa desimal default).
- Format tanggal: `15 Mei 2026` atau `15/05/2026` — bukan US format.
- Locale: `id-ID` untuk `Intl.NumberFormat` dan `Intl.DateTimeFormat`.
- Satuan: gunakan istilah lokal yang familiar (m³, m², zak, batang, lembar, kubik, rit).
- Istilah: "Tukang", "Mandor", "Borongan", "Harian" — jangan diterjemahkan ke Inggris.
- Mobile-first untuk halaman input mandor — banyak yang akses dari HP di lapangan.

### 4.10 Yang HARUS Dihindari
- ❌ Gradient ungu-biru SaaS klise
- ❌ Font Inter sebagai display (sudah terlalu umum)
- ❌ Card dengan shadow blur besar tanpa karakter
- ❌ Dashboard dengan 4 kotak metrik identik di atas
- ❌ Tombol "Get Started" gaya marketing — ini tool internal
- ❌ Emoji sebagai icon (pakai Lucide / custom SVG)
- ❌ Tabel dengan zebra striping default + padding raksasa
- ❌ Peta dengan style Google Maps default + marker bulat merah generik
- ❌ Progress bar default shadcn polos — beri karakter sesuai aesthetic

---

## 5. Roadmap Pengembangan

### Fase 1 — Fondasi & Proyek (3-4 minggu)
- Auth + roles
- CRUD proyek dengan pin lokasi di peta
- Peta global (dashboard map) — list & sebaran proyek
- Geofence editor per proyek
- Upload dokumen proyek

### Fase 2 — Progress Tracking (4-5 minggu)
- Input progress harian (mobile-first) dengan foto + GPS
- Diary lapangan + cuaca
- Galeri foto progress per proyek dengan tag GPS
- S-Curve & Gantt chart
- Heatmap kalender progress
- Indikator kesehatan proyek
- Laporan progress PDF mingguan

### Fase 3 — Material & Tukang (3-4 minggu)
- Master material & tukang
- RAB hierarkis + import Excel
- Pencatatan pemakaian material harian
- Absensi tukang dengan validasi geofence
- Kalkulasi upah harian/borongan

### Fase 4 — HPP & Keuangan (3-4 minggu)
- Kalkulasi HPP aktual real-time
- Variance HPP rencana vs aktual
- PO supplier + invoice
- Cashflow proyek & termin klien
- Approval workflow

### Fase 5 — Polish & Analytics (2-3 minggu)
- Dashboard eksekutif final
- Komparasi antar proyek
- Mobile optimization mendalam
- Notifikasi (email / WhatsApp)
- Share link read-only ke klien (peta + progress)
- Export laporan bulanan komprehensif

---

## 6. Pertimbangan Lain

- **Audit trail**: setiap perubahan harga material, edit RAB, hapus expense, ubah geofence — harus tercatat siapa, kapan, dari nilai berapa.
- **Backup harian**: data HPP & foto progress tidak boleh hilang. Otomasi backup DB + storage ke lokasi terpisah.
- **Multi-tenant ready**: kalau nanti mau jual ke kontraktor lain, skema database harus support `organization_id` dari awal.
- **Performa peta**: kalau proyek > 100, pakai marker clustering + viewport-based loading. Jangan render semua marker sekaligus.

---

*Dokumen ini fondasi awal. Detail teknis tiap modul (skema lengkap, API contract, wireframe per halaman) dibuat terpisah sesuai fase implementasi.*