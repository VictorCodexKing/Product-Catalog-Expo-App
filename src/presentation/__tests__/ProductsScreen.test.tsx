import { fireEvent, render, screen } from '@testing-library/react-native';

import ProductsScreen from '../ProductsScreen';
import { useProducts } from '../useProducts';

jest.mock('../useProducts');
jest.mock('@expo/vector-icons/Ionicons', () => () => null);

const useProductsMock = jest.mocked(useProducts);
const retry = jest.fn();
const products = [
  { id: 1, title: 'Everyday Perfume', thumbnail: 'https://example.com/perfume.png', price: 9.5, stock: 5, category: 'beauty' },
  { id: 2, title: 'Travel Bag', thumbnail: 'https://example.com/bag.png', price: 24, stock: 0, category: 'womens-bags' },
];

beforeEach(() => {
  jest.clearAllMocks();
  useProductsMock.mockReturnValue({ products: [], total: 0, status: 'loading', error: null, retry });
});

test('shows each product title, thumbnail, formatted price, and stock status', async () => {
  useProductsMock.mockReturnValue({ products, total: 2, status: 'success', error: null, retry });
  await render(<ProductsScreen />);

  for (const product of products) {
    expect(screen.getByText(product.title)).toBeOnTheScreen();
    expect(screen.getByLabelText(product.title)).toHaveProp('source', [{ uri: product.thumbnail }]);
    expect(screen.getByText(`$${product.price.toFixed(2)}`)).toBeOnTheScreen();
  }
  expect(screen.getByText('In stock')).toBeOnTheScreen();
  expect(screen.getByText('Out of stock')).toBeOnTheScreen();
  expect(screen.getByText('2 of 2')).toBeOnTheScreen();
  expect(screen.queryByText('No products yet')).toBeNull();
});

test('shows initial loading without an error or retry action', async () => {
  await render(<ProductsScreen />);

  expect(screen.getByText('Loading products')).toBeOnTheScreen();
  expect(screen.queryByText('Couldn’t load products')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
});

test('shows an error and retries when requested', async () => {
  useProductsMock.mockReturnValue({ products: [], total: 0, status: 'error', error: 'Offline', retry });
  await render(<ProductsScreen />);

  expect(screen.getByText('Couldn’t load products')).toBeOnTheScreen();
  expect(screen.queryByText('No products yet')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
  expect(retry).toHaveBeenCalledTimes(1);
});

test('shows a distinct empty state with no product rows', async () => {
  useProductsMock.mockReturnValue({ products: [], total: 0, status: 'empty', error: null, retry });
  await render(<ProductsScreen />);

  expect(screen.getByText('No products yet')).toBeOnTheScreen();
  expect(screen.queryByText('Loading products')).toBeNull();
  expect(screen.queryByText('Couldn’t load products')).toBeNull();
  expect(screen.queryByText('0 of 0')).toBeNull();
});
