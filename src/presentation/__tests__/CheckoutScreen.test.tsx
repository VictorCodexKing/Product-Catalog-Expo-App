import { fireEvent, render, screen } from '@testing-library/react-native';
import { ComponentProps, useEffect } from 'react';
import { Text } from 'react-native';

import { CartProvider, useCart } from '../CartContext';
import CheckoutScreen from '../CheckoutScreen';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
const navigation = { goBack: jest.fn(), popTo: jest.fn() } as unknown as ComponentProps<typeof CheckoutScreen>['navigation'];
const perfume = { id: 1, title: 'Perfume', price: 9.99, thumbnail: '', stock: 5, category: 'beauty', discountPercentage: 10 };
const soap = { ...perfume, id: 2, title: 'Soap', price: 1.25 };

function Checkout({ direct = false, quantity = 2 }: { direct?: boolean; quantity?: number }) {
  const { addItem, itemCount, notifications } = useCart();
  useEffect(() => { addItem(perfume, quantity); }, [addItem, quantity]);
  return <>
    <Text>Cart count: {itemCount}</Text>
    <Text>Notification count: {notifications.length}</Text>
    <CheckoutScreen navigation={navigation} route={{ key: 'checkout', name: 'Checkout', params: direct ? { buyNow: { product: soap, quantity: 3 } } : undefined }} />
  </>;
}

test('reviews discounted cart totals and clears the cart only after demo confirmation', async () => {
  await render(<CartProvider><Checkout /></CartProvider>);
  expect(screen.getByText('Perfume')).toBeOnTheScreen();
  expect(screen.getByText('$19.98')).toBeOnTheScreen();
  expect(screen.getByText('Quantity: 2')).toBeOnTheScreen();
  expect(screen.getByText('Cart count: 2')).toBeOnTheScreen();
  expect(screen.getByLabelText('Before discount: $11.10')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Place demo order' }));
  expect(screen.getByText('Order confirmed')).toBeOnTheScreen();
  expect(screen.getByText('Notification count: 1')).toBeOnTheScreen();
  expect(screen.getByText(/2 items purchased\. Estimated delivery/)).toBeOnTheScreen();
  expect(screen.getByText('Cart count: 0')).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Place demo order' })).toBeNull();
});

test('Buy Now reviews only the selected product and keeps the existing cart after confirmation', async () => {
  await render(<CartProvider><Checkout direct /></CartProvider>);
  expect(screen.getByText('Soap')).toBeOnTheScreen();
  expect(screen.queryByText('Perfume')).toBeNull();
  expect(screen.getByText('$3.75')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Place demo order' }));
  expect(screen.getByText('Order confirmed')).toBeOnTheScreen();
  expect(screen.getByText('Notification count: 1')).toBeOnTheScreen();
  expect(screen.getByText(/3 items purchased\. Estimated delivery/)).toBeOnTheScreen();
  expect(screen.getByText('Cart count: 2')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Continue shopping' }));
  expect(navigation.popTo).toHaveBeenCalledWith('Products');
});

test('an empty checkout cannot place an order', async () => {
  await render(<CartProvider><Checkout quantity={0} /></CartProvider>);
  expect(screen.getByText('Your cart is empty')).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Place demo order' })).toBeNull();
});
