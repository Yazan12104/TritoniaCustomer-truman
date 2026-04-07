import { create } from 'zustand';
import { Product } from '../../products/types';
import { CartItem } from '../types';

interface CartState {
  cartItems: CartItem[];
  subtotal: number;
  total: number;

  // Actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  _calculateTotals: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  subtotal: 0,
  total: 0,

  addToCart: (product: Product) => {
    const { cartItems } = get();
    const existingItem = cartItems.find(item => item.productId === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        // Cannot add more than available stock
        return;
      }
      const updatedItems = cartItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      set({ cartItems: updatedItems });
    } else {
      if (product.quantity <= 0) {
        return;
      }
      // Backend uses sort_order === 0 for primary images
      const primaryImage = product.images?.find((img) => img.sort_order === 0)?.image_url 
                        || product.images?.[0]?.image_url;

      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        maxQuantity: product.quantity,
        imageUrl: primaryImage,
      };
      set({ cartItems: [...cartItems, newItem] });
    }
    
    get()._calculateTotals();
  },

  removeFromCart: (productId: string) => {
    const { cartItems } = get();
    set({ cartItems: cartItems.filter(item => item.productId !== productId) });
    get()._calculateTotals();
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    const { cartItems } = get();
    const updatedItems = cartItems.map(item => {
      if (item.productId === productId) {
        // Ensure quantity doesn't exceed maxQuantity
        const safeQuantity = Math.min(quantity, item.maxQuantity);
        return { ...item, quantity: safeQuantity };
      }
      return item;
    });
    set({ cartItems: updatedItems });
    get()._calculateTotals();
  },

  clearCart: () => {
    set({ cartItems: [], subtotal: 0, total: 0 });
  },

  _calculateTotals: () => {
    const { cartItems } = get();
    // Use product price as default unit price
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    set({ subtotal: total, total });
  }
}));
