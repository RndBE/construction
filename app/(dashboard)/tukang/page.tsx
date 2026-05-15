import { getWorkers } from "@/lib/db/queries";
import TukangClient from "./TukangClient";

export default async function TukangPage() {
  let workers: any[] = [];

  try {
    const dbWorkers = await getWorkers();
    workers = dbWorkers.map((w) => ({
      id: w.id,
      code: w.code,
      name: w.name,
      skill: w.skill,
      dailyRate: w.dailyRate || 0,
      phone: w.phone || "—",
      isActive: w.isActive,
    }));
  } catch (e) {
    console.error("DB error:", e);
    workers = [
      { id: "1", code: "TK-001", name: "Joko Widodo", skill: "batu", dailyRate: 200000, phone: "081234567001", isActive: true },
      { id: "2", code: "TK-002", name: "Suryo Prabowo", skill: "besi", dailyRate: 225000, phone: "081234567002", isActive: true },
      { id: "3", code: "TK-003", name: "Rudi Hartono", skill: "kayu", dailyRate: 210000, phone: "081234567003", isActive: true },
    ];
  }

  return <TukangClient workers={workers} />;
}
