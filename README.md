# Product Catalog Expo App

A small mobile catalog using the free [DummyJSON products API](https://dummyjson.com/docs/products), with a clean, reference-inspired product list.

## Stack

Expo SDK 57 (managed), React Native 0.86, React 19, TypeScript, React Navigation native stack, Jest with `jest-expo`, and ESLint with `eslint-config-expo`.

## Feature 1 — product list

- Loads the first 20 products with title, thumbnail, and USD price.
- Shows stock status, stock count, and category.
- Distinct loading, error with retry, empty, and success views; image fallback on failure.
- Footer order: Home, Products, Orders, More.

Search, filter, status/category selectors, scanner, and the other footer tabs are disabled placeholders for later features.

## Feature 2 — automatic pagination

- Scrolling near the bottom requests another 20 products using `skip=20`, `skip=40`, and so on.
- Prevents overlapping requests and duplicate rows, and stops at the last or an empty page.
- Shows a separate loading footer; a failed page keeps existing rows visible and can be retried at the same offset.
- Cancels requests on unmount and ignores stale responses.

## Feature 3 — product details and cart

- Tap a product to load its full details from `GET /products/{id}`. Back navigation preserves the catalog and scroll position.
- Image gallery, full description, price, dimensions, weight, availability, shipping, warranty, and every review.
- Product and review ratings appear only as stars; screen readers can read the exact rating.
- Red discount badges on list thumbnails and details. Badges round to whole percentages like the reference. The API price stays the selling price; the crossed-out reference price is calculated using the exact discount percentage.
- Dimensions and weight display the API values without inventing units, which DummyJSON does not specify.
- Add selected quantities to the cart, update quantities or remove items, and view the total. Quantities respect stock limits.
- Cart state lasts while the app is open and survives screen navigation; restarting the app resets it. Checkout is outside this feature.
- Details have separate loading, retryable error, and product-not-found states. Empty reviews and unavailable images have fallbacks.

## Run

Requires Node.js 22.13+ and npm. Run these commands from this directory:

```sh
npm ci
npm start
```

Scan the QR code with a compatible Expo Go version, or press `a` for Android / `i` for an iOS simulator (macOS required). Use `npm run web` for a browser preview.

```sh
npm run typecheck
npm run lint
npm test
```

## Organization

- `src/data/products.ts`: product types, HTTP requests, and API response validation.
- `src/presentation/useProducts.ts`: request lifecycle, catalog states, and pagination.
- `src/presentation/ProductsScreen.tsx`: UI, product rows, and footer.
- `src/presentation/useProduct.ts`: detail requests, retries, and stale-response protection.
- `src/presentation/ProductDetailsScreen.tsx`, `ProductGallery.tsx`, `ProductBits.tsx`: detail content, photos, stars, and prices.
- `src/presentation/CartContext.tsx`, `CartScreen.tsx`: session cart state and cart UI.
- `App.tsx`: native-stack navigation and safe-area setup.

Tests sit beside the data and presentation layers. They cover API failures, catalog states, pagination offsets, request guards, end-of-list handling, cancellation, and retries. Short inline comments explain request cancellation, pagination guards, and the API boundary.
