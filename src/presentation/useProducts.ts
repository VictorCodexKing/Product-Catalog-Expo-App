import { useCallback, useEffect, useState } from 'react';

import { fetchProducts, Product } from '../data/products';

type CatalogState = {
  products: Product[];
  total: number;
  status: 'loading' | 'error' | 'empty' | 'success';
  error: string | null;
};

export function useProducts() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<CatalogState>({ products: [], total: 0, status: 'loading', error: null });
  const retry = useCallback(() => {
    setState({ products: [], total: 0, status: 'loading', error: null });
    setAttempt(value => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(0, controller.signal).then(page => {
      if (!controller.signal.aborted) {
        setState({ products: page.products, total: page.total, status: page.products.length ? 'success' : 'empty', error: null });
      }
    }).catch(error => {
      if (!controller.signal.aborted) {
        setState({ products: [], total: 0, status: 'error', error: error instanceof Error ? error.message : 'Unable to load products. Please try again.' });
      }
    });
    // Cancel requests when leaving the screen or retrying.
    return () => controller.abort();
  }, [attempt]);

  return { ...state, retry };
}
