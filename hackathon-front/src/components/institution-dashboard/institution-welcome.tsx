"use client";

import { CalendarDays, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/components/providers/locale-provider";

interface InstitutionWelcomeProps {
  institutionName: string;
  term: string;
  adminName: string;
  onExport?: () => void;
}

export function InstitutionWelcome({
  institutionName,
  term,
  adminName,
  onExport,
}: InstitutionWelcomeProps) {
  const t = useT();
  const firstName = adminName.split(" ")[0];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-label mb-1">{institutionName}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-theme text-display sm:text-[1.65rem]">
          {t.institution.goodMorning}, {firstName}
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-theme-muted">
          <CalendarDays className="h-3.5 w-3.5" />
          {term} · {t.institution.overview}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select defaultValue="30d">
          <SelectTrigger className="h-9 w-[160px] border-theme bg-theme-input text-xs font-medium shadow-none">
            <SelectValue placeholder="Davr" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">{t.institution.period["7d"]}</SelectItem>
            <SelectItem value="30d">{t.institution.period["30d"]}</SelectItem>
            <SelectItem value="term">{t.institution.period.term}</SelectItem>
            <SelectItem value="year">{t.institution.period.year}</SelectItem>
          </SelectContent>
        </Select>
        {onExport ? (
          <Button
            variant="secondary"
            size="sm"
            className="h-9 gap-1.5"
            onClick={onExport}
          >
            <Download className="h-3.5 w-3.5" />
            {t.institution.exportReport}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
