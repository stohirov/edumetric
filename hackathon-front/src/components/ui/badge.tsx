import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo-600 text-white shadow-sm",
        secondary:
          "border-slate-200/80 bg-slate-50 text-slate-600",
        success:
          "border-emerald-200/60 bg-emerald-50 text-emerald-700",
        warning:
          "border-amber-200/60 bg-amber-50 text-amber-800",
        destructive:
          "border-red-200/60 bg-red-50 text-red-700",
        outline: "border-slate-200/90 bg-white text-slate-600 shadow-[var(--shadow-xs)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
