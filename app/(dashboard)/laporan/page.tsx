import { getProjects } from "@/lib/db/queries";
import { mockProjects } from "@/lib/data/mock";
import LaporanClient from "./LaporanClient";

export default async function LaporanPage() {
  let projects: any[] = [];

  try {
    const dbProjects = await getProjects();
    projects = dbProjects.map((p) => ({
      id: p.code,
      name: p.name,
      client: p.client,
      progress: p.progress,
      contractValue: p.contractValue,
      hppActual: p.hppActual,
      status: p.status,
      lastUpdate: p.lastUpdate ? String(p.lastUpdate) : null,
    }));
  } catch {
    projects = mockProjects.map((p) => ({
      id: p.id,
      name: p.name,
      client: p.client,
      progress: p.progress,
      contractValue: p.contractValue,
      hppActual: p.hppActual,
      status: p.status,
      lastUpdate: p.lastUpdate,
    }));
  }

  return <LaporanClient projects={projects} />;
}
