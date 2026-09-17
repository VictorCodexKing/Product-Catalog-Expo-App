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

test('shows an empty notification state before a purchase', async () => {
  await render(<CartProvider><NotificationsScreen {...props} /></CartProvider>);
  expect(screen.getByText('All caught up')).toBeOnTheScreen();
});

test('shows purchase confirmation and estimated delivery after checkout', async () => {
  await render(<CartProvider><PurchasedNotifications /></CartProvider>);
  expect(screen.getByText('Purchase confirmed')).toBeOnTheScreen();
  expect(screen.getByText(/2 items purchased\. Estimated delivery/)).toBeOnTheScreen();
  expect(screen.queryByText('All caught up')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'View notification: Purchase confirmed' }));
  expect(screen.getByText('Purchase update')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'View all notifications' }));
  expect(screen.queryByText('Purchase update')).toBeNull();
});
