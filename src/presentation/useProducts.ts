import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchProducts, Product } from '../data/products';

type CatalogState = {
  products: Product[];
  total: number;
  status: 'loading' | 'error' | 'empty' | 'success';
  error: string | null;
  loadingMore: boolean;
  pageError: string | null;
  hasMore: boolean;
};

const initialState: CatalogState = {
  products: [], total: 0, status: 'loading', error: null,
  loadingMore: false, pageError: null, hasMore: false,
};
const newCursor = () => ({ controller: null as AbortController | null, skip: 0, more: false, failed: false, active: false });

export function useProducts() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState(initialState);
  const cursor = useRef(newCursor());

  const request = useCallback((firstPage = false, explicitRetry = false) => {
    const current = cursor.current;
    // Lock synchronously: FlatList can fire several end events before React renders.
    if (!current.active || current.controller || (!firstPage && (!current.more || (current.failed && !explicitRetry)))) return false;
    const controller = new AbortController();
    current.controller = controller;
    current.failed = false;
    fetchProducts(firstPage ? 0 : current.skip, controller.signal).then(page => {
      if (controller.signal.aborted) return;
      // Advance by the raw count, even when duplicate IDs are removed from the UI.
      current.skip = page.skip + page.products.length;
      current.more = page.products.length > 0 && current.skip < page.total;
      setState(previous => {
        const products = [...new Map([...(firstPage ? [] : previous.products), ...page.products].map(product => [product.id, product])).values()];
        return {
          products, total: page.total, status: products.length ? 'success' : 'empty', error: null,
          loadingMore: false, pageError: null, hasMore: current.more,
        };
      });
    }).catch(error => {
      if (controller.signal.aborted) return;
      current.failed = true;
      const message = error instanceof Error ? error.message : 'Unable to load products. Please try again.';
      setState(previous => firstPage
        ? { ...initialState, status: 'error', error: message }
        : { ...previous, loadingMore: false, pageError: message });
    }).finally(() => {
      if (!controller.signal.aborted) current.controller = null;
    });
    return true;
  }, []);

  const nextPage = useCallback((explicitRetry = false) => {
    if (request(false, explicitRetry)) {
      setState(previous => ({ ...previous, loadingMore: true, pageError: null }));
    }
  }, [request]);
  const loadMore = useCallback(() => nextPage(), [nextPage]);
  const retryMore = useCallback(() => nextPage(true), [nextPage]);
  const retry = useCallback(() => {
    cursor.current.controller?.abort();
    cursor.current = newCursor();
    setState(initialState);
    setAttempt(value => value + 1);
  }, []);

  useEffect(() => {
    const current = cursor.current;
    current.active = true;
    current.controller = null;
    request(true);
    // Cancel both initial and subsequent pages on unmount/reset.
    return () => { current.active = false; current.controller?.abort(); };
  }, [attempt, request]);

  return { ...state, retry, loadMore, retryMore };
}
