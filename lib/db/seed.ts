/**
 * Database seed script
 * Jalankan: npx tsx lib/db/seed.ts
 */

import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import * as schema from "./schema";

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "konstruksi",
  });

  const db = drizzle(pool, { schema, mode: "default" });

  console.log("🌱 Seeding database...");

  // ── Users ──
  const passwordHash = await bcrypt.hash("password123", 10);

  const userIds = {
    andi: randomUUID(),
    budi: randomUUID(),
    sari: randomUUID(),
    mandor1: randomUUID(),
    admin1: randomUUID(),
  };

  await db.insert(schema.users).values([
    { id: userIds.andi, name: "Andi Prasetyo", email: "andi@konstruksi.id", password: passwordHash, role: "project_manager", phone: "081234567001" },
    { id: userIds.budi, name: "Budi Santoso", email: "budi@konstruksi.id", password: passwordHash, role: "project_manager", phone: "081234567002" },
    { id: userIds.sari, name: "Sari Dewi", email: "sari@konstruksi.id", password: passwordHash, role: "project_manager", phone: "081234567003" },
    { id: userIds.mandor1, name: "Pak Joko", email: "joko@konstruksi.id", password: passwordHash, role: "mandor", phone: "081234567010" },
    { id: userIds.admin1, name: "Admin Keuangan", email: "admin@konstruksi.id", password: passwordHash, role: "admin_keuangan", phone: "081234567020" },
  ]);

  console.log("✅ Users seeded");

  // ── Projects ──
  const projectIds = {
    prj001: randomUUID(),
    prj002: randomUUID(),
    prj003: randomUUID(),
    prj004: randomUUID(),
    prj005: randomUUID(),
    prj006: randomUUID(),
    prj007: randomUUID(),
    prj008: randomUUID(),
  };

  await db.insert(schema.projects).values([
    { id: projectIds.prj001, code: "PRJ-001", name: "Koperasi Sleman Unit II", client: "KSP Maju Bersama", address: "Jl. Kaliurang Km 12, Sleman, Yogyakarta", latitude: -7.7156, longitude: 110.3895, startDate: "2026-01-15", endDate: "2026-08-30", contractValue: 2850000000, status: "berjalan", type: "Gedung Koperasi", picId: userIds.andi },
    { id: projectIds.prj002, code: "PRJ-002", name: "Gudang Logistik Magelang", client: "PT Cakra Logistics", address: "Jl. Raya Magelang-Jogja Km 8, Magelang", latitude: -7.4713, longitude: 110.2177, startDate: "2026-02-01", endDate: "2026-07-15", contractValue: 1650000000, status: "berjalan", type: "Gudang", picId: userIds.budi },
    { id: projectIds.prj003, code: "PRJ-003", name: "Renovasi Kantor Cabang BPR", client: "BPR Danarta", address: "Jl. Malioboro No. 45, Yogyakarta", latitude: -7.7925, longitude: 110.3657, startDate: "2026-03-10", endDate: "2026-06-30", contractValue: 875000000, status: "berjalan", type: "Renovasi", picId: userIds.sari },
    { id: projectIds.prj004, code: "PRJ-004", name: "Perumahan Cluster Bougainville", client: "PT Graha Cipta Mandiri", address: "Jl. Wates Km 5, Bantul, Yogyakarta", latitude: -7.8362, longitude: 110.3191, startDate: "2025-09-01", endDate: "2026-09-01", contractValue: 8500000000, status: "berjalan", type: "Perumahan", picId: userIds.andi },
    { id: projectIds.prj005, code: "PRJ-005", name: "Gedung Serbaguna Desa Triharjo", client: "Pemerintah Desa Triharjo", address: "Desa Triharjo, Sleman, Yogyakarta", latitude: -7.6813, longitude: 110.4125, startDate: "2026-04-01", endDate: "2026-12-31", contractValue: 3200000000, status: "perencanaan", type: "Gedung Publik", picId: userIds.budi },
    { id: projectIds.prj006, code: "PRJ-006", name: "Puskesmas Kecamatan Depok", client: "Dinas Kesehatan Sleman", address: "Jl. Perumnas, Depok, Sleman", latitude: -7.7634, longitude: 110.3951, startDate: "2025-06-01", endDate: "2026-03-31", contractValue: 4100000000, status: "selesai", type: "Fasilitas Kesehatan", picId: userIds.sari },
    { id: projectIds.prj007, code: "PRJ-007", name: "Jembatan Penyeberangan Prambanan", client: "Dinas PU Klaten", address: "Jl. Raya Solo-Jogja, Prambanan, Klaten", latitude: -7.7520, longitude: 110.4917, startDate: "2026-05-01", endDate: "2026-11-30", contractValue: 5600000000, status: "perencanaan", type: "Infrastruktur", picId: userIds.andi },
    { id: projectIds.prj008, code: "PRJ-008", name: "Ruko Jl. Kaliurang", client: "CV Mandiri Property", address: "Jl. Kaliurang Km 6.5, Sleman", latitude: -7.7458, longitude: 110.3856, startDate: "2025-11-15", endDate: "2026-05-30", contractValue: 2100000000, status: "berjalan", type: "Komersial", picId: userIds.budi },
  ]);

  console.log("✅ Projects seeded");

  // ── Work Items for PRJ-001 ──
  const wi = {
    struktur: randomUUID(),
    arsitektur: randomUUID(),
    mep: randomUUID(),
    pondasi: randomUUID(),
    kolom: randomUUID(),
    balok: randomUUID(),
    plat: randomUUID(),
    dinding: randomUUID(),
    finishing: randomUUID(),
    atap: randomUUID(),
  };

  await db.insert(schema.workItems).values([
    { id: wi.struktur, projectId: projectIds.prj001, name: "Pekerjaan Struktur", unit: "ls", volume: "1", unitPrice: 1200000000, sortOrder: 1 },
    { id: wi.arsitektur, projectId: projectIds.prj001, name: "Pekerjaan Arsitektur", unit: "ls", volume: "1", unitPrice: 800000000, sortOrder: 2 },
    { id: wi.mep, projectId: projectIds.prj001, name: "Pekerjaan MEP", unit: "ls", volume: "1", unitPrice: 280000000, sortOrder: 3 },
    { id: wi.pondasi, projectId: projectIds.prj001, parentId: wi.struktur, name: "Pondasi Batu Kali", unit: "m³", volume: "45", unitPrice: 1250000, sortOrder: 1 },
    { id: wi.kolom, projectId: projectIds.prj001, parentId: wi.struktur, name: "Kolom Beton K-225", unit: "m³", volume: "32", unitPrice: 3500000, sortOrder: 2 },
    { id: wi.balok, projectId: projectIds.prj001, parentId: wi.struktur, name: "Balok Beton K-225", unit: "m³", volume: "28", unitPrice: 3800000, sortOrder: 3 },
    { id: wi.plat, projectId: projectIds.prj001, parentId: wi.struktur, name: "Plat Lantai t=12cm", unit: "m²", volume: "320", unitPrice: 450000, sortOrder: 4 },
    { id: wi.dinding, projectId: projectIds.prj001, parentId: wi.arsitektur, name: "Pasangan Dinding Bata", unit: "m²", volume: "580", unitPrice: 185000, sortOrder: 1 },
    { id: wi.finishing, projectId: projectIds.prj001, parentId: wi.arsitektur, name: "Plester + Aci + Cat", unit: "m²", volume: "1160", unitPrice: 125000, sortOrder: 2 },
    { id: wi.atap, projectId: projectIds.prj001, parentId: wi.arsitektur, name: "Rangka Atap Baja Ringan", unit: "m²", volume: "350", unitPrice: 310000, sortOrder: 3 },
  ]);

  console.log("✅ Work items seeded");

  // ── Progress Logs for PRJ-001 ──
  const weeksOfData = [
    { date: "2026-01-20", items: [{ wiId: wi.pondasi, pct: "15", notes: "Galian pondasi dimulai", weather: "cerah" as const }] },
    { date: "2026-01-27", items: [{ wiId: wi.pondasi, pct: "40", notes: "Pasangan batu kali bagian timur", weather: "cerah" as const }] },
    { date: "2026-02-03", items: [{ wiId: wi.pondasi, pct: "70", notes: "Lanjut bagian barat, cuaca baik", weather: "cerah" as const }] },
    { date: "2026-02-10", items: [{ wiId: wi.pondasi, pct: "100", notes: "Pondasi selesai seluruhnya", weather: "mendung" as const }] },
    { date: "2026-02-17", items: [{ wiId: wi.kolom, pct: "10", notes: "Pembesian kolom lt.1 dimulai", weather: "cerah" as const }] },
    { date: "2026-02-24", items: [{ wiId: wi.kolom, pct: "30", notes: "Bekisting kolom terpasang", weather: "hujan" as const }] },
    { date: "2026-03-03", items: [{ wiId: wi.kolom, pct: "50", notes: "Pengecoran kolom lt.1 selesai 8/14 titik", weather: "cerah" as const }] },
    { date: "2026-03-10", items: [{ wiId: wi.kolom, pct: "70", notes: "Semua kolom lt.1 selesai cor", weather: "cerah" as const }] },
    { date: "2026-03-17", items: [{ wiId: wi.kolom, pct: "85", notes: "Kolom lt.2 sedang pembesian", weather: "mendung" as const }, { wiId: wi.balok, pct: "15", notes: "Persiapan balok lt.1", weather: "mendung" as const }] },
    { date: "2026-03-24", items: [{ wiId: wi.balok, pct: "35", notes: "Pembesian balok selesai", weather: "cerah" as const }] },
    { date: "2026-03-31", items: [{ wiId: wi.balok, pct: "55", notes: "Bekisting balok terpasang, siap cor", weather: "cerah" as const }] },
    { date: "2026-04-07", items: [{ wiId: wi.balok, pct: "75", notes: "Pengecoran balok lt.1 selesai", weather: "hujan" as const }, { wiId: wi.plat, pct: "20", notes: "Bekisting plat lantai dipasang", weather: "hujan" as const }] },
    { date: "2026-04-14", items: [{ wiId: wi.plat, pct: "45", notes: "Pembesian plat selesai", weather: "cerah" as const }] },
    { date: "2026-04-21", items: [{ wiId: wi.plat, pct: "70", notes: "Pengecoran plat lt.1 selesai", weather: "cerah" as const }, { wiId: wi.dinding, pct: "10", notes: "Pasangan dinding lt.1 dimulai", weather: "cerah" as const }] },
    { date: "2026-04-28", items: [{ wiId: wi.dinding, pct: "25", notes: "Dinding lt.1 area depan selesai", weather: "mendung" as const }] },
    { date: "2026-05-05", items: [{ wiId: wi.kolom, pct: "95", notes: "Kolom lt.2 hampir selesai", weather: "cerah" as const }, { wiId: wi.dinding, pct: "40", notes: "Dinding lt.1 50%+ selesai", weather: "cerah" as const }] },
    { date: "2026-05-12", items: [{ wiId: wi.dinding, pct: "55", notes: "Lanjut dinding lt.1 area belakang", weather: "cerah" as const }, { wiId: wi.finishing, pct: "5", notes: "Plester area depan dimulai", weather: "cerah" as const }] },
  ];

  for (const week of weeksOfData) {
    for (const item of week.items) {
      await db.insert(schema.progressLogs).values({
        id: randomUUID(),
        workItemId: item.wiId,
        projectId: projectIds.prj001,
        date: week.date,
        percentage: item.pct,
        notes: item.notes,
        weather: item.weather,
        createdById: userIds.mandor1,
      });
    }
  }

  console.log("✅ Progress logs seeded");

  // ── Field Diaries for PRJ-001 ──
  const recentDates = ["2026-05-08", "2026-05-09", "2026-05-10", "2026-05-12", "2026-05-13", "2026-05-14"];
  const weatherOptions = ["cerah", "cerah", "mendung", "cerah", "hujan", "cerah"] as const;

  for (let i = 0; i < recentDates.length; i++) {
    await db.insert(schema.fieldDiaries).values({
      id: randomUUID(),
      projectId: projectIds.prj001,
      date: recentDates[i],
      weather: weatherOptions[i],
      workersPresentBySkill: JSON.stringify({ batu: 6, kayu: 3, besi: 4, finishing: 2 }),
      issues: i === 4 ? "Hujan deras sejak pagi, pekerjaan luar terhenti" : null,
      notes: `Catatan harian lapangan tanggal ${recentDates[i]}`,
      createdById: userIds.mandor1,
    });
  }

  console.log("✅ Field diaries seeded");

  // ── Materials ──
  const matIds = Array.from({ length: 10 }, () => randomUUID());
  await db.insert(schema.materials).values([
    { id: matIds[0], code: "MAT-001", name: "Semen Portland PCC 40kg", unit: "zak", defaultPrice: 62000, category: "Beton", minStock: 100 },
    { id: matIds[1], code: "MAT-002", name: "Besi Beton D10 12m", unit: "batang", defaultPrice: 85000, category: "Besi", minStock: 50 },
    { id: matIds[2], code: "MAT-003", name: "Besi Beton D13 12m", unit: "batang", defaultPrice: 125000, category: "Besi", minStock: 40 },
    { id: matIds[3], code: "MAT-004", name: "Pasir Pasang (Merapi)", unit: "kubik", defaultPrice: 350000, category: "Agregat", minStock: 20 },
    { id: matIds[4], code: "MAT-005", name: "Batu Split 1-2 cm", unit: "kubik", defaultPrice: 450000, category: "Agregat", minStock: 15 },
    { id: matIds[5], code: "MAT-006", name: "Bata Merah Press", unit: "buah", defaultPrice: 850, category: "Dinding", minStock: 2000 },
    { id: matIds[6], code: "MAT-007", name: "Cat Dulux Interior 5kg", unit: "kaleng", defaultPrice: 320000, category: "Finishing", minStock: 10 },
    { id: matIds[7], code: "MAT-008", name: "Keramik 40×40 (Grade A)", unit: "dus", defaultPrice: 75000, category: "Finishing", minStock: 20 },
    { id: matIds[8], code: "MAT-009", name: "Pipa PVC 4\" AW 4m", unit: "batang", defaultPrice: 95000, category: "MEP", minStock: 10 },
    { id: matIds[9], code: "MAT-010", name: "Multiplex 18mm 244×122", unit: "lembar", defaultPrice: 380000, category: "Kayu", minStock: 10 },
  ]);

  console.log("✅ Materials seeded");

  // ── Workers ──
  const workerIds = Array.from({ length: 10 }, () => randomUUID());
  await db.insert(schema.workers).values([
    { id: workerIds[0], code: "TK-001", name: "Joko Widodo", skill: "batu", dailyRate: 200000, phone: "081234567001" },
    { id: workerIds[1], code: "TK-002", name: "Suryo Prabowo", skill: "besi", dailyRate: 225000, phone: "081234567002" },
    { id: workerIds[2], code: "TK-003", name: "Rudi Hartono", skill: "kayu", dailyRate: 210000, phone: "081234567003" },
    { id: workerIds[3], code: "TK-004", name: "Wawan Setiawan", skill: "finishing", dailyRate: 190000, phone: "081234567004" },
    { id: workerIds[4], code: "TK-005", name: "Heri Susanto", skill: "batu", dailyRate: 200000, phone: "081234567005" },
    { id: workerIds[5], code: "TK-006", name: "Dani Permana", skill: "besi", dailyRate: 220000, phone: "081234567006" },
    { id: workerIds[6], code: "TK-007", name: "Agus Salim", skill: "las", dailyRate: 250000, phone: "081234567007" },
    { id: workerIds[7], code: "TK-008", name: "Bambang Tri", skill: "listrik", dailyRate: 230000, phone: "081234567008" },
    { id: workerIds[8], code: "TK-009", name: "Eko Prasetya", skill: "pipa", dailyRate: 215000, phone: "081234567009" },
    { id: workerIds[9], code: "TK-010", name: "Fajar Nugroho", skill: "kayu", dailyRate: 205000, phone: "081234567010" },
  ]);

  console.log("✅ Workers seeded");

  // ── Expenses for PRJ-001 ──
  const expenseData = [
    { date: "2026-01-20", type: "material" as const, amount: 45000000, desc: "Semen & besi pondasi" },
    { date: "2026-01-25", type: "upah" as const, amount: 28000000, desc: "Upah tukang minggu 1-2" },
    { date: "2026-02-05", type: "material" as const, amount: 62000000, desc: "Besi beton kolom" },
    { date: "2026-02-15", type: "upah" as const, amount: 35000000, desc: "Upah tukang Februari 1" },
    { date: "2026-02-28", type: "upah" as const, amount: 38000000, desc: "Upah tukang Februari 2" },
    { date: "2026-03-05", type: "material" as const, amount: 58000000, desc: "Ready mix K-225 kolom" },
    { date: "2026-03-15", type: "alat" as const, amount: 15000000, desc: "Sewa scaffolding" },
    { date: "2026-03-20", type: "upah" as const, amount: 42000000, desc: "Upah tukang Maret" },
    { date: "2026-04-05", type: "material" as const, amount: 73000000, desc: "Ready mix & besi balok/plat" },
    { date: "2026-04-15", type: "upah" as const, amount: 45000000, desc: "Upah tukang April 1" },
    { date: "2026-04-25", type: "material" as const, amount: 48000000, desc: "Bata merah & semen dinding" },
    { date: "2026-04-30", type: "upah" as const, amount: 40000000, desc: "Upah tukang April 2" },
    { date: "2026-05-10", type: "material" as const, amount: 35000000, desc: "Material finishing awal" },
    { date: "2026-05-12", type: "upah" as const, amount: 38000000, desc: "Upah tukang Mei 1" },
    { date: "2026-05-05", type: "overhead" as const, amount: 12000000, desc: "Biaya operasional site" },
  ];

  for (const exp of expenseData) {
    await db.insert(schema.expenses).values({
      id: randomUUID(),
      projectId: projectIds.prj001,
      type: exp.type,
      amount: exp.amount,
      date: exp.date,
      description: exp.desc,
      status: "approved",
      approvedById: userIds.andi,
    });
  }

  // Expenses for PRJ-002
  const exp2 = [
    { date: "2026-02-10", type: "material" as const, amount: 85000000, desc: "Pondasi & struktur awal" },
    { date: "2026-03-01", type: "upah" as const, amount: 55000000, desc: "Upah tukang Feb-Mar" },
    { date: "2026-03-15", type: "material" as const, amount: 120000000, desc: "Baja ringan & atap gudang" },
    { date: "2026-04-10", type: "upah" as const, amount: 48000000, desc: "Upah tukang April" },
    { date: "2026-05-05", type: "material" as const, amount: 65000000, desc: "Dinding & finishing" },
  ];

  for (const exp of exp2) {
    await db.insert(schema.expenses).values({
      id: randomUUID(),
      projectId: projectIds.prj002,
      type: exp.type,
      amount: exp.amount,
      date: exp.date,
      description: exp.desc,
      status: "approved",
    });
  }

  console.log("✅ Expenses seeded");

  // ── Payments (Termin) ──
  await db.insert(schema.payments).values([
    { id: randomUUID(), projectId: projectIds.prj001, type: "dp", amount: 570000000, date: "2026-01-15", description: "DP 20%" },
    { id: randomUUID(), projectId: projectIds.prj001, type: "termin", amount: 427500000, date: "2026-03-15", description: "Termin 1 (15%)" },
    { id: randomUUID(), projectId: projectIds.prj001, type: "termin", amount: 427500000, date: "2026-05-01", description: "Termin 2 (15%)" },
    { id: randomUUID(), projectId: projectIds.prj002, type: "dp", amount: 330000000, date: "2026-02-01", description: "DP 20%" },
    { id: randomUUID(), projectId: projectIds.prj002, type: "termin", amount: 247500000, date: "2026-04-01", description: "Termin 1 (15%)" },
  ]);

  console.log("✅ Payments seeded");

  console.log("🎉 Seeding complete!");
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
