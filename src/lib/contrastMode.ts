import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ContrastModeState {
  contrastMode: boolean;
  toggleContrastMode: () => void;
}

// Create a store for contrast mode
export const useContrastMode = create<ContrastModeState>()(
  persist(
    (set) => ({
      contrastMode: false,
      toggleContrastMode: () => set((state) => ({ contrastMode: !state.contrastMode })),
    }),
    {
      name: 'contrast-mode-storage',
    }
  )
);
