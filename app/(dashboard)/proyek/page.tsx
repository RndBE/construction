import { getProjects } from "@/lib/db/queries";
import { mockProjects } from "@/lib/data/mock";
import ProyekListClient from "./ProyekListClient";

export default async function ProyekPage() {
  let projects: any[];

  try {
    const dbProjects = await getProjects();

    projects = dbProjects.map((p) => ({
      id: p.code,
      name: p.name,
      client: p.client,
      address: p.address || "",
      latitude: p.latitude || -7.75,
      longitude: p.longitude || 110.38,
      startDate: p.startDate ? String(p.startDate) : "",
      endDate: p.endDate ? String(p.endDate) : "",
      contractValue: p.contractValue,
      status: p.status,
      type: p.type || "",
      pic: p.pic || "",
      progress: p.progress,
      hppPlan: p.hppPlan,
      hppActual: p.hppActual,
      workersCount: p.workersCount,
      lastUpdate: p.lastUpdate ? String(p.lastUpdate) : null,
    }));

    if (projects.length === 0) projects = mockProjects as any[];
  } catch (e) {
    console.error("DB error:", e);
    projects = mockProjects as any[];
  }

  return <ProyekListClient projects={projects} />;
}
