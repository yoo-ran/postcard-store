import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';


export interface CartItem {
  id: string;
  name: string;
  price: number; // in cents (avoid float rounding)
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  // ── Derived (computed inline, not stored) ──
  totalItems: () => number;
  totalPrice: () => number;
  // ── Actions ──
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Derived selectors — call as store.totalItems()
      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      // Add or increment
      addItem: (incoming) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === incoming.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === incoming.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          }
          return { items: [...state.items, { ...incoming, quantity: 1 }] };
        }),

      // Remove entirely
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      // Set exact quantity; removes if ≤ 0
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id) // remove if zero or negative
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      // Wipe everything
      clearCart: () => set({ items: [] }),
    }),

    // ── Persist config ─────────────────────────────────────────────────────
    {
      name: 'cart-storage', // localStorage key
      storage: createJSONStorage(() => localStorage), // swap to sessionStorage if needed
      // Only persist data — skip function references
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
