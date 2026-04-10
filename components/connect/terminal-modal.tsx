"use client";

import { useEffect, useState } from "react";
import { ProviderName, PROVIDER_INFO } from "@/lib/types";

interface TerminalModalProps {
  open: boolean;
  provider: ProviderName | null;
  onClose: () => void;
  onConnected: () => void;
}

const CLI_COMMANDS: Record<ProviderName, string> = {
  claude: "claude auth login",
  codex: "codex auth login",
  gemini: "gemini auth login",
};

export function TerminalModal({ open, provider, onClose, onConnected }: TerminalModalProps) {
  const [typedText, setTypedText] = useState("");
  const [phase, setPhase] = useState<"typing" | "waiting" | "done">("typing");

  useEffect(() => {
    if (!open || !provider) {
      setTypedText("");
      setPhase("typing");
      return;
    }

    const command = `$ ${CLI_COMMANDS[provider]}`;
    let i = 0;
    setTypedText("");
    setPhase("typing");

    const typeInterval = setInterval(() => {
      i++;
      setTypedText(command.slice(0, i));
      if (i >= command.length) {
        clearInterval(typeInterval);
        setPhase("waiting");
        setTimeout(() => {
          setPhase("done");
          setTimeout(() => {
            onConnected();
            onClose();
          }, 600);
        }, 2400);
      }
    }, 60);

    return () => clearInterval(typeInterval);
  }, [open, provider, onConnected, onClose]);

  if (!open || !provider) return null;

  const info = PROVIDER_INFO[provider];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-text-900/50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-card w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-800">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-2 text-gray-400 text-xs font-mono">{info.label} CLI</span>
        </div>
        <div className="p-5 font-mono text-sm min-h-[160px]">
          <p className="text-green-400">
            {typedText}
            {phase === "typing" && <span className="animate-blink">|</span>}
          </p>
          {phase === "waiting" && (
            <div className="mt-3 flex items-center gap-2 text-gray-400">
              <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Waiting for authentication...
            </div>
          )}
          {phase === "done" && (
            <p className="mt-3 text-green-300">
              &#10003; Successfully authenticated with {info.label}!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
