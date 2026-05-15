import {
  getProjectById,
  getRecentProgressUpdates,
  getWorkItemsForProject,
  getExpensesForProject,
  getPaymentsForProject,
} from "@/lib/db/queries";
import { mockProjects, mockProgressUpdates } from "@/lib/data/mock";
import ProjectDetailClient from "./ProjectDetailClient";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let project: any = null;
  let progressUpdates: any[] = [];
  let workItems: any[] = [];
  let expenses: any[] = [];
  let payments: any[] = [];

  try {
    const dbProject = await getProjectById(id);

    if (dbProject) {
      project = {
        id: dbProject.code,
        name: dbProject.name,
        client: dbProject.client,
        address: dbProject.address || "",
        latitude: dbProject.latitude || -7.75,
        longitude: dbProject.longitude || 110.38,
        startDate: dbProject.startDate ? String(dbProject.startDate) : "",
        endDate: dbProject.endDate ? String(dbProject.endDate) : "",
        contractValue: dbProject.contractValue,
        status: dbProject.status,
        type: dbProject.type || "",
        pic: dbProject.pic || "",
        progress: dbProject.progress,
        hppPlan: dbProject.hppPlan,
        hppActual: dbProject.hppActual,
        workersCount: dbProject.workersCount,
        lastUpdate: dbProject.lastUpdate ? String(dbProject.lastUpdate) : null,
        _dbId: dbProject.id,
      };

      // Fetch related data in parallel
      const [dbUpdates, dbWorkItems, dbExpenses, dbPayments] = await Promise.all([
        getRecentProgressUpdates(10),
        getWorkItemsForProject(dbProject.id),
        getExpensesForProject(dbProject.id),
        getPaymentsForProject(dbProject.id),
      ]);

      progressUpdates = dbUpdates.filter((u) => u.projectId === dbProject.code);

      workItems = dbWorkItems.map((w) => ({
        id: w.id,
        parentId: w.parentId,
        name: w.name,
        unit: w.unit,
        volume: String(w.volume || "0"),
        unitPrice: w.unitPrice || 0,
        currentProgress: w.currentProgress || 0,
        sortOrder: w.sortOrder || 0,
      }));

      expenses = dbExpenses.map((e) => ({
        id: e.id,
        type: e.type,
        amount: e.amount,
        date: e.date ? String(e.date) : "",
        description: e.description || "",
        status: e.status,
      }));

      payments = dbPayments.map((p) => ({
        id: p.id,
        type: p.type,
        amount: p.amount,
        date: p.date ? String(p.date) : "",
        description: p.description || "",
      }));
    }

    // Fallback to mock
    if (!project) {
      const mockProject = mockProjects.find((p) => p.id === id);
      if (mockProject) {
        project = mockProject;
        progressUpdates = mockProgressUpdates.filter((u) => u.projectId === id);
      }
    }
  } catch (e) {
    console.error("DB error:", e);
    const mockProject = mockProjects.find((p) => p.id === id);
    if (mockProject) {
      project = mockProject;
      progressUpdates = mockProgressUpdates.filter((u) => u.projectId === id);
    }
  }

  return (
    <ProjectDetailClient
      project={project}
      progressUpdates={progressUpdates}
      workItems={workItems}
      expenses={expenses}
      payments={payments}
    />
  );
}
