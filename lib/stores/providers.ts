import { create } from "zustand";
import { Provider, ProviderName } from "@/lib/types";
import { MOCK_PROVIDERS } from "@/lib/mock/projects";

interface ProviderStore {
  providers: Provider[];
  isAllConnected: boolean;
  connect: (name: ProviderName) => void;
  disconnect: (name: ProviderName) => void;
  reset: () => void;
}

export const useProviderStore = create<ProviderStore>((set) => ({
  providers: MOCK_PROVIDERS,
  isAllConnected: MOCK_PROVIDERS.every((p) => p.connected),
  connect: (name) =>
    set((state) => {
      const updated = state.providers.map((p) =>
        p.name === name ? { ...p, connected: true, connectedAt: new Date() } : p
      );
      return { providers: updated, isAllConnected: updated.every((p) => p.connected) };
    }),
  disconnect: (name) =>
    set((state) => {
      const updated = state.providers.map((p) =>
        p.name === name ? { ...p, connected: false, connectedAt: null } : p
      );
      return { providers: updated, isAllConnected: false };
    }),
  reset: () => set({ providers: MOCK_PROVIDERS, isAllConnected: MOCK_PROVIDERS.every((p) => p.connected) }),
}));
