import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium",
        variant === "default" && "bg-surface-2 text-text-700",
        variant === "outline" && "border border-border text-text-500",
        className
      )}
    >
      {children}
    </span>
  );
}
