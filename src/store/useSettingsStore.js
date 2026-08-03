import { create } from 'zustand';
import axios from 'axios';

export const useSettingsStore = create((set, get) => ({
    settings: {
        websiteName: 'E-Commerce',
        currency: 'USD',
        gstPercentage: 0,
        isShippingEnabled: true
    },
    loading: false,
    error: null,

    fetchSettings: async () => {
        set({ loading: true });
        try {
            const { data } = await axios.get(`${window.API_BASE_URL}/api/settings`);
            if (data) {
                set({ settings: data, loading: false });
            } else {
                set({ loading: false });
            }
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    getCurrencySymbol: () => {
        const currency = get().settings?.currency || 'USD';
        switch (currency.toUpperCase()) {
            case 'USD': return '$';
            case 'INR': return '₹';
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'AED': return 'د.إ';
            case 'JPY': return '¥';
            case 'CAD': return 'C$';
            case 'AUD': return 'A$';
            default: return currency; // fallback to currency code (e.g. USD)
        }
    }
}));
