"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, roleHomePath } from "@/components/providers/auth-provider";
import { LoadingState } from "@/components/dashboard/data-states";
import type { Role } from "@/types/api";

interface RouteGuardProps {
  children: React.ReactNode;
  allow: Role[];
}

// Client-side gate for dashboard routes. Redirects to /login when not
// authenticated, and to the user's role home when their role isn't allowed.
export function RouteGuard({ children, allow }: RouteGuardProps) {
  const router = useRouter();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated" && user) {
      if (user.mustChangePassword) {
        router.replace("/change-password");
        return;
      }
      if (!allow.includes(user.role)) {
        router.replace(roleHomePath(user.role));
      }
    }
  }, [status, user, allow, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <LoadingState />;
  }
  if (user && (user.mustChangePassword || !allow.includes(user.role))) {
    return <LoadingState />;
  }
  return <>{children}</>;
}
