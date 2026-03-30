import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

interface AppState {
  user: FirebaseUser | null;
  setUser: (user: FirebaseUser | null) => void;
  isAuthLoading: boolean;
  setAuthLoading: (loading: boolean) => void;
  currentGroupId: string | null;
  setCurrentGroupId: (id: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAuthLoading: true,
  setAuthLoading: (loading) => set({ isAuthLoading: loading }),
  currentGroupId: null,
  setCurrentGroupId: (id) => set({ currentGroupId: id }),
}));
