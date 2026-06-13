"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AosStagger } from "@/components/ui/aos";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  ActivityChartCard,
  AtRiskStudentsCard,
  EducationKpiGrid,
  GroupPerformanceCard,
  GrowthTrendCard,
  InstitutionInsightsCard,
  InstitutionWelcome,
  ScorePillarsCard,
} from "@/components/institution-dashboard";
import { AddStudentDialog } from "@/components/students/add-student-dialog";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { analyticsApi } from "@/lib/api";
import { adaptAdminDashboard } from "@/lib/adapters/admin-dashboard";
import { downloadAdminDashboardCsv } from "@/lib/admin-dashboard-export";

export default function AdminDashboardPage() {
  const { locale, t } = useLocale();
  const { user, status } = useAuth();
  const [addOpen, setAddOpen] = useState(false);

  const query = useAsync(async () => {
    const [dashboard, atRisk] = await Promise.all([
      analyticsApi.getAdminDashboard(),
      analyticsApi.getAtRiskStudents().catch(() => []),
    ]);
    return adaptAdminDashboard({ dashboard, atRisk, t });
  }, [user?.id, locale, t]);

  const data = query.data;
  const institutionName = t.institution.name;
  const term = t.institution.term;
  const adminName = user?.fullName ?? "Admin";
  const adminEmail = user?.email ?? "";

  return (
    <RouteGuard allow={["ADMIN"]}>
    <DashboardShell role="admin" userName={adminName} userEmail={adminEmail}>
      <Header
        title={t.institution.dashboardTitle}
        description={t.institution.dashboardDesc}
        action={
          <Button
            size="sm"
            className="h-9 gap-1.5 shadow-sm"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {t.common.addStudent}
          </Button>
        }
      />

      {status === "loading" || query.loading ? (
        <LoadingState label={t.pages.adminOverview.loading} />
      ) : query.error || !data ? (
        <ErrorState message={query.error?.message} onRetry={query.reload} />
      ) : (
        <AosStagger className="dashboard-page space-y-6 sm:space-y-8">
          <InstitutionWelcome
            institutionName={institutionName}
            term={term}
            adminName={adminName}
            onExport={() => downloadAdminDashboardCsv(data)}
          />

          <EducationKpiGrid kpis={data.kpis} />

          <div className="grid gap-6 lg:grid-cols-12">
            <GrowthTrendCard
              data={data.growthTrend}
              className="lg:col-span-8"
            />
            <ScorePillarsCard
              pillars={data.pillars}
              overallScore={data.overallScore}
              className="lg:col-span-4"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <GroupPerformanceCard groups={data.topGroups} />
            <AtRiskStudentsCard students={data.atRisk} />
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <ActivityChartCard
              data={data.weeklyActivity}
              className="lg:col-span-5"
            />
            <div className="lg:col-span-7">
              <InstitutionInsightsCard insights={data.insights} />
            </div>
          </div>
        </AosStagger>
      )}
      <AddStudentDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={query.reload}
      />
    </DashboardShell>
    </RouteGuard>
  );
}
