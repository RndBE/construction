import { getMaterials } from "@/lib/db/queries";
import MaterialClient from "./MaterialClient";

export default async function MaterialPage() {
  let materials: any[] = [];

  try {
    const dbMaterials = await getMaterials();
    materials = dbMaterials.map((m) => ({
      id: m.id,
      code: m.code,
      name: m.name,
      unit: m.unit,
      category: m.category || "—",
      defaultPrice: m.defaultPrice || 0,
      minStock: m.minStock || 0,
      stock: Math.floor(Math.random() * 100) + 5, // placeholder until stock tracking is built
    }));
  } catch (e) {
    console.error("DB error:", e);
    // Fallback mock
    materials = [
      { id: "1", code: "MAT-001", name: "Semen Portland PCC 40kg", unit: "zak", category: "Beton", defaultPrice: 62000, minStock: 100, stock: 85 },
      { id: "2", code: "MAT-002", name: "Besi Beton D10 12m", unit: "batang", category: "Besi", defaultPrice: 85000, minStock: 50, stock: 120 },
      { id: "3", code: "MAT-003", name: "Pasir Pasang (Merapi)", unit: "kubik", category: "Agregat", defaultPrice: 350000, minStock: 20, stock: 32 },
    ];
  }

  return <MaterialClient materials={materials} />;
}
