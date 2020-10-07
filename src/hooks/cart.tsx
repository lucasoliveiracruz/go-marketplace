import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CART_STORAGE = '@GoMarketplace:cart';

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const items = await AsyncStorage.getItem(CART_STORAGE);
      if (items) {
        setProducts(JSON.parse(items));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (item: Omit<Product, 'quantity'>) => {
      const newProducts = [...products, { ...item, quantity: 1 }];
      await AsyncStorage.setItem(CART_STORAGE, JSON.stringify(newProducts));
      setProducts(newProducts);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = [] as Product[];

      products.forEach(item => {
        const prod = item;
        if (prod.id === id) {
          prod.quantity += 1;
        }
        newProducts.push(prod);
      });

      await AsyncStorage.setItem(CART_STORAGE, JSON.stringify(newProducts));
      setProducts(newProducts);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = [] as Product[];

      products.forEach(item => {
        const prod = item;

        if (prod.id === id) {
          prod.quantity -= 1;
        }

        if (prod.quantity > 0) {
          newProducts.push(prod);
        }
      });

      await AsyncStorage.setItem(CART_STORAGE, JSON.stringify(newProducts));
      setProducts(newProducts);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
