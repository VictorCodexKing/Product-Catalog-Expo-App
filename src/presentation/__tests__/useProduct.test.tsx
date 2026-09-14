import { act, renderHook } from '@testing-library/react-native';

import { fetchProduct, ProductDetail } from '../../data/products';
import { useProduct } from '../useProduct';

jest.mock('../../data/products', () => ({ ...jest.requireActual('../../data/products'), fetchProduct: jest.fn() }));
const fetchMock = jest.mocked(fetchProduct);
const product: ProductDetail = {
  id: 1, title: 'Perfume', thumbnail: 'https://example.com/1.png', price: 9.99, discountPercentage: 10, stock: 5, category: 'beauty',
  description: 'A complete product description with materials, fragrance notes, and care instructions.',
  rating: 4.5, weight: 2, dimensions: { width: 10, height: 20, depth: 5 },
  warrantyInformation: 'One year warranty', shippingInformation: 'Ships in 3 days', availabilityStatus: 'In Stock',
  reviews: [{ rating: 5, comment: 'Excellent product.', date: '2026-01-01T12:00:00Z', reviewerName: 'Alex' }],
  images: ['https://example.com/full.png'],
};
function deferredProduct() {
  let resolve!: (value: ProductDetail | null) => void;
  const promise = new Promise<ProductDetail | null>(done => { resolve = done; });
  return { promise, resolve };
}

beforeEach(() => fetchMock.mockReset());

test('starts loading and exposes complete product details on success', async () => {
  const response = deferredProduct();
  fetchMock.mockReturnValueOnce(response.promise);
  const { result } = await renderHook(() => useProduct(1));
  expect(result.current.status).toBe('loading');
  expect(result.current.product).toBeNull();
  await act(() => response.resolve(product));
  expect(result.current.status).toBe('success');
  expect(result.current.product).toEqual(product);
  expect(result.current.product?.description).toBe(product.description);
});

test('distinguishes a missing product from a failed request', async () => {
  fetchMock.mockResolvedValueOnce(null);
  const { result } = await renderHook(() => useProduct(99999));
  expect(result.current.status).toBe('empty');
  expect(result.current.product).toBeNull();
  expect(result.current.error).toBeNull();
});

test('exposes an error and retries through loading to success', async () => {
  const response = deferredProduct();
  fetchMock.mockRejectedValueOnce(new Error('Offline')).mockReturnValueOnce(response.promise);
  const { result } = await renderHook(() => useProduct(1));
  expect(result.current.status).toBe('error');
  expect(result.current.error).toBe('Offline');
  await act(() => result.current.retry());
  expect(result.current.status).toBe('loading');
  expect(result.current.error).toBeNull();
  await act(() => response.resolve(product));
  expect(result.current.status).toBe('success');
  expect(fetchMock.mock.calls.map(([id]) => id)).toEqual([1, 1]);
});

test('cancels the prior ID and ignores its late response', async () => {
  const first = deferredProduct();
  const second = deferredProduct();
  fetchMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  const { result, rerender } = await renderHook(useProduct, { initialProps: 1 });
  const firstSignal = fetchMock.mock.calls[0][1];
  await rerender(2);
  expect(firstSignal?.aborted).toBe(true);
  await act(() => first.resolve(product));
  expect(result.current.status).toBe('loading');
  expect(result.current.product).toBeNull();
  await act(() => second.resolve({ ...product, id: 2, title: 'New perfume' }));
  expect(result.current.product?.id).toBe(2);
  expect(result.current.status).toBe('success');
});

test('never flashes old product data when changing IDs or returning to an earlier ID', async () => {
  const second = deferredProduct();
  const revisited = deferredProduct();
  fetchMock.mockResolvedValueOnce(product).mockReturnValueOnce(second.promise).mockReturnValueOnce(revisited.promise);
  const { result, rerender } = await renderHook(useProduct, { initialProps: 1 });
  expect(result.current.product).toEqual(product);
  await rerender(2);
  expect(result.current.status).toBe('loading');
  expect(result.current.product).toBeNull();
  await rerender(1);
  expect(result.current.status).toBe('loading');
  expect(result.current.product).toBeNull();
  await act(() => second.resolve({ ...product, id: 2 }));
  expect(result.current.product).toBeNull();
  await act(() => revisited.resolve({ ...product, price: 12 }));
  expect(result.current.product?.price).toBe(12);
});

test('aborts an in-flight request when unmounting', async () => {
  const response = deferredProduct();
  fetchMock.mockReturnValueOnce(response.promise);
  const { unmount } = await renderHook(() => useProduct(1));
  const signal = fetchMock.mock.calls[0][1];
  await unmount();
  expect(signal?.aborted).toBe(true);
  await act(() => response.resolve(product));
});

test('retry cancels a pending request and ignores its stale result', async () => {
  const first = deferredProduct();
  fetchMock.mockReturnValueOnce(first.promise).mockResolvedValueOnce({ ...product, price: 12 });
  const { result } = await renderHook(() => useProduct(1));
  const signal = fetchMock.mock.calls[0][1];
  await act(() => result.current.retry());
  expect(signal?.aborted).toBe(true);
  expect(result.current.product?.price).toBe(12);
  await act(() => first.resolve(product));
  expect(result.current.product?.price).toBe(12);
});
