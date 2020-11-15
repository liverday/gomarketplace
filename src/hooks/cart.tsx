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

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  console.log('cart_provider', products);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem('@GO_MARKETPLACE/cart_products');

      if (productsStorage)
        setProducts(JSON.parse(productsStorage))
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const foundIndex = products.findIndex(innerProduct => product.id === innerProduct.id);

    if (foundIndex >= 0) {
      increment(product.id);
      return;
    }

    const newProducts = [...products, {
      ...product,
      quantity: 1
    }];

    setProducts(newProducts);
    await AsyncStorage.setItem('@GO_MARKETPLACE/cart_products', JSON.stringify(newProducts));
  }, [products]);

  const increment = useCallback(async id => {
    const productIndex = products.findIndex(product => product.id === id);
    const newProducts = [...products];

    if (productIndex >= 0) {
      const oldProduct = newProducts[productIndex];
      const newProduct = {
        ...oldProduct,
        quantity: oldProduct.quantity + 1,
      }

      newProducts[productIndex] = newProduct;

      setProducts(newProducts);
      await AsyncStorage.setItem('@GO_MARKETPLACE/cart_products', JSON.stringify(newProducts));
    }

  }, [products]);

  const decrement = useCallback(async id => {
    const productIndex = products.findIndex(product => product.id === id);
    let newProducts = [...products];

    if (productIndex >= 0) {
      const oldProduct = newProducts[productIndex];

      if (oldProduct.quantity - 1 <= 0) {
        newProducts = newProducts.filter(product => product.id !== id);
      } else {
        const newProduct = {
          ...oldProduct,
          quantity: oldProduct.quantity - 1,
        }

        newProducts[productIndex] = newProduct;
      }

      setProducts(newProducts);
      await AsyncStorage.setItem('@GO_MARKETPLACE/cart_products', JSON.stringify(newProducts));
    }
  }, [products]);

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
