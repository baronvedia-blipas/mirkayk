"use client";

interface TokenMeterProps {
  percentage: number;
  label?: string;
  size?: number;
}

export function TokenMeter({ percentage, label = "Budget", size = 80 }: TokenMeterProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-2)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--pink-300)" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="text-center">
        <p className="text-sm font-body font-semibold text-text-900">{percentage}%</p>
        <p className="text-xs font-body text-text-500">{label}</p>
      </div>
    </div>
  );
}
