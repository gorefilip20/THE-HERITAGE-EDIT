import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ──────────────────────────────────────────────────────────
   STRICT CART ITEM SHAPE
   Every item requires an explicit size selection.
   ────────────────────────────────────────────────────────── */

export interface StrictCartItem {
  productId: string;
  variantId: string;
  name: string;
  brand: string;
  sizeSelected: string;
  colorSelected: string | null;
  priceCents: number;
  imageUrl: string;
  quantity: number;
  slug: string;
}

export interface CartValidationError {
  field: string;
  message: string;
}

interface CartState {
  items: StrictCartItem[];
  isOpen: boolean;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addItem: (item: StrictCartItem) => CartValidationError[];
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;

  getItem: (productId: string, variantId: string) => StrictCartItem | undefined;
  hasItem: (productId: string, variantId: string) => boolean;

  subtotalCents: () => number;
  itemCount: () => number;
}

const MAX_QUANTITY_PER_ITEM = 10;

function validateCartItem(item: StrictCartItem): CartValidationError[] {
  const errors: CartValidationError[] = [];

  if (!item.productId || item.productId.trim().length === 0) {
    errors.push({ field: "productId", message: "Product ID is required." });
  }

  if (!item.variantId || item.variantId.trim().length === 0) {
    errors.push({ field: "variantId", message: "Variant ID is required." });
  }

  if (!item.sizeSelected || item.sizeSelected.trim().length === 0) {
    errors.push({
      field: "sizeSelected",
      message: "Please select a size before adding to bag.",
    });
  }

  if (!item.name || item.name.trim().length === 0) {
    errors.push({ field: "name", message: "Product name is required." });
  }

  if (!item.brand || item.brand.trim().length === 0) {
    errors.push({ field: "brand", message: "Brand name is required." });
  }

  if (typeof item.priceCents !== "number" || item.priceCents <= 0) {
    errors.push({ field: "priceCents", message: "Price must be a positive value." });
  }

  if (typeof item.quantity !== "number" || item.quantity < 1) {
    errors.push({ field: "quantity", message: "Quantity must be at least 1." });
  }

  if (item.quantity > MAX_QUANTITY_PER_ITEM) {
    errors.push({
      field: "quantity",
      message: `Maximum ${MAX_QUANTITY_PER_ITEM} units per item.`,
    });
  }

  return errors;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (item) => {
        const errors = validateCartItem(item);
        if (errors.length > 0) return errors;

        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId,
          );

          if (existing) {
            const newQty = Math.min(
              existing.quantity + item.quantity,
              MAX_QUANTITY_PER_ITEM,
            );
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, quantity: newQty, priceCents: item.priceCents }
                  : i,
              ),
              isOpen: true,
            };
          }

          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(item.quantity, MAX_QUANTITY_PER_ITEM) },
            ],
            isOpen: true,
          };
        });

        return [];
      },

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId),
          ),
        })),

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) => !(i.productId === productId && i.variantId === variantId),
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId && i.variantId === variantId
                ? { ...i, quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM) }
                : i,
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getItem: (productId, variantId) =>
        get().items.find(
          (i) => i.productId === productId && i.variantId === variantId,
        ),

      hasItem: (productId, variantId) =>
        get().items.some(
          (i) => i.productId === productId && i.variantId === variantId,
        ),

      subtotalCents: () =>
        get().items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "heritage-cart-v2",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
