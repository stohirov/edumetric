import type { AdminAnalyticsData } from "@/types/admin-analytics";

function csvCell(value: string | number): string {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows: (string | number)[][]): string {
  return rows.map((r) => r.map(csvCell).join(",")).join("\n");
}

export function buildAnalyticsCsv(data: AdminAnalyticsData): string {
  const sections: string[] = [];

  sections.push("# KPIs");
  sections.push(
    toCsv([
      ["label", "value", "format"],
      ...data.kpis.map((k) => [k.label, k.value, k.format]),
    ]),
  );

  sections.push("");
  sections.push("# Score distribution");
  sections.push(
    toCsv([
      ["grade", "count", "percentage"],
      ...data.scoreDistribution.map((b) => [b.grade, b.count, b.percentage]),
    ]),
  );

  sections.push("");
  sections.push("# Top groups");
  sections.push(
    toCsv([
      ["group", "students", "avgScore"],
      ...data.topGroups.map((g) => [g.name, g.students, g.avgScore]),
    ]),
  );

  sections.push("");
  sections.push("# At-risk students");
  sections.push(
    toCsv([
      ["name", "group", "score", "attendance", "riskScore"],
      ...data.atRiskStudents.map((s) => [
        s.name,
        s.group,
        s.score,
        s.attendance,
        s.riskScore,
      ]),
    ]),
  );

  sections.push("");
  sections.push("# Teacher activity");
  sections.push(
    toCsv([
      ["teacher", "action", "detail"],
      ...data.teacherActivity.map((t) => [t.teacherName, t.action, t.detail]),
    ]),
  );

  return sections.join("\n");
}

export function downloadAnalyticsCsv(data: AdminAnalyticsData): void {
  if (typeof window === "undefined") return;
  const csv = buildAnalyticsCsv(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `analytics-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
