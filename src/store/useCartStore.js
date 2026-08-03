import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
    persist(
        (set, get) => ({
            cartItems: [],
            shippingAddress: {},
            paymentMethod: 'PayPal',
            selectedShippingMethod: null,

            addToCart: (item) => {
                const itemExists = get().cartItems.find((x) => x.product === item.product);

                if (itemExists) {
                    set({
                        cartItems: get().cartItems.map((x) =>
                            x.product === itemExists.product ? item : x
                        ),
                    });
                } else {
                    set({ cartItems: [...get().cartItems, item] });
                }
            },

            removeFromCart: (id) => {
                set({
                    cartItems: get().cartItems.filter((x) => x.product !== id),
                });
            },




            saveShippingAddress: (data) => {
                set({ shippingAddress: data });
            },

            savePaymentMethod: (data) => {
                set({ paymentMethod: data });
            },

            saveShippingMethod: (data) => {
                set({ selectedShippingMethod: data });
            },

            clearCart: () => {
                set({ cartItems: [] });
            }
        }), {
            name: 'cart-storage',
        }
    )
);