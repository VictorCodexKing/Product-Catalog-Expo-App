import { fetchCatalogFacets, fetchCategories, fetchFilteredProducts, fetchProduct, fetchProducts, PAGE_SIZE, ProductDetail, ProductsPage } from '../products';

const page: ProductsPage = {
  products: [{ id: 1, title: 'Perfume', thumbnail: 'https://example.com/1.png', price: 9.99, discountPercentage: 10, stock: 5, category: 'beauty', brand: 'Essence' }],
  total: 1, skip: 0, limit: PAGE_SIZE,
};

const fetchMock = jest.fn();
const originalFetch = global.fetch;
beforeEach(() => { global.fetch = fetchMock; fetchMock.mockReset(); });
afterAll(() => { global.fetch = originalFetch; });

test('encodes search terms and preserves API pagination', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ...page, skip: 20 }) });
  await fetchProducts(20, undefined, { query: 'phone & case' });
  expect(fetchMock).toHaveBeenCalledWith('https://dummyjson.com/products/search?limit=20&skip=20&q=phone%20%26%20case', { signal: undefined });
});

test('combines category, brand, and price filters across the complete search result', async () => {
  const matches = Array.from({ length: 25 }, (_, id) => ({ ...page.products[0], id: id + 1, price: id === 24 ? 7 : 12 }));
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ products: matches, total: 25, skip: 0, limit: 25 }) });
  await expect(fetchFilteredProducts({ query: 'perfume', category: 'beauty', brand: 'Essence', maxPrice: 8 })).resolves.toEqual([matches[24]]);
  expect(fetchMock.mock.calls[0][0]).toContain('/search?limit=0&skip=0&q=perfume');
  await expect(fetchFilteredProducts({ query: 'perfume', category: 'groceries', brand: 'Essence', maxPrice: 8 })).resolves.toEqual([]);
});

test('builds sorted category, brand, and price facets from the catalog', async () => {
  const products = [page.products[0], { ...page.products[0], id: 2, category: 'fragrances', brand: 'Acme', price: 24.2 }];
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ products, total: 2, skip: 0, limit: 0 }) });
  await expect(fetchCatalogFacets()).resolves.toEqual({ categories: ['beauty', 'fragrances'], brands: ['Acme', 'Essence'], maxPrice: 25 });
});

test('loads categories independently and rejects malformed options', async () => {
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ['beauty', 'fragrances'] });
  await expect(fetchCategories()).resolves.toEqual(['beauty', 'fragrances']);
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [42] });
  await expect(fetchCategories()).rejects.toThrow('Invalid categories');
});

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

const detail: ProductDetail = {
  ...page.products[0], description: 'A complete product description with materials, fragrance notes, and care instructions.',
  rating: 4.5, weight: 2, dimensions: { width: 10, height: 20, depth: 5 },
  warrantyInformation: 'One year warranty', shippingInformation: 'Ships in 3 days', availabilityStatus: 'In Stock',
  reviews: [{ rating: 5, comment: 'Excellent product.', date: '2026-01-01T12:00:00Z', reviewerName: 'Alex' }],
  images: ['https://example.com/full.png'],
};

test('fetches a complete detail response and forwards the abort signal', async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => detail });
  const signal = new AbortController().signal;
  await expect(fetchProduct(1, signal)).resolves.toEqual(detail);
  expect(fetchMock).toHaveBeenCalledWith('https://dummyjson.com/products/1', { signal });
});

test('treats a missing product as empty', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 404 });
  await expect(fetchProduct(99999)).resolves.toBeNull();
});

test('rejects a detail HTTP failure', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 500 });
  await expect(fetchProduct(1)).rejects.toThrow('Product unavailable (500)');
});

test.each([
  null, { ...detail, id: 2 }, { ...detail, description: null }, { ...detail, discountPercentage: '10' },
  { ...detail, dimensions: null }, { ...detail, images: [null] }, { ...detail, reviews: [null] },
  { ...detail, reviews: [{ ...detail.reviews[0], rating: 6 }] },
])('rejects malformed or mismatched product detail: %p', async invalidDetail => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => invalidDetail });
  await expect(fetchProduct(1)).rejects.toThrow('The product response was invalid');
});
