import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SectionPlaceholderProps {
  title: string;
  description?: string;
}

export function SectionPlaceholder({ title, description }: SectionPlaceholderProps) {
  return (
    <div className="p-8">
      <Card className="border-dashed border-slate-200/80 bg-white/60">
        <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
            <Sparkles className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {description && (
            <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
          )}
          <p className="mt-4 text-xs text-slate-400">
            This section uses mock data — connect your API to go live.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
