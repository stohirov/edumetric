import { AlertCircle, BookOpen, FileText, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const typeConfig = {
  enrollment: { icon: UserPlus, color: "bg-indigo-50 text-indigo-600" },
  alert: { icon: AlertCircle, color: "bg-amber-50 text-amber-600" },
  grade: { icon: BookOpen, color: "bg-emerald-50 text-emerald-600" },
  report: { icon: FileText, color: "bg-slate-100 text-slate-600" },
  course: { icon: BookOpen, color: "bg-violet-50 text-violet-600" },
};

interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  time: string;
  type: keyof typeof typeConfig;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
  description?: string;
}

export function ActivityFeed({
  activities,
  title = "Recent Activity",
  description = "Latest updates across your institution",
}: ActivityFeedProps) {
  return (
    <Card className="hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activities.map((activity, index) => {
            const config = typeConfig[activity.type] ?? typeConfig.report;
            const Icon = config.icon;

            return (
              <li
                key={activity.id}
                className={cn(
                  "flex gap-4 pb-4",
                  index < activities.length - 1 && "border-b border-slate-100"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    config.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{activity.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{activity.time}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
