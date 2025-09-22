// store/glucoseStore.js
import { create } from 'zustand';

export interface GlucoseLog {
  id: string;
  value: number;
  context: string;
  takenAt: string;
}

interface GlucoseStore {
  logs: GlucoseLog[];
  setLogs: (logs: GlucoseLog[]) => void;
  addLog: (log: GlucoseLog) => void;
  removeLog: (id: string) => void;
}

export const useGlucoseStore = create<GlucoseStore>((set) => ({
  logs: [],
  setLogs: (logs) => set({ logs }),
  addLog: (log) =>
    set((state) => ({ logs: [log, ...state.logs] })), // prepend new log
  removeLog: (id) =>
    set((state) => ({ logs: state.logs.filter((log) => log.id !== id) })),
}));
