'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string;
  title: string;
  priceCents: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  notification: string | null;
  syncWithDB: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // 1. Cargar desde localStorage al inicio
  useEffect(() => {
    const savedCart = localStorage.getItem('arena_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    
    // Intentar sincronizar con DB si hay token
    const token = localStorage.getItem('token');
    if (token) syncWithDB();
  }, []);

  // 2. Guardar en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('arena_cart', JSON.stringify(cart));
  }, [cart]);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const syncWithDB = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Primero obtenemos lo que hay en la DB
      const response = await fetch('/api/user/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success && data.data.items) {
        const dbItems = data.data.items.map((item: any) => ({
          id: item.product.id,
          title: item.product.title,
          priceCents: item.product.priceCents,
          image: item.product.images?.[0]?.url || '',
          quantity: item.quantity
        }));

        // Mezclamos local + db (priorizando DB o uniendo, aquí simplificamos tomando DB)
        // Si el carrito local tiene algo y la DB no, subimos lo local
        if (cart.length > 0 && dbItems.length === 0) {
          await pushToDB(cart);
        } else if (dbItems.length > 0) {
          setCart(dbItems);
        }
      }
    } catch (error) {
      console.error('Error syncing cart with DB');
    }
  };

  const pushToDB = async (items: CartItem[]) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch('/api/user/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.id, quantity: i.quantity }))
        })
      });
    } catch (error) {
      console.error('Error pushing cart to DB');
    }
  };

  const addToCart = async (product: any) => {
    if (product.stock <= 0) {
      showNotify('Esta pieza ya ha sido adquirida');
      return;
    }

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      showNotify('Esta gema única ya está en tu bóveda');
      return;
    }
    
    const newItem: CartItem = {
      id: product.id,
      title: product.title,
      priceCents: product.priceCents,
      image: product.images?.[0]?.url || '',
      quantity: 1
    };

    const newCart = [...cart, newItem];
    setCart(newCart);
    showNotify(`¡${product.title} añadida!`);
    
    // Si está logueado, sincronizar
    await pushToDB(newCart);
  };

  const removeFromCart = async (productId: string) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    await pushToDB(newCart);
  };

  const clearCart = async () => {
    setCart([]);
    await pushToDB([]);
  };

  const totalItems = cart.length;
  const totalPrice = cart.reduce((acc, item) => acc + item.priceCents, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice, notification, syncWithDB }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
