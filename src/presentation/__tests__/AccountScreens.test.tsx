import { fireEvent, render, screen } from '@testing-library/react-native';
import { ComponentProps, useEffect } from 'react';

import { NotificationsScreen } from '../AccountScreens';
import { CartProvider, useCart } from '../CartContext';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
const navigation = { goBack: jest.fn() } as unknown as ComponentProps<typeof NotificationsScreen>['navigation'];
const props = { navigation, route: { key: 'notifications', name: 'Notifications' } } as ComponentProps<typeof NotificationsScreen>;
const product = { id: 1, title: 'Perfume', price: 9.99, thumbnail: '', stock: 5, category: 'beauty', discountPercentage: 10 };

function PurchasedNotifications() {
  const { recordPurchase } = useCart();
  useEffect(() => { recordPurchase([{ product, quantity: 2 }]); }, [recordPurchase]);
  return <NotificationsScreen {...props} />;
}

function ManyNotifications() {
  const { recordPurchase } = useCart();
  useEffect(() => { for (let index = 0; index < 6; index += 1) recordPurchase([{ product, quantity: 1 }]); }, [recordPurchase]);
  return <NotificationsScreen {...props} />;
}

test('shows an empty notification state before a purchase', async () => {
  await render(<CartProvider><NotificationsScreen {...props} /></CartProvider>);
  expect(screen.getByText('No notifications available')).toBeOnTheScreen();
  expect(screen.getByText('Check back later for updates')).toBeOnTheScreen();
});

test('shows purchase confirmation and estimated delivery after checkout', async () => {
  await render(<CartProvider><PurchasedNotifications /></CartProvider>);
  expect(screen.getByText('Purchase confirmed')).toBeOnTheScreen();
  expect(screen.getByText(/2 items purchased\. Estimated delivery/)).toBeOnTheScreen();
  expect(screen.queryByText('No notifications available')).toBeNull();
  expect(screen.queryByText('Updates about your recent purchases.')).toBeNull();
  expect(screen.getByLabelText('Unread notification')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'View notification: Purchase confirmed' }));
  expect(screen.getByText('Purchase details')).toBeOnTheScreen();
  expect(screen.getByText('2× Perfume')).toBeOnTheScreen();
  expect(screen.getByText('$19.98')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'View notification' }));
  expect(screen.queryByText('Purchase details')).toBeNull();
  expect(screen.getByText('Viewed')).toBeOnTheScreen();
  expect(screen.queryByLabelText('Unread notification')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'View notification: Purchase confirmed' }));
  expect(screen.getByText('Purchase details')).toBeOnTheScreen();
  expect(screen.getAllByText('Viewed')).toHaveLength(2); // The card and open detail both show its read state.
  await fireEvent.press(screen.getByRole('button', { name: 'Close viewed notification' }));
});

test('shows five recent notifications until View All is pressed', async () => {
  await render(<CartProvider><ManyNotifications /></CartProvider>);
  expect(screen.getAllByRole('button', { name: 'View notification: Purchase confirmed' })).toHaveLength(5);
  await fireEvent.press(screen.getByRole('button', { name: 'View all notifications' }));
  expect(screen.getAllByRole('button', { name: 'View notification: Purchase confirmed' })).toHaveLength(6);
  expect(screen.queryByRole('button', { name: 'View all notifications' })).toBeNull();
});
