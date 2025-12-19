import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FamilyMember, FAMILY_MEMBERS } from '@/types';

interface UserState {
  // 현재 선택된 사용자
  currentUser: FamilyMember | null;

  // hydration 완료 여부
  hasHydrated: boolean;

  // 사용자 선택
  setCurrentUser: (userId: string) => void;

  // 로그아웃 (사용자 선택 화면으로)
  clearCurrentUser: () => void;

  // 현재 사용자가 자녀인지 확인
  isChild: () => boolean;

  // 현재 사용자가 부모인지 확인
  isParent: () => boolean;

  // hydration 완료 설정
  setHasHydrated: (state: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      hasHydrated: false,

      setCurrentUser: (userId: string) => {
        const user = FAMILY_MEMBERS[userId];
        if (user) {
          set({ currentUser: user });
        }
      },

      clearCurrentUser: () => {
        set({ currentUser: null });
      },

      isChild: () => {
        const user = get().currentUser;
        return user?.role === 'child';
      },

      isParent: () => {
        const user = get().currentUser;
        return user?.role === 'parent';
      },

      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state });
      },
    }),
    {
      name: 'homework-user-storage',
      // localStorage에서 로드 시 최신 FAMILY_MEMBERS 데이터로 병합
      merge: (persistedState: any, currentState) => {
        if (persistedState?.currentUser?.id) {
          const freshUser = FAMILY_MEMBERS[persistedState.currentUser.id];
          return {
            ...currentState,
            currentUser: freshUser || null,
          };
        }
        return { ...currentState, ...persistedState };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
