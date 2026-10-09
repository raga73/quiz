// src/store.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchAllRatings } from './api';

const REFRESH_INTERVAL = 300_000; // 5 минут

export const useStore = create(
  persist(
    (set, get) => ({
      movies: [],
      shows: [],
      music: [],
      favorites: {},
      currentFact: null,
      lastUpdated: null,
      isRefreshing: false,
      error: null,

      refreshRatings: async () => {
        if (get().isRefreshing) return;
        set({ isRefreshing: true, error: null });

        try {
          const fresh = await fetchAllRatings();
          set({
            movies: fresh.movies,
            shows: fresh.shows,
            music: fresh.music,
            lastUpdated: Date.now(),
            isRefreshing: false,
          });
        } catch (err) {
          console.error('Ошибка загрузки рейтингов:', err);
          set({
            isRefreshing: false,
            error: err.message || 'Не удалось загрузить данные',
          });
        }
      },

      toggleFavorite: (id, type) =>
        set((state) => {
          const next = { ...state.favorites };
          if (next[id]) delete next[id];
          else next[id] = { type, rating: 0 };
          return { favorites: next };
        }),

      setRating: (id, rating) =>
        set((state) => {
          if (!state.favorites[id]) return state;
          return {
            favorites: {
              ...state.favorites,
              [id]: { ...state.favorites[id], rating },
            },
          };
        }),

      isFavorite: (id) => !!get().favorites[id],
      setFact: (fact) => set({ currentFact: fact }),
      clearFavorites: () => set({ favorites: {} }),
    }),
    {
      name: 'hurma-quiz-storage',
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);

let refreshTimer = null;

const startAutoRefresh = () => {
  if (refreshTimer) return;
  useStore.getState().refreshRatings();
  refreshTimer = setInterval(() => {
    useStore.getState().refreshRatings();
  }, REFRESH_INTERVAL);
};

startAutoRefresh();

export const autoRefresh = {
  start: startAutoRefresh,
  stop: () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  },
};
