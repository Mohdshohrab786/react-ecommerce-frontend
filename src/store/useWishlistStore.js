import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

export const useWishlistStore = create((set, get) => ({
    wishlistItems: [],
    loading: false,
    toast: null,

    showToast: (message, type = 'success') => {
        set({ toast: { message, type } });
        setTimeout(() => {
            if (get().toast?.message === message) {
                set({ toast: null });
            }
        }, 3000);
    },

    hideToast: () => set({ toast: null }),

    fetchWishlist: async () => {
        const token = useAuthStore.getState().userInfo?.token;
        if (!token) return;

        set({ loading: true });
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const { data } = await axios.get(`${window.API_BASE_URL}/api/wishlist`, config);
            set({ wishlistItems: data.products || [], loading: false });
        } catch (error) {
            console.error('Error fetching wishlist:', error.message);
            set({ loading: false });
        }
    },

    addToWishlist: async (product) => {
        const token = useAuthStore.getState().userInfo?.token;
        if (!token) return false;

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };
            
            const { data } = await axios.post(
                `${window.API_BASE_URL}/api/wishlist/add`,
                { productId: product._id },
                config
            );
            
            set({ wishlistItems: data.products || [] });
            get().showToast(`${product.name} added to wishlist!`);
            return true;
        } catch (error) {
            console.error('Error adding to wishlist:', error.message);
            get().showToast('Failed to add product to wishlist', 'error');
            return false;
        }
    },

    removeFromWishlist: async (productId) => {
        const token = useAuthStore.getState().userInfo?.token;
        if (!token) return false;

        // Find the product name to display in the toast if possible
        const item = get().wishlistItems.find(p => p._id === productId);
        const name = item ? item.name : 'Product';

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            
            const { data } = await axios.delete(
                `${window.API_BASE_URL}/api/wishlist/remove/${productId}`,
                config
            );
            
            set({ wishlistItems: data.products || [] });
            get().showToast(`${name} removed from wishlist!`);
            return true;
        } catch (error) {
            console.error('Error removing from wishlist:', error.message);
            get().showToast('Failed to remove product from wishlist', 'error');
            return false;
        }
    },

    clearWishlist: () => {
        set({ wishlistItems: [] });
    }
}));
