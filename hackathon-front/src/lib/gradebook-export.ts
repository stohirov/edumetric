import type { GradebookDto } from "@/types/api/gradebook";

function csvCell(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows: (string | number | null)[][]): string {
  return rows.map((r) => r.map(csvCell).join(",")).join("\n");
}

/** Renders the gradebook matrix as a CSV: one row per student, one column per assignment + course total. */
export function buildGradebookCsv(data: GradebookDto): string {
  const header: (string | number)[] = [
    "Student",
    "Group",
    ...data.columns.map((c) => `${c.name} (/${c.maxValue ?? "—"})`),
    "Course %",
    "Grade",
  ];

  const rows: (string | number | null)[][] = data.rows.map((row) => {
    const cellByKey = new Map(row.cells.map((c) => [c.key, c]));
    const cellValues = data.columns.map((col) => {
      const cell = cellByKey.get(col.key);
      if (cell?.value != null) return cell.value;
      if (cell?.submitted) return "submitted";
      return "";
    });
    return [
      row.studentName,
      row.groupName,
      ...cellValues,
      row.coursePercent != null ? Math.round(row.coursePercent) : "",
      row.display ?? "",
    ];
  });

  return toCsv([header, ...rows]);
}

/** Triggers a client-side download of the gradebook CSV. */
export function downloadGradebookCsv(data: GradebookDto): void {
  if (typeof window === "undefined") return;
  const csv = buildGradebookCsv(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = data.courseName.replace(/[^A-Za-z0-9]+/g, "-").toLowerCase();
  a.href = url;
  a.download = `gradebook-${slug}-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
