import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { Product } from '../../data/products';
import { CartProvider, useCart } from '../CartContext';

const product: Product = { id: 1, title: 'Perfume', price: 9.99, thumbnail: 'https://example.com/1.png', stock: 5, category: 'beauty', discountPercentage: 10 };

test('adds products and totals quantities using integer cents', async () => {
  const { result } = await renderHook(useCart, { wrapper: CartProvider });
  await act(() => {
    result.current.addItem({ ...product, price: 0.1 }, 2);
    result.current.addItem({ ...product, id: 2, price: 0.2 }, 1);
  });
  expect(result.current.items).toHaveLength(2);
  expect(result.current.itemCount).toBe(3);
  expect(result.current.total).toBe(0.4);
});

test('rapid additions merge into one row without exceeding stock', async () => {
  const { result } = await renderHook(useCart, { wrapper: CartProvider });
  await act(() => {
    result.current.addItem(product, 2);
    result.current.addItem(product, 2);
    result.current.addItem(product, 2);
  });
  expect(result.current.items).toEqual([{ product, quantity: 5 }]);
  expect(result.current.itemCount).toBe(5);
  expect(result.current.total).toBe(49.95);
});

test('uses updated product information and a reduced stock limit on add', async () => {
  const { result } = await renderHook(useCart, { wrapper: CartProvider });
  await act(() => result.current.addItem(product, 4));
  const updated = { ...product, title: 'New perfume', price: 8, stock: 2 };
  await act(() => result.current.addItem(updated, 1));
  expect(result.current.items).toEqual([{ product: updated, quantity: 2 }]);
  expect(result.current.total).toBe(16);
});

test('bounds quantities, ignores invalid additions, and removes at zero', async () => {
  const { result } = await renderHook(useCart, { wrapper: CartProvider });
  await act(() => {
    result.current.addItem(product, -1);
    result.current.addItem(product, Number.NaN);
    result.current.addItem({ ...product, stock: 0 }, 1);
  });
  expect(result.current.items).toEqual([]);
  await act(() => result.current.addItem(product, 2.9));
  expect(result.current.itemCount).toBe(2);
  await act(() => result.current.setQuantity(product.id, 100));
  expect(result.current.itemCount).toBe(5);
  await act(() => result.current.setQuantity(product.id, Number.POSITIVE_INFINITY));
  expect(result.current.itemCount).toBe(5);
  await act(() => result.current.setQuantity(product.id, 1.9));
  expect(result.current.itemCount).toBe(1);
  await act(() => result.current.setQuantity(product.id, 0));
  expect(result.current.items).toEqual([]);
  expect(result.current.total).toBe(0);
});

test('retains the cart when screen consumers unmount and remount inside the provider', async () => {
  function Detail() {
    const { addItem } = useCart();
    return <Pressable accessibilityRole="button" onPress={() => addItem(product, 2)}><Text>Add to cart</Text></Pressable>;
  }
  function Cart() {
    const { itemCount } = useCart();
    return <Text>{itemCount} items in cart</Text>;
  }
  const { rerender } = await render(<CartProvider><Detail /></CartProvider>);
  await fireEvent.press(screen.getByRole('button', { name: 'Add to cart' }));
  await rerender(<CartProvider><Cart /></CartProvider>);
  expect(screen.getByText('2 items in cart')).toBeOnTheScreen();
  await rerender(<CartProvider><Detail /></CartProvider>);
  await fireEvent.press(screen.getByRole('button', { name: 'Add to cart' }));
  await rerender(<CartProvider><Cart /></CartProvider>);
  expect(screen.getByText('4 items in cart')).toBeOnTheScreen();
});

test('records a purchase notification with the item count and delivery estimate', async () => {
  const { result } = await renderHook(useCart, { wrapper: CartProvider });
  await act(() => result.current.recordPurchase([{ product, quantity: 2 }]));
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0]).toMatchObject({ title: 'Purchase confirmed', items: '2× Perfume', total: 19.98, viewed: false });
  expect(result.current.notifications[0].message).toMatch(/^2 items purchased\. Estimated delivery .+\.$/);
  await act(() => result.current.markNotificationViewed(result.current.notifications[0].id));
  expect(result.current.notifications[0].viewed).toBe(true);
});
