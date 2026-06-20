import { create } from 'zustand';

interface OfflineState {
  isOnline: boolean;
  lastSyncAt: string | null;
  setOnlineStatus: (status: boolean) => void;
  setLastSyncAt: (timestamp: string) => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  isOnline: true,
  lastSyncAt: null,
  setOnlineStatus: (status) => set({ isOnline: status }),
  setLastSyncAt: (timestamp) => set({ lastSyncAt: timestamp }),
}));
