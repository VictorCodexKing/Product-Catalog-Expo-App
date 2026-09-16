# Product Catalog Expo App

A small mobile catalog using the free [DummyJSON products API](https://dummyjson.com/docs/products), with a clean, reference-inspired product list.

## Stack

Expo SDK 57 (managed), React Native 0.86, React 19, TypeScript, React Navigation native stack, Jest with `jest-expo`, and ESLint with `eslint-config-expo`.

## Feature 1 — product list

- Loads the first 20 products with title, thumbnail, and USD price.
- Shows stock status, stock count, and category.
- Distinct loading, error with retry, empty, and success views; image fallback on failure.
- Footer order: Home, Products, Orders, More.

Home and Orders remain disabled placeholders for later features.

## Feature 2 — automatic pagination

- Scrolling near the bottom requests another 20 products using `skip=20`, `skip=40`, and so on.
- Prevents overlapping requests and duplicate rows, and stops at the last or an empty page.
- Shows a separate loading footer; a failed page keeps existing rows visible and can be retried at the same offset.
- Cancels requests on unmount and ignores stale responses.

## Feature 3 — product details and cart

- Tap a product to load its full details from `GET /products/{id}`. Back navigation preserves the catalog and scroll position.
- Image gallery, full description, price, dimensions, weight, availability, shipping, warranty, and every review.
- Product and review ratings appear only as stars; screen readers can read the exact rating.
- Small red discount badges on list thumbnails; details keep the discount beside the price only. Badges round to whole percentages like the reference. The API price stays the selling price; the crossed-out reference price is calculated using the exact discount percentage.
- Dimensions and weight display the API values without inventing units, which DummyJSON does not specify.
- Add selected quantities to the cart, update quantities or remove items, and view the total. Quantities respect stock limits.
- Cart state lasts while the app is open and survives screen navigation; restarting the app resets it.
- Details have separate loading, retryable error, and product-not-found states. Empty reviews and unavailable images have fallbacks.

## Feature 4 — purchase controls and cart refinements

- Clean detail layout with quantity controls in the content and a fixed action bar: an icon-only outlined cart action and a 70%-wide vibrant orange Buy Now button.
- Larger cart thumbnails, selling and original prices, quantity controls on the right, and swipe-left to reveal Delete. The ellipsis button offers the same action without a swipe.
- Checkout reviews the entire cart; Buy Now reviews only the selected product and quantity, leaving the existing cart intact.
- Checkout is a local demo: no payment, delivery, or server order is created. Confirming a cart checkout clears that cart; confirming Buy Now preserves it and creates an in-app purchase notification with an estimated delivery date.
- Shopping cart and notification icons remain in the catalog header. More contains the local preview account information; completed demo purchases appear in Notifications.

## Feature 5 — search and filters

- Search uses `/products/search?q=…` after 350 ms of inactivity, so it covers products beyond the pages already loaded.
- A single filter button beside search opens a bottom sheet with Category, Brand, and a maximum-price slider. Status and always-visible Category controls were removed.
- Normal browsing/search keep 20-item API pages. DummyJSON cannot combine every filter, so combined filters use the complete matching set with `limit=0`, apply the remaining facets locally, and display 20-item pages from that result.
- Applied-filter count, clear/apply actions, selected chips, loading/retry feedback, reset-all, and a dedicated no-matches state keep the flow understandable.

## Run

The detail gallery uses a large, swipeable image area with round page indicators and a back button matching its background. Add to Cart and Buy Now trigger Expo haptic feedback on supported devices, with pressed-button feedback and a brief cart confirmation as visual cues. Haptics depend on device hardware/settings and browser vibration support; an unavailable haptic engine never blocks the action.

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
