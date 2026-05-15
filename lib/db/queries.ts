import "server-only";
import { db } from ".";
import * as schema from "./schema";
import { eq, desc, asc, sql, and, count, sum, between } from "drizzle-orm";

// ============================================================
// PROJECTS
// ============================================================

export async function getProjects() {
  const rows = await db
    .select({
      id: schema.projects.id,
      code: schema.projects.code,
      name: schema.projects.name,
      client: schema.projects.client,
      address: schema.projects.address,
      latitude: schema.projects.latitude,
      longitude: schema.projects.longitude,
      startDate: schema.projects.startDate,
      endDate: schema.projects.endDate,
      contractValue: schema.projects.contractValue,
      status: schema.projects.status,
      type: schema.projects.type,
      picId: schema.projects.picId,
      createdAt: schema.projects.createdAt,
      updatedAt: schema.projects.updatedAt,
    })
    .from(schema.projects)
    .orderBy(asc(schema.projects.code));

  // For each project, get latest progress & expense totals
  const results = await Promise.all(
    rows.map(async (project) => {
      // Get total expenses (HPP aktual)
      const [expenseResult] = await db
        .select({ total: sum(schema.expenses.amount) })
        .from(schema.expenses)
        .where(eq(schema.expenses.projectId, project.id));

      // Get worker count from attendance (distinct workers in last 30 days)
      const [workerResult] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${schema.attendance.workerId})` })
        .from(schema.attendance)
        .where(eq(schema.attendance.projectId, project.id));

      // Get progress — weighted average of leaf work items
      const leafItems = await db
        .select({
          id: schema.workItems.id,
          unitPrice: schema.workItems.unitPrice,
          volume: schema.workItems.volume,
        })
        .from(schema.workItems)
        .where(
          and(
            eq(schema.workItems.projectId, project.id),
            sql`${schema.workItems.parentId} IS NOT NULL`
          )
        );

      let totalWeight = 0;
      let weightedProgress = 0;
      for (const item of leafItems) {
        const weight = (item.unitPrice || 0) * parseFloat(String(item.volume) || "1");
        const [latestLog] = await db
          .select({ pct: schema.progressLogs.percentage })
          .from(schema.progressLogs)
          .where(eq(schema.progressLogs.workItemId, item.id))
          .orderBy(desc(schema.progressLogs.date))
          .limit(1);
        const pct = latestLog?.pct ? parseFloat(String(latestLog.pct)) : 0;
        totalWeight += weight;
        weightedProgress += weight * pct;
      }
      const overallProgress =
        totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;

      // Get last update date
      const [lastLog] = await db
        .select({ date: schema.progressLogs.date })
        .from(schema.progressLogs)
        .where(eq(schema.progressLogs.projectId, project.id))
        .orderBy(desc(schema.progressLogs.date))
        .limit(1);

      // HPP plan = sum of (volume * unitPrice) for leaf items
      let hppPlanTotal = 0;
      for (const item of leafItems) {
        hppPlanTotal += (item.unitPrice || 0) * parseFloat(String(item.volume) || "0");
      }

      return {
        ...project,
        progress: overallProgress,
        hppPlan: hppPlanTotal > 0 ? hppPlanTotal : Math.round(project.contractValue * 0.82),
        hppActual: Number(expenseResult?.total) || 0,
        workersCount: Number(workerResult?.count) || 0,
        lastUpdate: lastLog?.date || null,
        pic: "", // will be resolved below
      };
    })
  );

  // Resolve PIC names
  const userIds = [...new Set(results.map((r) => r.picId).filter(Boolean))];
  if (userIds.length > 0) {
    const usersData = await db
      .select({ id: schema.users.id, name: schema.users.name })
      .from(schema.users);
    const userMap = new Map(usersData.map((u) => [u.id, u.name]));
    for (const r of results) {
      r.pic = r.picId ? userMap.get(r.picId) || "" : "";
    }
  }

  return results;
}

export async function getProjectById(id: string) {
  const projects = await getProjects();
  return projects.find((p) => p.id === id || p.code === id) || null;
}

// ============================================================
// METRICS
// ============================================================

export async function getDashboardMetrics() {
  const projects = await getProjects();
  const aktif = projects.filter((p) => p.status === "berjalan");

  const totalNilaiKontrak = projects.reduce(
    (s, p) => s + p.contractValue,
    0
  );
  const totalHppPlan = projects.reduce((s, p) => s + p.hppPlan, 0);
  const totalHppActual = projects.reduce((s, p) => s + p.hppActual, 0);

  // Workers
  const [workerCount] = await db
    .select({ count: count() })
    .from(schema.workers)
    .where(eq(schema.workers.isActive, true));

  return {
    totalProyek: projects.length,
    proyekAktif: aktif.length,
    totalNilaiKontrak,
    totalMargin: totalNilaiKontrak - totalHppPlan,
    hppVariance:
      totalHppPlan > 0
        ? Math.round(((totalHppActual - totalHppPlan) / totalHppPlan) * 100 * 10) / 10
        : 0,
    totalTukang: Number(workerCount?.count) || 0,
  };
}

// ============================================================
// PROGRESS UPDATES
// ============================================================

export async function getRecentProgressUpdates(limit = 10) {
  const rows = await db
    .select({
      id: schema.progressLogs.id,
      date: schema.progressLogs.date,
      percentage: schema.progressLogs.percentage,
      notes: schema.progressLogs.notes,
      weather: schema.progressLogs.weather,
      projectId: schema.progressLogs.projectId,
      projectCode: schema.projects.code,
      projectName: schema.projects.name,
      workItemName: schema.workItems.name,
      mandorName: schema.users.name,
    })
    .from(schema.progressLogs)
    .innerJoin(
      schema.projects,
      eq(schema.progressLogs.projectId, schema.projects.id)
    )
    .innerJoin(
      schema.workItems,
      eq(schema.progressLogs.workItemId, schema.workItems.id)
    )
    .leftJoin(
      schema.users,
      eq(schema.progressLogs.createdById, schema.users.id)
    )
    .orderBy(desc(schema.progressLogs.date), desc(schema.progressLogs.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    projectId: r.projectCode,
    projectName: r.projectName,
    itemPekerjaan: r.workItemName,
    progress: Number(r.percentage) || 0,
    date: r.date ? String(r.date) : "",
    weather: r.weather || "cerah",
    mandor: r.mandorName || "—",
    notes: r.notes || "",
  }));
}

// ============================================================
// WORKERS
// ============================================================

export async function getWorkers() {
  return db
    .select()
    .from(schema.workers)
    .orderBy(asc(schema.workers.code));
}

// ============================================================
// MATERIALS
// ============================================================

export async function getMaterials() {
  return db
    .select()
    .from(schema.materials)
    .orderBy(asc(schema.materials.code));
}

// ============================================================
// WORK ITEMS (for a project)
// ============================================================

export async function getWorkItemsForProject(projectId: string) {
  const items = await db
    .select()
    .from(schema.workItems)
    .where(eq(schema.workItems.projectId, projectId))
    .orderBy(asc(schema.workItems.sortOrder));

  // Get latest progress for each
  const withProgress = await Promise.all(
    items.map(async (item) => {
      const [latest] = await db
        .select({ percentage: schema.progressLogs.percentage })
        .from(schema.progressLogs)
        .where(eq(schema.progressLogs.workItemId, item.id))
        .orderBy(desc(schema.progressLogs.date))
        .limit(1);

      return {
        ...item,
        currentProgress: Number(latest?.percentage) || 0,
      };
    })
  );

  return withProgress;
}

// ============================================================
// PROGRESS LOGS (for S-Curve)
// ============================================================

export async function getProgressLogsForProject(projectId: string) {
  return db
    .select({
      id: schema.progressLogs.id,
      date: schema.progressLogs.date,
      percentage: schema.progressLogs.percentage,
      notes: schema.progressLogs.notes,
      weather: schema.progressLogs.weather,
      workItemId: schema.progressLogs.workItemId,
      workItemName: schema.workItems.name,
    })
    .from(schema.progressLogs)
    .innerJoin(
      schema.workItems,
      eq(schema.progressLogs.workItemId, schema.workItems.id)
    )
    .where(eq(schema.progressLogs.projectId, projectId))
    .orderBy(asc(schema.progressLogs.date));
}

// ============================================================
// EXPENSES (for Keuangan)
// ============================================================

export async function getExpensesSummary() {
  const rows = await db
    .select({
      month: sql<string>`DATE_FORMAT(${schema.expenses.date}, '%Y-%m')`,
      total: sum(schema.expenses.amount),
    })
    .from(schema.expenses)
    .groupBy(sql`DATE_FORMAT(${schema.expenses.date}, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(${schema.expenses.date}, '%Y-%m')`);

  return rows;
}

export async function getPaymentsSummary() {
  const rows = await db
    .select({
      month: sql<string>`DATE_FORMAT(${schema.payments.date}, '%Y-%m')`,
      total: sum(schema.payments.amount),
    })
    .from(schema.payments)
    .groupBy(sql`DATE_FORMAT(${schema.payments.date}, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(${schema.payments.date}, '%Y-%m')`);

  return rows;
}

// ============================================================
// EXPENSES/PAYMENTS per Project
// ============================================================

export async function getExpensesForProject(projectId: string) {
  return db
    .select()
    .from(schema.expenses)
    .where(eq(schema.expenses.projectId, projectId))
    .orderBy(desc(schema.expenses.date));
}

export async function getPaymentsForProject(projectId: string) {
  return db
    .select()
    .from(schema.payments)
    .where(eq(schema.payments.projectId, projectId))
    .orderBy(desc(schema.payments.date));
}

// For Keuangan page — all expenses with project info
export async function getAllExpensesWithProjects() {
  return db
    .select({
      id: schema.expenses.id,
      type: schema.expenses.type,
      amount: schema.expenses.amount,
      date: schema.expenses.date,
      description: schema.expenses.description,
      status: schema.expenses.status,
      projectCode: schema.projects.code,
      projectName: schema.projects.name,
    })
    .from(schema.expenses)
    .innerJoin(schema.projects, eq(schema.expenses.projectId, schema.projects.id))
    .orderBy(desc(schema.expenses.date));
}

export async function getAllPaymentsWithProjects() {
  return db
    .select({
      id: schema.payments.id,
      type: schema.payments.type,
      amount: schema.payments.amount,
      date: schema.payments.date,
      description: schema.payments.description,
      projectCode: schema.projects.code,
      projectName: schema.projects.name,
    })
    .from(schema.payments)
    .innerJoin(schema.projects, eq(schema.payments.projectId, schema.projects.id))
    .orderBy(desc(schema.payments.date));
}
