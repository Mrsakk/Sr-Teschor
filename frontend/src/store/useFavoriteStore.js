import { create } from 'zustand';
import { favoriteApi } from '../api/endpoints';

export const useFavoriteStore = create((set, get) => ({
  destinationIds: new Set(),
  businessIds: new Set(),
  isLoading: false,

  fetchFavorites: async () => {
    try {
      set({ isLoading: true });
      const res = await favoriteApi.getAll();
      const destIds = new Set((res.data.destinations || []).map((d) => d.id));
      const bizIds = new Set((res.data.businesses || []).map((b) => b.id));
      set({ destinationIds: destIds, businessIds: bizIds, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  isFavorited: (type, id) => {
    if (type === 'destination') {
      return get().destinationIds.has(id);
    }
    return get().businessIds.has(id);
  },

  toggleFavorite: async (type, id) => {
    const isCurrentlyFav = get().isFavorited(type, id);

    // Optimistic update
    set((state) => {
      const newDestIds = new Set(state.destinationIds);
      const newBizIds = new Set(state.businessIds);

      if (type === 'destination') {
        if (isCurrentlyFav) newDestIds.delete(id);
        else newDestIds.add(id);
      } else {
        if (isCurrentlyFav) newBizIds.delete(id);
        else newBizIds.add(id);
      }

      return { destinationIds: newDestIds, businessIds: newBizIds };
    });

    try {
      await favoriteApi.toggle(type, id);
    } catch (e) {
      // Revert if error
      get().fetchFavorites();
      throw e;
    }
  },
}));
