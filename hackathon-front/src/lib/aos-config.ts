export const aosDefaults = {
  duration: 700,
  easing: "ease-out-cubic" as const,
  once: true,
  mirror: false,
  offset: 56,
  delay: 0,
  anchorPlacement: "top-bottom" as const,
};

export type AosAnimation =
  | "fade"
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "zoom-in-up"
  | "zoom-in-down"
  | "zoom-out"
  | "flip-left"
  | "flip-right"
  | "flip-up"
  | "flip-down"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right";

export const staggerAnimations: AosAnimation[] = [
  "fade-up",
  "fade-up",
  "zoom-in",
  "fade-left",
  "fade-right",
  "fade-up",
];

export function pickStaggerAnimation(index: number): AosAnimation {
  return staggerAnimations[index % staggerAnimations.length];
}
