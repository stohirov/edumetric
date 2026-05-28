"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type ElementType,
  type ReactElement,
} from "react";
import { cn } from "@/lib/utils";
import { aosAttributes, type AosOptions } from "@/lib/aos";
import { pickStaggerAnimation } from "@/lib/aos-config";

type AosProps = AosOptions & {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
};

export function Aos({
  children,
  className,
  as: Tag = "div",
  animation = "fade-up",
  delay = 0,
  duration = 650,
  offset = 56,
  once = true,
  easing = "ease-out-cubic",
}: AosProps) {
  return (
    <Tag
      className={className}
      {...aosAttributes({ animation, delay, duration, offset, once, easing })}
    >
      {children}
    </Tag>
  );
}

interface AosStaggerProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  duration?: number;
  offset?: number;
  once?: boolean;
  varied?: boolean;
  animation?: AosOptions["animation"];
}

export function AosStagger({
  children,
  className,
  stagger = 80,
  duration = 650,
  offset = 56,
  once = true,
  varied = true,
  animation = "fade-up",
}: AosStaggerProps) {
  return (
    <div className={className}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        const anim = varied ? pickStaggerAnimation(index) : animation;
        const props = aosAttributes({
          animation: anim,
          delay: index * stagger,
          duration,
          offset,
          once,
        });

        return cloneElement(child as ReactElement<{ className?: string }>, {
          ...props,
          className: cn(
            (child as ReactElement<{ className?: string }>).props.className
          ),
        });
      })}
    </div>
  );
}
