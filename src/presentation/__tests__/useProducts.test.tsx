import { act, renderHook, waitFor } from '@testing-library/react-native';

import { fetchProducts, PAGE_SIZE, ProductsPage } from '../../data/products';
import { useProducts } from '../useProducts';

jest.mock('../../data/products', () => ({ ...jest.requireActual('../../data/products'), fetchProducts: jest.fn() }));
const fetchMock = jest.mocked(fetchProducts);
const page: ProductsPage = {
  products: [{ id: 1, title: 'Perfume', thumbnail: 'https://example.com/1.png', price: 9.99, stock: 5, category: 'beauty' }],
  total: 1, skip: 0, limit: PAGE_SIZE,
};

beforeEach(() => fetchMock.mockReset());

test('starts loading, then exposes product data on success', async () => {
  let resolve!: (value: ProductsPage) => void;
  fetchMock.mockReturnValue(new Promise(done => { resolve = done; }));
  const { result } = await renderHook(useProducts);
  expect(result.current.status).toBe('loading');
  await act(async () => resolve(page));
  expect(result.current.status).toBe('success');
  expect(result.current.products).toEqual(page.products);
  expect(result.current.total).toBe(1);
});

test('distinguishes an empty response from an error', async () => {
  fetchMock.mockResolvedValue({ products: [], total: 0, skip: 0, limit: PAGE_SIZE });
  const { result } = await renderHook(useProducts);
  await waitFor(() => expect(result.current.status).toBe('empty'));
  expect(result.current.error).toBeNull();
});

test('shows a failure and retries the first page successfully', async () => {
  fetchMock.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(page);
  const { result } = await renderHook(useProducts);
  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(result.current.error).toBe('Offline');
  await act(() => result.current.retry());
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls.map(([skip]) => skip)).toEqual([0, 0]);
  expect(result.current.error).toBeNull();
});

test('aborts an in-flight request when the screen unmounts', async () => {
  fetchMock.mockReturnValue(new Promise(() => {}));
  const { unmount } = await renderHook(useProducts);
  const signal = fetchMock.mock.calls[0][1];
  expect(signal?.aborted).toBe(false);
  await unmount();
  expect(signal?.aborted).toBe(true);
});
