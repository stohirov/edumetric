import type { adaptAdminDashboard } from "@/lib/adapters/admin-dashboard";

type DashboardData = ReturnType<typeof adaptAdminDashboard>;

function csvCell(value: string | number): string {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function toCsv(rows: (string | number)[][]): string {
  return rows.map((r) => r.map(csvCell).join(",")).join("\n");
}

export function buildAdminDashboardCsv(data: DashboardData): string {
  const sections: string[] = [];

  sections.push("# KPIs");
  sections.push(
    toCsv([
      ["label", "value", "change", "trend"],
      ...data.kpis.map((k) => [k.label, k.value, k.change, k.trend]),
    ]),
  );

  sections.push("");
  sections.push("# Score pillars");
  sections.push(
    toCsv([
      ["pillar", "score", "target"],
      ...data.pillars.map((p) => [p.label, p.score, p.target]),
    ]),
  );

  sections.push("");
  sections.push("# Growth trend (monthly)");
  sections.push(
    toCsv([
      ["month", "composite", "attendance", "assignments"],
      ...data.growthTrend.map((p) => [
        String(p.name),
        Number(p.value),
        Number(p.attendance),
        Number(p.assignments),
      ]),
    ]),
  );

  sections.push("");
  sections.push("# Weekly activity");
  sections.push(
    toCsv([
      ["weekday", "engagement %", "sessions", "submissions"],
      ...data.weeklyActivity.map((p) => [
        String(p.name),
        Number(p.value),
        Number(p.sessions),
        Number(p.submissions),
      ]),
    ]),
  );

  sections.push("");
  sections.push("# Top groups");
  sections.push(
    toCsv([
      ["group", "students", "avg score"],
      ...data.topGroups.map((g) => [g.name, g.students, g.avgScore]),
    ]),
  );

  sections.push("");
  sections.push("# At-risk students");
  sections.push(
    toCsv([
      ["name", "group", "score", "attendance"],
      ...data.atRisk.map((s) => [s.name, s.group, s.score, s.attendance]),
    ]),
  );

  sections.push("");
  sections.push("# Insights");
  sections.push(
    toCsv([
      ["title", "detail", "time", "type"],
      ...data.insights.map((i) => [i.title, i.detail, i.time, i.type]),
    ]),
  );

  return sections.join("\n");
}

export function downloadAdminDashboardCsv(data: DashboardData): void {
  if (typeof window === "undefined") return;
  const csv = buildAdminDashboardCsv(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `institution-overview-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
