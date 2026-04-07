import { create } from 'zustand';

interface GlobalErrorState {
  isServerDown: boolean;
  serverErrorMessage: string | null;
  isOffline: boolean;

  setServerDown: (message?: string) => void;
  clearServerDown: () => void;
  setOffline: (isOffline: boolean) => void;
}

export const useGlobalErrorStore = create<GlobalErrorState>((set) => ({
  isServerDown: false,
  serverErrorMessage: null,
  isOffline: false,

  setServerDown: (message?: string) => set({ isServerDown: true, serverErrorMessage: message || null }),
  clearServerDown: () => set({ isServerDown: false, serverErrorMessage: null }),
  setOffline: (isOffline: boolean) => set({ isOffline }),
}));
