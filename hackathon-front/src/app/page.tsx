"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, roleHomePath } from "@/components/providers/auth-provider";
import { LoadingState } from "@/components/dashboard/data-states";

export default function HomePage() {
  const router = useRouter();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated" && user) {
      router.replace(roleHomePath(user.role));
    } else {
      router.replace("/login");
    }
  }, [status, user, router]);

  return <LoadingState />;
}
