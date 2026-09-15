import { fireEvent, render, screen } from '@testing-library/react-native';
import { ComponentProps, useEffect } from 'react';

import { CartProvider, useCart } from '../CartContext';
import CartScreen from '../CartScreen';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
const goBack = jest.fn();
const popTo = jest.fn();
const navigate = jest.fn();
const navigation = { goBack, popTo, navigate } as unknown as ComponentProps<typeof CartScreen>['navigation'];
const product = { id: 1, title: 'Perfume', price: 9.99, thumbnail: 'https://example.com/1.png', stock: 3, category: 'beauty', discountPercentage: 10 };

function Cart({ quantity = 0 }: { quantity?: number }) {
  const { addItem } = useCart();
  useEffect(() => { addItem(product, quantity); }, [addItem, quantity]);
  return <CartScreen navigation={navigation} route={{ key: 'cart', name: 'Cart' }} />;
}

beforeEach(() => jest.clearAllMocks());

test('updates quantities and total, stops at stock, then removes the product', async () => {
  await render(<CartProvider><Cart quantity={2} /></CartProvider>);
  expect(screen.getByText('Perfume')).toBeOnTheScreen();
  expect(screen.getByLabelText('Perfume')).toHaveProp('source', [{ uri: product.thumbnail }]);
  expect(screen.getByText('$19.98')).toBeOnTheScreen();
  expect(screen.getByText('$9.99')).toBeOnTheScreen();
  expect(screen.getByLabelText('Before discount: $11.10')).toHaveStyle({ textDecorationLine: 'line-through' });
  await fireEvent.press(screen.getByRole('button', { name: 'Checkout' }));
  expect(navigate).toHaveBeenCalledWith('Checkout');
  await fireEvent.press(screen.getByRole('button', { name: 'Increase Perfume quantity' }));
  expect(screen.getByLabelText('Perfume quantity: 3')).toBeOnTheScreen();
  expect(screen.getByText('$29.97')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Increase Perfume quantity' })).toBeDisabled();
  await fireEvent.press(screen.getByRole('button', { name: 'Decrease Perfume quantity' }));
  expect(screen.getByText('$19.98')).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Delete Perfume' })).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Show delete for Perfume' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Delete Perfume' }));
  expect(screen.getByText('Your cart is empty')).toBeOnTheScreen();
  expect(screen.queryByText('Total')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Checkout' })).toBeNull();
});

test('lets an empty cart return to browsing and supports going back', async () => {
  await render(<CartProvider><Cart /></CartProvider>);
  expect(screen.getByText('Your cart is empty')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Browse products' }));
  expect(popTo).toHaveBeenCalledWith('Products');
  await fireEvent.press(screen.getByRole('button', { name: 'Go back' }));
  expect(goBack).toHaveBeenCalledTimes(1);
});
