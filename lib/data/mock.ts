// Mock data for development — will be replaced with database queries

export interface Project {
  id: string;
  name: string;
  client: string;
  address: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  contractValue: number;
  status: "perencanaan" | "berjalan" | "selesai" | "pemeliharaan" | "arsip";
  progress: number;
  hppPlan: number;
  hppActual: number;
  pic: string;
  type: string;
  thumbnailUrl?: string;
  lastUpdate?: string;
  workersCount?: number;
}

export interface DashboardMetrics {
  totalProyek: number;
  proyekAktif: number;
  totalNilaiKontrak: number;
  totalMargin: number;
  totalTukang: number;
  totalMaterial: number;
  hppVariance: number;
  progressRataRata: number;
}

export interface ProgressUpdate {
  id: string;
  projectId: string;
  projectName: string;
  itemPekerjaan: string;
  progress: number;
  mandor: string;
  date: string;
  weather: "cerah" | "mendung" | "hujan";
  photoUrl?: string;
  notes?: string;
}

export interface Worker {
  id: string;
  name: string;
  skill: "batu" | "kayu" | "besi" | "las" | "finishing" | "listrik" | "pipa";
  dailyRate: number;
  phone: string;
  projectId?: string;
  status: "aktif" | "nonaktif";
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  defaultPrice: number;
  category: string;
  stockLevel: number;
  minStock: number;
}

// ─── Mock Projects ───
export const mockProjects: Project[] = [
  {
    id: "PRJ-001",
    name: "Koperasi Sleman Unit II",
    client: "KSP Maju Bersama",
    address: "Jl. Kaliurang Km 12, Sleman, Yogyakarta",
    latitude: -7.7156,
    longitude: 110.3895,
    startDate: "2026-01-15",
    endDate: "2026-08-30",
    contractValue: 2850000000,
    status: "berjalan",
    progress: 47,
    hppPlan: 2280000000,
    hppActual: 1170000000,
    pic: "Andi Prasetyo",
    type: "Gedung Koperasi",
    lastUpdate: "2026-05-14",
    workersCount: 24,
  },
  {
    id: "PRJ-002",
    name: "Gudang Logistik Magelang",
    client: "PT Cakra Logistics",
    address: "Jl. Raya Magelang-Jogja Km 8, Magelang",
    latitude: -7.4713,
    longitude: 110.2177,
    startDate: "2026-02-01",
    endDate: "2026-07-15",
    contractValue: 1650000000,
    status: "berjalan",
    progress: 62,
    hppPlan: 1320000000,
    hppActual: 890000000,
    pic: "Budi Santoso",
    type: "Gudang",
    lastUpdate: "2026-05-13",
    workersCount: 18,
  },
  {
    id: "PRJ-003",
    name: "Renovasi Kantor Cabang BPR",
    client: "BPR Danarta",
    address: "Jl. Malioboro No. 45, Yogyakarta",
    latitude: -7.7925,
    longitude: 110.3657,
    startDate: "2026-03-10",
    endDate: "2026-06-30",
    contractValue: 875000000,
    status: "berjalan",
    progress: 78,
    hppPlan: 700000000,
    hppActual: 580000000,
    pic: "Sari Dewi",
    type: "Renovasi",
    lastUpdate: "2026-05-14",
    workersCount: 12,
  },
  {
    id: "PRJ-004",
    name: "Perumahan Cluster Bougainville",
    client: "PT Graha Cipta Mandiri",
    address: "Jl. Wates Km 5, Bantul, Yogyakarta",
    latitude: -7.8362,
    longitude: 110.3191,
    startDate: "2025-09-01",
    endDate: "2026-09-01",
    contractValue: 8500000000,
    status: "berjalan",
    progress: 35,
    hppPlan: 6800000000,
    hppActual: 2720000000,
    pic: "Andi Prasetyo",
    type: "Perumahan",
    lastUpdate: "2026-05-12",
    workersCount: 45,
  },
  {
    id: "PRJ-005",
    name: "Gedung Serbaguna Desa Triharjo",
    client: "Pemerintah Desa Triharjo",
    address: "Desa Triharjo, Sleman, Yogyakarta",
    latitude: -7.6813,
    longitude: 110.4125,
    startDate: "2026-04-01",
    endDate: "2026-12-31",
    contractValue: 3200000000,
    status: "perencanaan",
    progress: 5,
    hppPlan: 2560000000,
    hppActual: 128000000,
    pic: "Budi Santoso",
    type: "Gedung Publik",
    lastUpdate: "2026-05-10",
    workersCount: 0,
  },
  {
    id: "PRJ-006",
    name: "Puskesmas Kecamatan Depok",
    client: "Dinas Kesehatan Sleman",
    address: "Jl. Perumnas, Depok, Sleman",
    latitude: -7.7634,
    longitude: 110.3951,
    startDate: "2025-06-01",
    endDate: "2026-03-31",
    contractValue: 4100000000,
    status: "selesai",
    progress: 100,
    hppPlan: 3280000000,
    hppActual: 3150000000,
    pic: "Sari Dewi",
    type: "Fasilitas Kesehatan",
    lastUpdate: "2026-03-31",
    workersCount: 0,
  },
  {
    id: "PRJ-007",
    name: "Jembatan Penyeberangan Prambanan",
    client: "Dinas PU Klaten",
    address: "Jl. Raya Solo-Jogja, Prambanan, Klaten",
    latitude: -7.7520,
    longitude: 110.4917,
    startDate: "2026-05-01",
    endDate: "2026-11-30",
    contractValue: 5600000000,
    status: "perencanaan",
    progress: 2,
    hppPlan: 4480000000,
    hppActual: 56000000,
    pic: "Andi Prasetyo",
    type: "Infrastruktur",
    lastUpdate: "2026-05-08",
    workersCount: 0,
  },
  {
    id: "PRJ-008",
    name: "Ruko Jl. Kaliurang",
    client: "CV Mandiri Property",
    address: "Jl. Kaliurang Km 6.5, Sleman",
    latitude: -7.7458,
    longitude: 110.3856,
    startDate: "2025-11-15",
    endDate: "2026-05-30",
    contractValue: 2100000000,
    status: "berjalan",
    progress: 89,
    hppPlan: 1680000000,
    hppActual: 1620000000,
    pic: "Budi Santoso",
    type: "Komersial",
    lastUpdate: "2026-05-14",
    workersCount: 8,
  },
];

// ─── Mock Dashboard Metrics ───
export const mockMetrics: DashboardMetrics = {
  totalProyek: 8,
  proyekAktif: 5,
  totalNilaiKontrak: 28875000000,
  totalMargin: 4420000000,
  totalTukang: 107,
  totalMaterial: 342,
  hppVariance: -2.3,
  progressRataRata: 52,
};

// ─── Mock Progress Updates ───
export const mockProgressUpdates: ProgressUpdate[] = [
  {
    id: "PG-001",
    projectId: "PRJ-001",
    projectName: "Koperasi Sleman Unit II",
    itemPekerjaan: "Pengecoran Kolom Lt. 2",
    progress: 85,
    mandor: "Pak Joko",
    date: "2026-05-14",
    weather: "cerah",
    notes: "Pengecoran kolom K-225 selesai 12 dari 14 titik. Sisa 2 kolom besok.",
  },
  {
    id: "PG-002",
    projectId: "PRJ-002",
    projectName: "Gudang Logistik Magelang",
    itemPekerjaan: "Pemasangan Rangka Atap Baja",
    progress: 60,
    mandor: "Pak Suryo",
    date: "2026-05-14",
    weather: "mendung",
    notes: "6 dari 10 kuda-kuda sudah terpasang. Material besi siku tinggal 40 batang.",
  },
  {
    id: "PG-003",
    projectId: "PRJ-003",
    projectName: "Renovasi Kantor Cabang BPR",
    itemPekerjaan: "Finishing Dinding Interior",
    progress: 90,
    mandor: "Pak Rudi",
    date: "2026-05-14",
    weather: "cerah",
    notes: "Cat interior lt.1 selesai. Lt.2 tinggal ruang meeting dan toilet.",
  },
  {
    id: "PG-004",
    projectId: "PRJ-008",
    projectName: "Ruko Jl. Kaliurang",
    itemPekerjaan: "Pemasangan Keramik Lantai",
    progress: 95,
    mandor: "Pak Wawan",
    date: "2026-05-13",
    weather: "hujan",
    notes: "Keramik unit 3 dan 4 sudah selesai. Tinggal nat dan finishing.",
  },
  {
    id: "PG-005",
    projectId: "PRJ-004",
    projectName: "Perumahan Cluster Bougainville",
    itemPekerjaan: "Pondasi Tipe 45 Blok C",
    progress: 40,
    mandor: "Pak Heri",
    date: "2026-05-13",
    weather: "cerah",
    notes: "Galian pondasi 6 unit selesai. Cor lantai kerja 4 unit selesai.",
  },
];

// ─── Mock Workers ───
export const mockWorkers: Worker[] = [
  { id: "TK-001", name: "Joko Widodo", skill: "batu", dailyRate: 200000, phone: "081234567001", projectId: "PRJ-001", status: "aktif" },
  { id: "TK-002", name: "Suryo Prabowo", skill: "besi", dailyRate: 225000, phone: "081234567002", projectId: "PRJ-002", status: "aktif" },
  { id: "TK-003", name: "Rudi Hartono", skill: "kayu", dailyRate: 210000, phone: "081234567003", projectId: "PRJ-003", status: "aktif" },
  { id: "TK-004", name: "Wawan Setiawan", skill: "finishing", dailyRate: 190000, phone: "081234567004", projectId: "PRJ-008", status: "aktif" },
  { id: "TK-005", name: "Heri Susanto", skill: "batu", dailyRate: 200000, phone: "081234567005", projectId: "PRJ-004", status: "aktif" },
];

// ─── Utility functions ───
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatTanggal(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatTanggalShort(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function getStatusColor(status: Project["status"]) {
  switch (status) {
    case "berjalan":
      return { bg: "bg-success/10", text: "text-success", dot: "status-dot--active", label: "Berjalan" };
    case "perencanaan":
      return { bg: "bg-blue-500/10", text: "text-blue-600", dot: "status-dot--planning", label: "Perencanaan" };
    case "selesai":
      return { bg: "bg-muted", text: "text-muted-foreground", dot: "status-dot--done", label: "Selesai" };
    case "pemeliharaan":
      return { bg: "bg-warning/10", text: "text-warning", dot: "status-dot--active", label: "Pemeliharaan" };
    case "arsip":
      return { bg: "bg-muted", text: "text-muted-foreground", dot: "status-dot--done", label: "Arsip" };
  }
}

export function getWeatherIcon(weather: ProgressUpdate["weather"]) {
  switch (weather) {
    case "cerah": return "☀️";
    case "mendung": return "☁️";
    case "hujan": return "🌧️";
  }
}

export function getHealthScore(progress: number, hppPlan: number, hppActual: number): {
  score: number;
  status: "on-track" | "watch" | "critical";
  label: string;
  color: string;
} {
  // No data yet — assume on track
  if (hppPlan <= 0 || progress <= 0 || hppActual <= 0) {
    return { score: 100, status: "on-track", label: "On Track", color: "var(--success)" };
  }

  const expectedHpp = (progress / 100) * hppPlan;
  if (expectedHpp <= 0) {
    return { score: 100, status: "on-track", label: "On Track", color: "var(--success)" };
  }

  const deviation = ((hppActual - expectedHpp) / expectedHpp) * 100;

  let score = 100;
  if (deviation > 0) score = Math.max(0, 100 - deviation * 3);

  if (score >= 75) return { score: Math.round(score), status: "on-track", label: "On Track", color: "var(--success)" };
  if (score >= 50) return { score: Math.round(score), status: "watch", label: "Watch", color: "var(--warning)" };
  return { score: Math.round(score), status: "critical", label: "Critical", color: "var(--critical)" };
}
