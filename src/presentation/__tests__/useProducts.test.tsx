import { act, renderHook, waitFor } from '@testing-library/react-native';

import { fetchProducts, PAGE_SIZE, ProductsPage } from '../../data/products';
import { useProducts } from '../useProducts';

jest.mock('../../data/products', () => ({ ...jest.requireActual('../../data/products'), fetchProducts: jest.fn() }));
const fetchMock = jest.mocked(fetchProducts);
const page: ProductsPage = {
  products: [{ id: 1, title: 'Perfume', thumbnail: 'https://example.com/1.png', price: 9.99, stock: 5, category: 'beauty' }],
  total: 1, skip: 0, limit: PAGE_SIZE,
};
const pageAt = (skip: number, count = PAGE_SIZE, total = 45): ProductsPage => ({
  products: Array.from({ length: count }, (_, index) => ({ ...page.products[0], id: skip + index + 1 })),
  total, skip, limit: PAGE_SIZE,
});
function deferredPage() {
  let resolve!: (value: ProductsPage) => void;
  const promise = new Promise<ProductsPage>(done => { resolve = done; });
  return { promise, resolve };
}

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

test('loads offsets 0, 20, 40, prevents concurrent requests and stops at the total', async () => {
  const second = deferredPage();
  fetchMock.mockResolvedValueOnce(pageAt(0)).mockReturnValueOnce(second.promise).mockResolvedValueOnce(pageAt(40, 5));
  const { result } = await renderHook(useProducts);
  await act(() => { result.current.loadMore(); result.current.loadMore(); result.current.loadMore(); });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(result.current.loadingMore).toBe(true);
  expect(result.current.products).toHaveLength(20);
  await act(() => second.resolve(pageAt(20)));
  expect(result.current.products).toHaveLength(40);
  expect(result.current.hasMore).toBe(true);
  await act(() => result.current.loadMore());
  expect(result.current.products).toHaveLength(45);
  expect(result.current.hasMore).toBe(false);
  await act(() => { result.current.loadMore(); result.current.retryMore(); });
  expect(fetchMock.mock.calls.map(([skip]) => skip)).toEqual([0, 20, 40]);
});

test('does not load an additional page before the first response', async () => {
  const first = deferredPage();
  fetchMock.mockReturnValueOnce(first.promise);
  const { result } = await renderHook(useProducts);
  await act(() => { result.current.loadMore(); result.current.retryMore(); });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await act(() => first.resolve(pageAt(0)));
  expect(result.current.products).toHaveLength(20);
});

test('stops on an empty later page even if the total suggests more products', async () => {
  fetchMock.mockResolvedValueOnce(pageAt(0)).mockResolvedValueOnce(pageAt(20, 0));
  const { result } = await renderHook(useProducts);
  await act(() => result.current.loadMore());
  expect(result.current.status).toBe('success');
  expect(result.current.products).toHaveLength(20);
  expect(result.current.hasMore).toBe(false);
  await act(() => result.current.loadMore());
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

test('keeps existing rows after a page failure and retries the same offset explicitly', async () => {
  fetchMock.mockResolvedValueOnce(pageAt(0)).mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(pageAt(20));
  const { result } = await renderHook(useProducts);
  await act(() => result.current.loadMore());
  expect(result.current.status).toBe('success');
  expect(result.current.products).toHaveLength(20);
  expect(result.current.pageError).toBe('Offline');
  expect(result.current.loadingMore).toBe(false);
  await act(() => { result.current.loadMore(); result.current.loadMore(); });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  await act(() => result.current.retryMore());
  expect(result.current.products).toHaveLength(40);
  expect(result.current.pageError).toBeNull();
  expect(fetchMock.mock.calls.map(([skip]) => skip)).toEqual([0, 20, 20]);
});

test('removes duplicate boundary IDs while advancing by the raw page size', async () => {
  const second = pageAt(20);
  second.products[0] = page.products[0];
  fetchMock.mockResolvedValueOnce(pageAt(0)).mockResolvedValueOnce(second).mockResolvedValueOnce(pageAt(40, 5));
  const { result } = await renderHook(useProducts);
  await act(() => result.current.loadMore());
  expect(result.current.products).toHaveLength(39);
  expect(new Set(result.current.products.map(product => product.id)).size).toBe(39);
  await act(() => result.current.loadMore());
  expect(fetchMock.mock.calls.map(([skip]) => skip)).toEqual([0, 20, 40]);
  expect(result.current.hasMore).toBe(false);
});

test('aborts a later page on unmount and ignores a response that still resolves', async () => {
  const second = deferredPage();
  fetchMock.mockResolvedValueOnce(pageAt(0)).mockReturnValueOnce(second.promise);
  const { result, unmount } = await renderHook(useProducts);
  await act(() => result.current.loadMore());
  const signal = fetchMock.mock.calls[1][1];
  const loadMore = result.current.loadMore;
  await unmount();
  expect(signal?.aborted).toBe(true);
  await act(() => second.resolve(pageAt(20)));
  await act(() => loadMore());
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

test('reset cancels a later request and ignores its stale result', async () => {
  const second = deferredPage();
  fetchMock.mockResolvedValueOnce(pageAt(0)).mockReturnValueOnce(second.promise).mockResolvedValueOnce(page);
  const { result } = await renderHook(useProducts);
  await act(() => result.current.loadMore());
  const signal = fetchMock.mock.calls[1][1];
  await act(() => result.current.retry());
  expect(signal?.aborted).toBe(true);
  expect(result.current.products).toEqual(page.products);
  await act(() => second.resolve(pageAt(20)));
  expect(result.current.products).toEqual(page.products);
  expect(result.current.hasMore).toBe(false);
  expect(fetchMock.mock.calls.map(([skip]) => skip)).toEqual([0, 20, 0]);
});
