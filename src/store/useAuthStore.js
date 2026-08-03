import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            userInfo: null,

            login: (userData) => {
                set({ userInfo: userData });
            },

            logout: () => {
                set({ userInfo: null });
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);
