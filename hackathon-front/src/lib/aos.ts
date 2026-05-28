import type { AosAnimation } from "./aos-config";

export interface AosOptions {
  animation?: AosAnimation;
  delay?: number;
  duration?: number;
  offset?: number;
  once?: boolean;
  easing?: string;
}

export function aosAttributes({
  animation = "fade-up",
  delay = 0,
  duration = 650,
  offset = 56,
  once = true,
  easing = "ease-out-cubic",
}: AosOptions = {}) {
  return {
    "data-aos": animation,
    "data-aos-delay": String(delay),
    "data-aos-duration": String(duration),
    "data-aos-offset": String(offset),
    "data-aos-once": once ? "true" : "false",
    "data-aos-easing": easing,
  } as const;
}
