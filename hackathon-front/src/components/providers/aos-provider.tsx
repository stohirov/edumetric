"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";
import { aosDefaults } from "@/lib/aos-config";

export function AosProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    AOS.init(aosDefaults);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      AOS.refresh();
    }, 100);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return children;
}
