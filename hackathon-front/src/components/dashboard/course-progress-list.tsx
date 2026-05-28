import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Course {
  id: string;
  name: string;
  progress: number;
  grade: string;
  instructor: string;
}

interface CourseProgressListProps {
  courses: Course[];
  title?: string;
  description?: string;
}

export function CourseProgressList({
  courses,
  title = "My Courses",
  description = "Track your progress across enrolled courses",
}: CourseProgressListProps) {
  return (
    <Card className="hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="group rounded-lg border border-slate-100 p-4 transition-all duration-200 hover:border-indigo-100 hover:bg-indigo-50/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-medium text-slate-900 group-hover:text-indigo-700 transition-colors">
                  {course.name}
                </h4>
                <p className="mt-0.5 text-xs text-slate-500">{course.instructor}</p>
              </div>
              <span className="rounded-md bg-indigo-50 px-2 py-1 text-sm font-semibold tabular-nums text-indigo-700">
                {course.grade}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Progress</span>
                <span className="font-medium tabular-nums text-slate-700">
                  {course.progress}%
                </span>
              </div>
              <Progress value={course.progress} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
