import type { HomeworkAssignmentDto } from "@/types/api/homework";

type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "destructive"
  | "outline";

/** Maps a homework item's state to a Badge variant. */
export function homeworkStatusVariant(a: HomeworkAssignmentDto): BadgeVariant {
  if (a.graded) return "success";
  if (a.submitted) return "default";
  if (a.overdue) return "destructive";
  return "secondary";
}
