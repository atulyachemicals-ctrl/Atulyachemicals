import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  chemicalName: string;
  casNumber: string;
  hsnCode: string;
  packaging: string;
  price: number;
  quantity: number;
  weightKg: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  totalAmount: number;
  totalWeight: number;
}

const LOCAL_STORAGE_CART_KEY = 'atulya_cart_items_v2';
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const { customer } = useAuth();

  // Initialize guest session ID and load local cart on mount
  useEffect(() => {
    let storedSessionId = localStorage.getItem('cartSessionId');
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('cartSessionId', storedSessionId);
    }
    setSessionId(storedSessionId);

    // Initial load from LocalStorage for instant UI rendering
    try {
      const storedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse local cart:', e);
    }
  }, []);

  // Sync with Supabase DB whenever session or customer changes
  useEffect(() => {
    if (sessionId) {
      syncWithSupabaseDB();
    }
  }, [sessionId, customer?.id]);

  // Helper to update both React State and LocalStorage
  const saveCartState = (items: CartItem[]) => {
    setCartItems(items);
    try {
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to write to local storage cart:', e);
    }
  };

  const syncWithSupabaseDB = async () => {
    try {
      let query = supabase.from('cart_items').select('*');

      if (customer) {
        query = query.eq('user_id', customer.id);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) {
        // Table may not exist yet or RLS policy not set - fallback silently to LocalStorage
        console.warn('Supabase DB cart fetch warning:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const dbItems: CartItem[] = data.map((item: any) => ({
          id: item.id || `${item.chemical_name}_${item.packaging}`,
          chemicalName: item.chemical_name,
          casNumber: item.cas_number || '',
          hsnCode: item.hsn_code || '',
          packaging: item.packaging,
          price: parseFloat(item.price || 0),
          quantity: parseInt(item.quantity || 1, 10),
          weightKg: parseFloat(item.weight_kg || 0),
        }));

        saveCartState(dbItems);
      } else if (cartItems.length > 0 && customer) {
        // Push existing guest local cart items to database upon user login
        for (const item of cartItems) {
          pushItemToSupabaseDB(item);
        }
      }
    } catch (err) {
      console.warn('Could not sync cart with Supabase:', err);
    }
  };

  const pushItemToSupabaseDB = async (item: CartItem) => {
    try {
      const dbRow: any = {
        chemical_name: item.chemicalName,
        cas_number: item.casNumber,
        hsn_code: item.hsnCode,
        packaging: item.packaging,
        price: item.price,
        quantity: item.quantity,
        weight_kg: item.weightKg,
      };

      if (customer) {
        dbRow.user_id = customer.id;
      } else {
        dbRow.session_id = sessionId;
      }

      await supabase.from('cart_items').insert(dbRow);
    } catch (e) {
      console.warn('Database insert fallback to local storage:', e);
    }
  };

  const addToCart = async (
    item: Omit<CartItem, 'id' | 'quantity'>,
    quantity: number = 1
  ) => {
    setIsLoading(true);
    try {
      const existingIndex = cartItems.findIndex(
        (ci) =>
          ci.chemicalName === item.chemicalName && ci.packaging === item.packaging
      );

      let newItems: CartItem[];

      if (existingIndex > -1) {
        newItems = cartItems.map((ci, idx) =>
          idx === existingIndex
            ? { ...ci, quantity: ci.quantity + quantity }
            : ci
        );
      } else {
        const newItem: CartItem = {
          id: `cart_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          chemicalName: item.chemicalName,
          casNumber: item.casNumber || '',
          hsnCode: item.hsnCode || '',
          packaging: item.packaging,
          price: item.price,
          quantity: quantity,
          weightKg: item.weightKg || 0,
        };
        newItems = [...cartItems, newItem];
      }

      // Update state & LocalStorage immediately
      saveCartState(newItems);

      // Async push to Supabase in background
      const targetItem = newItems.find(
        (ci) => ci.chemicalName === item.chemicalName && ci.packaging === item.packaging
      );
      if (targetItem) {
        pushItemToSupabaseDB(targetItem);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    setIsLoading(true);
    try {
      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }

      const updated = cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );

      saveCartState(updated);

      // Sync with Supabase if table exists
      try {
        const target = cartItems.find((ci) => ci.id === itemId);
        if (target) {
          let dbQuery = supabase
            .from('cart_items')
            .update({ quantity })
            .eq('chemical_name', target.chemicalName)
            .eq('packaging', target.packaging);

          if (customer) {
            dbQuery = dbQuery.eq('user_id', customer.id);
          } else {
            dbQuery = dbQuery.eq('session_id', sessionId);
          }

          await dbQuery;
        }
      } catch (e) {
        console.warn('DB update failed, using local storage:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setIsLoading(true);
    try {
      const target = cartItems.find((ci) => ci.id === itemId);
      const filtered = cartItems.filter((item) => item.id !== itemId);

      saveCartState(filtered);

      if (target) {
        try {
          let dbQuery = supabase
            .from('cart_items')
            .delete()
            .eq('chemical_name', target.chemicalName)
            .eq('packaging', target.packaging);

          if (customer) {
            dbQuery = dbQuery.eq('user_id', customer.id);
          } else {
            dbQuery = dbQuery.eq('session_id', sessionId);
          }

          await dbQuery;
        } catch (e) {
          console.warn('DB delete failed, using local storage:', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    saveCartState([]);
    try {
      if (customer) {
        await supabase.from('cart_items').delete().eq('user_id', customer.id);
      } else if (sessionId) {
        await supabase.from('cart_items').delete().eq('session_id', sessionId);
      }
    } catch (e) {
      console.warn('Clear DB cart failed:', e);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalWeight = cartItems.reduce((sum, item) => sum + item.weightKg * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        cartCount,
        totalAmount,
        totalWeight,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
