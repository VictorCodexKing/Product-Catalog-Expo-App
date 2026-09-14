import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchProduct, ProductDetail } from '../data/products';

type DetailState = {
  product: ProductDetail | null;
  status: 'loading' | 'error' | 'empty' | 'success';
  error: string | null;
};
const initialState: DetailState = { product: null, status: 'loading', error: null };

export function useProduct(id: number) {
  const [attempt, setAttempt] = useState(0);
  const request = useMemo(() => ({ id, attempt }), [id, attempt]);
  const [state, setState] = useState<{ request: typeof request; result: DetailState } | null>(null);
  const retry = useCallback(() => setAttempt(value => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProduct(request.id, controller.signal).then(product => {
      if (!controller.signal.aborted) {
        setState({ request, result: { product, status: product ? 'success' : 'empty', error: null } });
      }
    }).catch(error => {
      if (!controller.signal.aborted) {
        setState({ request, result: { product: null, status: 'error', error: error instanceof Error ? error.message : 'Unable to load this product. Please try again.' } });
      }
    });
    return () => controller.abort();
  }, [request]);

  // A new request hides old data immediately, including when revisiting an earlier ID.
  return { ...(state?.request === request ? state.result : initialState), retry };
}
