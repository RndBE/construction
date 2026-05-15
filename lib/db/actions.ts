"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

// ============================================================
// PROGRESS
// ============================================================

export async function saveProgressLog(formData: {
  workItemId: string;
  projectId: string;
  progress: number;
  weather: "cerah" | "mendung" | "hujan";
  notes: string;
  createdById?: string;
}) {
  const id = randomUUID();
  const today = new Date().toISOString().split("T")[0];

  await db.insert(schema.progressLogs).values({
    id,
    workItemId: formData.workItemId,
    projectId: formData.projectId,
    date: today,
    percentage: String(formData.progress),
    notes: formData.notes || null,
    weather: formData.weather,
    createdById: formData.createdById || null,
  });

  revalidatePath(`/proyek/${formData.projectId}`);
  revalidatePath("/");

  return { success: true, id };
}

// ============================================================
// PROJECT
// ============================================================

export async function createProject(formData: {
  name: string;
  client: string;
  address: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  type: string;
  pic: string;
  latitude?: number;
  longitude?: number;
}) {
  const id = randomUUID();

  // Generate next code
  const existing = await db
    .select({ code: schema.projects.code })
    .from(schema.projects)
    .orderBy(schema.projects.code);

  const lastCode = existing.length > 0 ? existing[existing.length - 1].code : "PRJ-000";
  const nextNum = parseInt(lastCode.split("-")[1]) + 1;
  const code = `PRJ-${String(nextNum).padStart(3, "0")}`;

  await db.insert(schema.projects).values({
    id,
    code,
    name: formData.name,
    client: formData.client,
    address: formData.address,
    startDate: formData.startDate,
    endDate: formData.endDate,
    contractValue: formData.contractValue,
    type: formData.type || null,
    latitude: formData.latitude || null,
    longitude: formData.longitude || null,
    status: "perencanaan",
  });

  revalidatePath("/proyek");
  revalidatePath("/");

  return { success: true, id, code };
}

// ============================================================
// WORKERS
// ============================================================

export async function createWorker(formData: {
  name: string;
  skill: "batu" | "kayu" | "besi" | "las" | "finishing" | "listrik" | "pipa";
  dailyRate: number;
  phone: string;
}) {
  const id = randomUUID();

  // Generate next code
  const existing = await db
    .select({ code: schema.workers.code })
    .from(schema.workers)
    .orderBy(schema.workers.code);

  const lastCode = existing.length > 0 ? existing[existing.length - 1].code : "TK-000";
  const nextNum = parseInt(lastCode.split("-")[1]) + 1;
  const code = `TK-${String(nextNum).padStart(3, "0")}`;

  await db.insert(schema.workers).values({
    id,
    code,
    name: formData.name,
    skill: formData.skill,
    dailyRate: formData.dailyRate,
    phone: formData.phone || null,
  });

  revalidatePath("/tukang");

  return { success: true, id, code };
}

// ============================================================
// MATERIALS
// ============================================================

export async function createMaterial(formData: {
  name: string;
  unit: string;
  defaultPrice: number;
  category: string;
  minStock: number;
}) {
  const id = randomUUID();

  const existing = await db
    .select({ code: schema.materials.code })
    .from(schema.materials)
    .orderBy(schema.materials.code);

  const lastCode = existing.length > 0 ? existing[existing.length - 1].code : "MAT-000";
  const nextNum = parseInt(lastCode.split("-")[1]) + 1;
  const code = `MAT-${String(nextNum).padStart(3, "0")}`;

  await db.insert(schema.materials).values({
    id,
    code,
    name: formData.name,
    unit: formData.unit,
    defaultPrice: formData.defaultPrice,
    category: formData.category || null,
    minStock: formData.minStock || 0,
  });

  revalidatePath("/material");

  return { success: true, id, code };
}
