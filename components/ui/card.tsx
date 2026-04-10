import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className, onClick, hoverable = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-surface border border-border rounded-card p-5 shadow-card transition-all duration-200",
        hoverable && "cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
