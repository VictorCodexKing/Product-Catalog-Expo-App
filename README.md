# Product Catalog Expo App

A small mobile catalog using the free [DummyJSON products API](https://dummyjson.com/docs/products), with a clean, reference-inspired product list.

## Stack

Expo SDK 57 (managed), React Native 0.86, React 19, TypeScript, React Navigation native stack, Jest with `jest-expo`, and ESLint with `eslint-config-expo`.

## Feature 1 — product list

- Loads the first 20 products with title, thumbnail, and USD price.
- Shows stock status, stock count, and category.
- Distinct loading, error with retry, empty, and success views; image fallback on failure.
- Footer order: Home, Products, Orders, More.

Search, filter, status/category selectors, scanner, and the other footer tabs are disabled placeholders for later features. Product details and debounced search are planned; the native stack currently contains only Products.

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
- `src/presentation/useProducts.ts`: request lifecycle and catalog states.
- `src/presentation/ProductsScreen.tsx`: UI, product rows, and footer.
- `App.tsx`: native-stack navigation and safe-area setup.

Tests sit beside the data and presentation layers. Short inline comments explain request cancellation and the API boundary.
