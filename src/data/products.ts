export const PAGE_SIZE = 20;

export type Product = {
  id: number;
  title: string;
  thumbnail: string;
  price: number;
  discountPercentage: number;
  stock: number;
  category: string;
};

export type ProductDetail = Product & {
  description: string;
  rating: number;
  brand?: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: { rating: number; comment: string; date: string; reviewerName: string }[];
  images: string[];
};

export type ProductsPage = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== 'object') return false;
  const product = value as Product;
  return Number.isInteger(product.id) && product.id > 0 &&
    typeof product.title === 'string' && typeof product.thumbnail === 'string' &&
    Number.isFinite(product.price) && product.price >= 0 &&
    Number.isFinite(product.discountPercentage) && product.discountPercentage >= 0 && product.discountPercentage <= 100 &&
    Number.isInteger(product.stock) && product.stock >= 0 &&
    typeof product.category === 'string';
}

function isProductDetail(value: unknown): value is ProductDetail {
  if (!isProduct(value)) return false;
  const product = value as ProductDetail;
  return [product.description, product.warrantyInformation, product.shippingInformation, product.availabilityStatus]
    .every(text => typeof text === 'string') &&
    (product.brand === undefined || typeof product.brand === 'string') &&
    [product.rating, product.weight, product.dimensions?.width, product.dimensions?.height, product.dimensions?.depth]
      .every(number => Number.isFinite(number) && number >= 0) && product.rating <= 5 &&
    Array.isArray(product.images) && product.images.every(image => typeof image === 'string') &&
    Array.isArray(product.reviews) && product.reviews.every(review => review &&
      Number.isFinite(review.rating) && review.rating >= 0 && review.rating <= 5 &&
      [review.comment, review.date, review.reviewerName].every(text => typeof text === 'string'));
}

export async function fetchProduct(id: number, signal?: AbortSignal): Promise<ProductDetail | null> {
  const response = await fetch(`https://dummyjson.com/products/${id}`, { signal });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Product unavailable (${response.status}). Please try again.`);
  const product: unknown = await response.json();
  if (!isProductDetail(product) || product.id !== id) {
    throw new Error('The product response was invalid. Please try again.');
  }
  return product;
}

export type CatalogFilters = { query?: string; category?: string; stock?: 'all' | 'in' | 'out' };

export async function fetchCategories(signal?: AbortSignal): Promise<string[]> {
  const response = await fetch('https://dummyjson.com/products/category-list', { signal });
  if (!response.ok) throw new Error('Could not load categories.');
  const categories: unknown = await response.json();
  if (!Array.isArray(categories) || !categories.every(value => typeof value === 'string')) throw new Error('Invalid categories.');
  return categories.sort();
}

export async function fetchProducts(skip = 0, signal?: AbortSignal, options: CatalogFilters & { limit?: number } = {}): Promise<ProductsPage> {
  const { query = '', category = '', limit = PAGE_SIZE } = options;
  const path = query ? '/search' : category ? `/category/${encodeURIComponent(category)}` : '';
  const response = await fetch(`https://dummyjson.com/products${path}?limit=${limit}&skip=${skip}${query ? `&q=${encodeURIComponent(query)}` : ''}`, { signal });
  if (!response.ok) throw new Error(`Products unavailable (${response.status}). Please try again.`);

  const page: ProductsPage = await response.json();
  // Validate the API boundary so malformed data never reaches the list.
  if (!page || !Array.isArray(page.products) || !page.products.every(isProduct) ||
    !Number.isInteger(page.total) || page.total < 0 ||
    !Number.isInteger(page.skip) || page.skip < 0 || page.skip !== skip ||
    !Number.isInteger(page.limit) || page.limit < 0) {
    throw new Error('The product response was invalid. Please try again.');
  }
  return page;
}

export async function fetchFilteredProducts(filters: CatalogFilters, signal?: AbortSignal): Promise<Product[]> {
  // DummyJSON cannot combine search, category and stock. Filter the complete result, not just a loaded page.
  const page = await fetchProducts(0, signal, { ...filters, limit: 0 });
  return page.products.filter(product => (!filters.category || product.category === filters.category) &&
    (filters.stock === 'in' ? product.stock > 0 : filters.stock === 'out' ? product.stock === 0 : true));
}
