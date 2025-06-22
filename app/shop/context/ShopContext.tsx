"use client";
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Cart, CartItem, Wishlist, WishlistItem, ShopContextType } from '../types';

// Action types
type ShopAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: Cart | null }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'UPDATE_CART_ITEM'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_COUPON'; payload: { code: string; discount: number } }
  | { type: 'SET_WISHLIST'; payload: Wishlist | null }
  | { type: 'ADD_TO_WISHLIST'; payload: WishlistItem }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'SET_CART_OPEN'; payload: boolean };

// State interface
interface ShopState {
  cart: Cart | null;
  wishlist: Wishlist | null;
  isCartOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: ShopState = {
  cart: null,
  wishlist: null,
  isCartOpen: false,
  isLoading: false,
  error: null,
};

// Reducer function
function shopReducer(state: ShopState, action: ShopAction): ShopState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
      
    case 'SET_CART':
      return { ...state, cart: action.payload };
      
    case 'ADD_TO_CART': {
      if (!state.cart) {
        const newCart: Cart = {
          id: generateCartId(),
          sessionId: getSessionId(),
          items: [action.payload],
          subtotal: action.payload.totalPrice,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: action.payload.totalPrice,
          currency: 'USD',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return { ...state, cart: newCart };
      }
      
      // Check if item already exists
      const existingItemIndex = state.cart.items.findIndex(
        item => item.productId === action.payload.productId && 
                 JSON.stringify(item.selectedVariants) === JSON.stringify(action.payload.selectedVariants)
      );
      
      let updatedItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        updatedItems = state.cart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity, totalPrice: (item.quantity + action.payload.quantity) * item.price }
            : item
        );
      } else {
        // Add new item
        updatedItems = [...state.cart.items, action.payload];
      }
      
      const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = subtotal * 0.08; // 8% tax rate
      const total = subtotal + tax + state.cart.shipping - state.cart.discount;
      
      const updatedCart = {
        ...state.cart,
        items: updatedItems,
        subtotal,
        tax,
        total,
        updatedAt: new Date(),
      };
      
      return { ...state, cart: updatedCart };
    }
    
    case 'UPDATE_CART_ITEM': {
      if (!state.cart) return state;
      
      const updatedItems = state.cart.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity, totalPrice: action.payload.quantity * item.price }
          : item
      );
      
      const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax + state.cart.shipping - state.cart.discount;
      
      const updatedCart = {
        ...state.cart,
        items: updatedItems,
        subtotal,
        tax,
        total,
        updatedAt: new Date(),
      };
      
      return { ...state, cart: updatedCart };
    }
    
    case 'REMOVE_FROM_CART': {
      if (!state.cart) return state;
      
      const updatedItems = state.cart.items.filter(item => item.id !== action.payload);
      
      if (updatedItems.length === 0) {
        return { ...state, cart: null };
      }
      
      const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax + state.cart.shipping - state.cart.discount;
      
      const updatedCart = {
        ...state.cart,
        items: updatedItems,
        subtotal,
        tax,
        total,
        updatedAt: new Date(),
      };
      
      return { ...state, cart: updatedCart };
    }
    
    case 'CLEAR_CART':
      return { ...state, cart: null };
      
    case 'APPLY_COUPON': {
      if (!state.cart) return state;
      
      const discount = action.payload.discount;
      const total = state.cart.subtotal + state.cart.tax + state.cart.shipping - discount;
      
      const updatedCart = {
        ...state.cart,
        couponCode: action.payload.code,
        discount,
        total,
        updatedAt: new Date(),
      };
      
      return { ...state, cart: updatedCart };
    }
    
    case 'SET_WISHLIST':
      return { ...state, wishlist: action.payload };
      
    case 'ADD_TO_WISHLIST': {
      if (!state.wishlist) {
        const newWishlist: Wishlist = {
          id: generateWishlistId(),
          sessionId: getSessionId(),
          items: [action.payload],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return { ...state, wishlist: newWishlist };
      }
      
      // Check if item already exists
      const existingItem = state.wishlist.items.find(
        item => item.productId === action.payload.productId && 
                 JSON.stringify(item.selectedVariants) === JSON.stringify(action.payload.selectedVariants)
      );
      
      if (existingItem) {
        return state; // Item already in wishlist
      }
      
      const updatedWishlist = {
        ...state.wishlist,
        items: [...state.wishlist.items, action.payload],
        updatedAt: new Date(),
      };
      
      return { ...state, wishlist: updatedWishlist };
    }
    
    case 'REMOVE_FROM_WISHLIST': {
      if (!state.wishlist) return state;
      
      const updatedItems = state.wishlist.items.filter(item => item.id !== action.payload);
      
      if (updatedItems.length === 0) {
        return { ...state, wishlist: null };
      }
      
      const updatedWishlist = {
        ...state.wishlist,
        items: updatedItems,
        updatedAt: new Date(),
      };
      
      return { ...state, wishlist: updatedWishlist };
    }
    
    case 'SET_CART_OPEN':
      return { ...state, isCartOpen: action.payload };
      
    default:
      return state;
  }
}

// Helper functions
function generateCartId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateWishlistId(): string {
  return `wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('shop_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('shop_session_id', sessionId);
  }
  return sessionId;
}

// Create context
const ShopContext = createContext<ShopContextType | null>(null);

// Provider component
interface ShopProviderProps {
  children: ReactNode;
}

export function ShopProvider({ children }: ShopProviderProps) {
  const [state, dispatch] = useReducer(shopReducer, initialState);

  // Load cart and wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('shop_cart');
      if (savedCart) {
        try {
          const cart = JSON.parse(savedCart);
          // Convert date strings back to Date objects
          cart.createdAt = new Date(cart.createdAt);
          cart.updatedAt = new Date(cart.updatedAt);
          cart.items.forEach((item: CartItem) => {
            item.addedAt = new Date(item.addedAt);
          });
          dispatch({ type: 'SET_CART', payload: cart });
        } catch (error) {
          console.error('Failed to load cart from localStorage:', error);
        }
      }

      const savedWishlist = localStorage.getItem('shop_wishlist');
      if (savedWishlist) {
        try {
          const wishlist = JSON.parse(savedWishlist);
          wishlist.createdAt = new Date(wishlist.createdAt);
          wishlist.updatedAt = new Date(wishlist.updatedAt);
          wishlist.items.forEach((item: WishlistItem) => {
            item.addedAt = new Date(item.addedAt);
          });
          dispatch({ type: 'SET_WISHLIST', payload: wishlist });
        } catch (error) {
          console.error('Failed to load wishlist from localStorage:', error);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && state.cart) {
      localStorage.setItem('shop_cart', JSON.stringify(state.cart));
    } else if (typeof window !== 'undefined' && !state.cart) {
      localStorage.removeItem('shop_cart');
    }
  }, [state.cart]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && state.wishlist) {
      localStorage.setItem('shop_wishlist', JSON.stringify(state.wishlist));
    } else if (typeof window !== 'undefined' && !state.wishlist) {
      localStorage.removeItem('shop_wishlist');
    }
  }, [state.wishlist]);

  // Context methods
  const addToCart = async (
    productId: string, 
    quantity: number = 1, 
    variants?: { [key: string]: string }
  ) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // In a real app, you'd fetch product details from API
      // For now, we'll simulate it
      const cartItem: CartItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId,
        quantity,
        price: 100, // This would come from product data
        selectedVariants: variants,
        addedAt: new Date(),
        totalPrice: quantity * 100,
      };

      dispatch({ type: 'ADD_TO_CART', payload: cartItem });
      
      // Analytics tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'add_to_cart', {
          currency: 'USD',
          value: cartItem.totalPrice,
          items: [{
            item_id: productId,
            quantity: quantity,
            price: cartItem.price,
          }],
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    
    dispatch({ type: 'UPDATE_CART_ITEM', payload: { itemId, quantity } });
  };

  const removeFromCart = async (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate API call to validate coupon
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock coupon validation
      const validCoupons: { [key: string]: number } = {
        'SAVE10': 10,
        'WELCOME20': 20,
        'SUMMER15': 15,
      };
      
      const discount = validCoupons[code.toUpperCase()];
      if (discount) {
        dispatch({ type: 'APPLY_COUPON', payload: { code, discount } });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Invalid coupon code' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to apply coupon' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToWishlist = async (
    productId: string, 
    variants?: { [key: string]: string }
  ) => {
    const wishlistItem: WishlistItem = {
      id: `wishlist_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      selectedVariants: variants,
      addedAt: new Date(),
    };

    dispatch({ type: 'ADD_TO_WISHLIST', payload: wishlistItem });
  };

  const removeFromWishlist = async (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: itemId });
  };

  const isInWishlist = (productId: string, variants?: { [key: string]: string }): boolean => {
    if (!state.wishlist) return false;
    
    return state.wishlist.items.some(item => 
      item.productId === productId && 
      JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
    );
  };

  const setIsCartOpen = (open: boolean) => {
    dispatch({ type: 'SET_CART_OPEN', payload: open });
  };

  // Computed values
  const cartItems = state.cart?.items || [];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = state.cart?.total || 0;
  
  const wishlistItems = state.wishlist?.items || [];
  const wishlistCount = wishlistItems.length;

  const contextValue: ShopContextType = {
    // Cart
    cart: state.cart,
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    
    // Wishlist
    wishlist: state.wishlist,
    wishlistItems,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    
    // UI State
    isCartOpen: state.isCartOpen,
    setIsCartOpen,
    isLoading: state.isLoading,
    error: state.error,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
}

// Hook to use shop context
export function useShop(): ShopContextType {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}

export default ShopContext;