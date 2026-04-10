"use client";

import { cn } from "@/lib/utils";

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, className }: SegmentedControlProps<T>) {
  return (
    <div className={cn("inline-flex rounded-btn bg-surface-2 p-1 gap-1", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 rounded-btn text-sm font-body font-medium transition-all duration-200",
            value === opt.value
              ? "bg-surface text-text-900 shadow-card"
              : "text-text-500 hover:text-text-700"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
