export const PAGE_SIZE = 20;

export type Product = {
  id: number;
  title: string;
  thumbnail: string;
  price: number;
  stock: number;
  category: string;
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
    Number.isInteger(product.stock) && product.stock >= 0 &&
    typeof product.category === 'string';
}

export async function fetchProducts(skip = 0, signal?: AbortSignal): Promise<ProductsPage> {
  const response = await fetch(`https://dummyjson.com/products?limit=${PAGE_SIZE}&skip=${skip}`, { signal });
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
