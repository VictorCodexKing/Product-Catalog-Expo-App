import { fetchProducts, PAGE_SIZE, ProductsPage } from '../products';

const page: ProductsPage = {
  products: [{ id: 1, title: 'Perfume', thumbnail: 'https://example.com/1.png', price: 9.99, stock: 5, category: 'beauty' }],
  total: 1, skip: 0, limit: PAGE_SIZE,
};

const fetchMock = jest.fn();
const originalFetch = global.fetch;
beforeEach(() => { global.fetch = fetchMock; fetchMock.mockReset(); });
afterAll(() => { global.fetch = originalFetch; });

test('requests 20 products with the supplied offset and abort signal', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ...page, skip: 20 }) });
  const signal = new AbortController().signal;
  await expect(fetchProducts(20, signal)).resolves.toEqual({ ...page, skip: 20 });
  expect(fetchMock).toHaveBeenCalledWith('https://dummyjson.com/products?limit=20&skip=20', { signal });
});

test('rejects an HTTP failure', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 503 });
  await expect(fetchProducts()).rejects.toThrow('Products unavailable (503)');
});

test('rejects a response for the wrong offset', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => page });
  await expect(fetchProducts(20)).rejects.toThrow('The product response was invalid');
});

test.each([null, { ...page, total: -1 }, { ...page, products: [{ ...page.products[0], price: '9.99' }] }])(
  'rejects malformed API data: %p', async invalidPage => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => invalidPage });
    await expect(fetchProducts()).rejects.toThrow('The product response was invalid');
  },
);
