"use client";

import { cn } from "@/lib/utils";
import { ProviderName, PROVIDER_INFO } from "@/lib/types";

interface ProviderButtonProps {
  provider: ProviderName;
  connected: boolean;
  onClick: () => void;
}

export function ProviderButton({ provider, connected, onClick }: ProviderButtonProps) {
  const info = PROVIDER_INFO[provider];

  return (
    <button
      onClick={onClick}
      disabled={connected}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-card border transition-all duration-200",
        connected
          ? "border-sage-200 bg-sage-100/30"
          : "border-border bg-surface hover:shadow-card-hover hover:-translate-y-0.5"
      )}
    >
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg", info.iconBg)}>
        {info.icon}
      </div>
      <div className="flex-1 text-left">
        <p className="font-display font-semibold text-text-900">
          {info.label} <span className="font-body font-normal text-text-500 text-sm">({info.company})</span>
        </p>
        <p className="text-xs font-body text-text-500">{info.hint}</p>
      </div>
      {connected ? (
        <div className="w-8 h-8 rounded-full bg-sage-200 flex items-center justify-center text-white text-sm font-bold">
          &#10003;
        </div>
      ) : (
        <div className="text-text-500 text-sm font-body">Connect &rarr;</div>
      )}
    </button>
  );
}
