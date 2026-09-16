import { createContext, PropsWithChildren, useCallback, useContext, useState } from 'react';

import { Product } from '../data/products';

export type CartItem = { product: Product; quantity: number };
export type PurchaseNotification = { id: number; title: string; message: string; createdAt: string };
type CartState = {
  items: CartItem[];
  itemCount: number;
  total: number;
  notifications: PurchaseNotification[];
  addItem: (product: Product, quantity: number) => void;
  setQuantity: (id: number, quantity: number) => void;
  recordPurchase: (items: CartItem[]) => PurchaseNotification | null;
};

const CartContext = createContext<CartState | null>(null);
const clamp = (quantity: number, stock: number) => Math.min(stock, Math.max(0, Math.floor(quantity)));

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<PurchaseNotification[]>([]);
  const addItem = useCallback((product: Product, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity < 1) return;
    // Functional updates keep rapid additions within the latest stock limit.
    setItems(previous => {
      const existing = previous.find(item => item.product.id === product.id);
      const next = { product, quantity: clamp((existing?.quantity ?? 0) + Math.floor(quantity), product.stock) };
      return (existing ? previous.map(item => item === existing ? next : item) : [...previous, next])
        .filter(item => item.quantity > 0);
    });
  }, []);
  const setQuantity = useCallback((id: number, quantity: number) => {
    if (!Number.isFinite(quantity)) return;
    setItems(previous => previous.map(item => item.product.id === id
      ? { ...item, quantity: clamp(quantity, item.product.stock) } : item).filter(item => item.quantity > 0));
  }, []);
  const recordPurchase = useCallback((purchased: CartItem[]) => {
    const count = purchased.reduce((sum, item) => sum + item.quantity, 0);
    if (!count) return null;
    const createdAt = new Date();
    const delivery = new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000);
    const notification = {
      id: createdAt.getTime(),
      title: 'Purchase confirmed',
      message: `${count} ${count === 1 ? 'item' : 'items'} purchased. Estimated delivery ${delivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
      createdAt: createdAt.toISOString(),
    };
    setNotifications(previous => [notification, ...previous]);
    return notification;
  }, []);

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  // Sum integer cents so quantity changes do not accumulate floating-point errors.
  const total = items.reduce((cents, item) => cents + Math.round(item.product.price * 100) * item.quantity, 0) / 100;
  return <CartContext.Provider value={{ items, itemCount, total, notifications, addItem, setQuantity, recordPurchase }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error('useCart must be used inside CartProvider.');
  return cart;
}
