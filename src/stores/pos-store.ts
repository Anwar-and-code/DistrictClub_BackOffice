import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Client, TimeSlot, Terrain } from "@/types/database";

export interface CartItem {
  id: string;
  type: "reservation" | "product" | "service";
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  terrain?: Terrain;
  timeSlot?: TimeSlot;
  reservationDate?: string;
}

export interface POSState {
  items: CartItem[];
  client: Client | null;
  discount: number;
  discountType: "percentage" | "fixed";
  notes: string;
}

export interface POSActions {
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  setClient: (client: Client | null) => void;
  setDiscount: (discount: number, type: "percentage" | "fixed") => void;
  setNotes: (notes: string) => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  clearCart: () => void;
  reset: () => void;
}

const initialState: POSState = {
  items: [],
  client: null,
  discount: 0,
  discountType: "percentage",
  notes: "",
};

export const usePOSStore = create<POSState & POSActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addItem: (item) => {
        const id = crypto.randomUUID();
        set((state) => ({
          items: [...state.items, { ...item, id }],
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateItemQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      setClient: (client) => set({ client }),

      setDiscount: (discount, type) => set({ discount, discountType: type }),

      setNotes: (notes) => set({ notes }),

      getSubtotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.unitPrice * item.quantity,
          0
        );
      },

      getDiscountAmount: () => {
        const { discount, discountType } = get();
        const subtotal = get().getSubtotal();
        if (discountType === "percentage") {
          return (subtotal * discount) / 100;
        }
        return Math.min(discount, subtotal);
      },

      getTotal: () => {
        return get().getSubtotal() - get().getDiscountAmount();
      },

      clearCart: () => set({ items: [] }),

      reset: () => set(initialState),
    }),
    {
      name: "pos-cart-storage",
      partialize: (state) => ({
        items: state.items,
        client: state.client,
        notes: state.notes,
      }),
    }
  )
);
