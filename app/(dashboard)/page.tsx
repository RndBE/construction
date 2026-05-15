import { getProjects, getDashboardMetrics, getRecentProgressUpdates } from "@/lib/db/queries";
import {
  mockProjects,
  mockMetrics,
  mockProgressUpdates,
  type Project as MockProject,
} from "@/lib/data/mock";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  let projects: any[];
  let metrics: any;
  let updates: any[];

  try {
    // Fetch from MySQL
    const [dbProjects, dbMetrics, dbUpdates] = await Promise.all([
      getProjects(),
      getDashboardMetrics(),
      getRecentProgressUpdates(8),
    ]);

    // Map DB projects to the shape the client expects
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

    metrics = dbMetrics;
    updates = dbUpdates;

    // If DB returned no projects, fall back to mock
    if (projects.length === 0) {
      projects = mockProjects as any[];
      metrics = mockMetrics;
      updates = mockProgressUpdates;
    }
  } catch (e) {
    // Fallback to mock data if DB is unavailable
    console.error("DB error, using mock data:", e);
    projects = mockProjects as any[];
    metrics = mockMetrics;
    updates = mockProgressUpdates;
  }

  return (
    <DashboardClient
      projects={projects}
      metrics={metrics}
      progressUpdates={updates}
    />
  );
}
