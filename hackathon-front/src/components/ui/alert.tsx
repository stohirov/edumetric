import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-3.5 [&>svg+div]:pl-7",
  {
    variants: {
      variant: {
        default:
          "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100",
        destructive:
          "border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:[&>svg]:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm opacity-90", className)} {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription };
