"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChangePasswordCard } from "@/components/auth/change-password-card";
import { LoginHero } from "@/components/auth/login-hero";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Aos } from "@/components/ui/aos";
import { LoadingState } from "@/components/dashboard/data-states";
import { useAuth, roleHomePath } from "@/components/providers/auth-provider";

// Standalone forced-password-change screen. Authenticated accounts flagged with
// mustChangePassword land here; everyone else is bounced to login or their home.
export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated" && user && !user.mustChangePassword) {
      router.replace(roleHomePath(user.role));
    }
  }, [status, user, router]);

  if (status !== "authenticated" || !user || !user.mustChangePassword) {
    return <LoadingState />;
  }

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      <div className="absolute right-4 top-4 z-50 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <Aos animation="fade-right" duration={800} className="lg:w-[60%]">
        <LoginHero />
      </Aos>

      <Aos
        animation="fade-left"
        delay={120}
        duration={800}
        className="relative flex min-h-[50vh] flex-1 flex-col bg-login-panel lg:min-h-screen lg:w-[40%]"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-indigo-100/40 blur-3xl dark:bg-indigo-900/20" />
          <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-violet-100/30 blur-3xl dark:bg-violet-900/15" />
        </div>
        <ChangePasswordCard />
      </Aos>
    </div>
  );
}
