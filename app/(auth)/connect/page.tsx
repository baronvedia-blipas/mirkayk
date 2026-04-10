"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProviderStore } from "@/lib/stores/providers";
import { ProviderName } from "@/lib/types";
import { ProviderButton } from "@/components/connect/provider-button";
import { TerminalModal } from "@/components/connect/terminal-modal";
import { Confetti } from "@/components/connect/confetti";
import { BotanicalDecor } from "@/components/shared/botanical-decor";
import { Button } from "@/components/ui/button";

export default function ConnectPage() {
  const router = useRouter();
  const { providers, isAllConnected, connect } = useProviderStore();
  const [activeProvider, setActiveProvider] = useState<ProviderName | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const hasAnyConnected = providers.some((p) => p.connected);

  const handleConnect = (name: ProviderName) => {
    setActiveProvider(name);
  };

  const handleConnected = () => {
    if (activeProvider) {
      connect(activeProvider);
      const willAllBeConnected = providers.every((p) => p.connected || p.name === activeProvider);
      if (willAllBeConnected) {
        setShowConfetti(true);
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <BotanicalDecor position="top-left" />
      <BotanicalDecor position="top-right" />
      <BotanicalDecor position="bottom-left" />
      <BotanicalDecor position="bottom-right" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl italic text-text-900">mirkayk</h1>
          <p className="font-body text-text-500 mt-1">your ai dev team, blooming</p>
        </div>

        <div className="bg-surface border border-border rounded-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-text-900 mb-1">Connect your AI accounts</h2>
          <p className="font-body text-sm text-text-500 mb-5">
            Link your existing subscriptions. No API keys needed.
          </p>

          <div className="flex flex-col gap-3">
            {providers.map((p) => (
              <ProviderButton
                key={p.name}
                provider={p.name}
                connected={p.connected}
                onClick={() => handleConnect(p.name)}
              />
            ))}
          </div>

          <div className="mt-6">
            <Button
              onClick={() => router.push("/dashboard")}
              disabled={!hasAnyConnected}
              className="w-full"
            >
              Continue to dashboard &rarr;
            </Button>
          </div>

          <p className="text-xs text-text-500 text-center mt-4 font-body">
            Your subscription tokens are used directly. mirkayk never stores credentials.
          </p>
        </div>
      </div>

      <TerminalModal
        open={activeProvider !== null}
        provider={activeProvider}
        onClose={() => setActiveProvider(null)}
        onConnected={handleConnected}
      />

      <Confetti active={showConfetti} />
    </main>
  );
}
