import {
  getProjects,
  getAllExpensesWithProjects,
  getAllPaymentsWithProjects,
  getExpensesSummary,
  getPaymentsSummary,
} from "@/lib/db/queries";
import KeuanganClient from "./KeuanganClient";

export default async function KeuanganPage() {
  let data: any = {
    expenses: [],
    payments: [],
    monthlySummary: [],
    projectSummaries: [],
  };

  try {
    const [expenses, payments, expSummary, paySummary, projects] = await Promise.all([
      getAllExpensesWithProjects(),
      getAllPaymentsWithProjects(),
      getExpensesSummary(),
      getPaymentsSummary(),
      getProjects(),
    ]);

    data.expenses = expenses.map((e) => ({
      ...e,
      date: e.date ? String(e.date) : "",
    }));

    data.payments = payments.map((p) => ({
      ...p,
      date: p.date ? String(p.date) : "",
    }));

    // Build monthly summary combining expenses and payments
    const monthsSet = new Set([
      ...expSummary.map((e) => e.month),
      ...paySummary.map((p) => p.month),
    ]);
    data.monthlySummary = [...monthsSet].sort().map((month) => ({
      month,
      expenses: Number(expSummary.find((e) => e.month === month)?.total) || 0,
      payments: Number(paySummary.find((p) => p.month === month)?.total) || 0,
    }));

    // Project financial summaries
    data.projectSummaries = projects.map((p) => ({
      code: p.code,
      name: p.name,
      contractValue: p.contractValue,
      hppPlan: p.hppPlan,
      hppActual: p.hppActual,
      progress: p.progress,
      status: p.status,
    }));
  } catch (e) {
    console.error("DB error:", e);
  }

  return <KeuanganClient data={data} />;
}
