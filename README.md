# Product Catalog App

A small mobile product catalog built with React Native and Expo. It browses the free [DummyJSON Products API] with automatic pagination, debounced search, filters, product details, a session cart, demo checkout, and clearly distinguished loading, error, empty, and success states.

## Tech stack

- **React Native 0.86** with **React 19**
- **TypeScript**
- **Expo SDK 57** using the managed workflow and Expo Go
- **React Navigation** native stack for screen navigation
- **Expo Image** for product images
- **Expo Haptics** for purchase-action feedback
- **Jest** with the **jest-expo** preset and React Native Testing Library
- **ESLint** with `eslint-config-expo`

## Features

- **Product list** — displays each product's title, thumbnail, selling price, discount, stock status, stock count, and category.
- **Automatic pagination** — loads 20 more products as the user scrolls, using DummyJSON's `skip` parameter. Existing products stay visible if a later page fails.
- **Debounced search** — waits 350 ms after typing, calls `/products/search?q=…`, and resets pagination for the new query.
- **Catalog filters** — filters by category, alphabetically sorted brand, and a maximum price from $0 to $37,000.
- **Product details** — includes a swipeable image gallery, full description, discounted and original prices, star rating, dimensions, weight, stock, shipping, warranty, and customer reviews.
- **Cart** — supports adding products, stock-limited quantity changes, swipe-to-delete, discounted pricing, totals, and checkout.
- **Buy Now** — opens a bottom sheet with the product thumbnail, price, stock, quantity controls, and purchase confirmation.
- **Demo checkout** — reviews the selected items and creates an in-app purchase confirmation without processing a real payment.
- **Notifications** — completed demo purchases create unread notifications with item details, total, and estimated delivery.
- **Haptic feedback** — Add to Cart and Buy Now provide tactile feedback on supported devices.
- **Distinct request states** — the product list and detail screen provide separate loading, retryable error, empty, and success experiences.
- **Accessible controls** — important actions, ratings, quantities, images, and state changes include accessibility labels and roles.

## API endpoints

```text
GET https://dummyjson.com/products?limit=20&skip=0
GET https://dummyjson.com/products/search?q=phone
GET https://dummyjson.com/products/{id}
```

The normal catalog and search flows use API pagination. DummyJSON does not support every category, brand, price, and search combination in one request, so combined filters fetch the complete matching API set with `limit=0`, apply unsupported filters locally, and expose the result to the UI in 20-item pages.

## How to run

### Requirements

- Node.js **22.13 or newer**, as required by Expo SDK 57
- npm
- A compatible Expo Go app, Android emulator, iOS simulator, or web browser

### Install and start

```sh
npm install
npx expo start
```

After the Expo development server starts:

- Scan the QR code with a compatible Expo Go app.
- Press `a` to open Android.
- Press `i` to open the iOS simulator on macOS.
- Press `w` to open the web version.

The equivalent npm commands are:

```sh
npm start
npm run android
npm run ios
npm run web
```

### Validate the project

```sh
npm run typecheck
npm run lint
npm test
```

`npm test` runs the Jest suite serially with the `jest-expo` preset.

## Architecture decisions

The project is divided into data and presentation layers so API concerns remain separate from React Native UI code.

```text
App.tsx
├── src/data
│   └── products.ts              API requests, types, and response validation
└── src/presentation
    ├── useProducts.ts           Product-list requests, pagination, and request states
    ├── useProduct.ts            Product-detail requests and retry handling
    ├── CartContext.tsx          Session cart and notification state
    ├── ProductsScreen.tsx       Catalog UI
    ├── ProductDetailsScreen.tsx Product-detail and purchase UI
    ├── CartScreen.tsx           Cart UI
    ├── CheckoutScreen.tsx       Demo checkout UI
    └── AccountScreens.tsx       Notifications and the current More placeholder
```

Key decisions:

- **Custom hooks own asynchronous state.** `useProducts` and `useProduct` manage loading, error, empty, and success states instead of placing request logic directly in screens.
- **Requests are cancellable and guarded.** Abort controllers and request keys prevent stale responses from replacing newer search or filter results.
- **Pagination is append-only.** Additional pages merge into the current list, prevent duplicate products and overlapping requests, and stop when no more products are available.
- **Cart and notifications use React Context.** They survive navigation while the app is open without introducing a larger state-management dependency.
- **Money is calculated in integer cents.** This avoids accumulating floating-point errors when quantities and totals change.
- **Navigation uses a native stack.** The catalog, details, cart, checkout, More, and Notifications screens share typed route parameters.
- **UI components are reusable.** Product prices, rating stars, the gallery, filter controls, cart rows, footer tabs, and notification details are separated from screen-level request logic.
- **Tests live beside their layer.** Data tests verify API validation and pagination parameters; presentation tests verify request lifecycles, navigation, cart behavior, purchase notifications, filters, and visible UI states.

## TODOs

- **Home page** — the Home footer item is currently disabled. A future version could contain featured products, popular categories, recent products, and shortcuts into the catalog.
- **Orders page** — the Orders footer item is currently disabled. There is no persisted order history, order-status screen, delivery tracking, or reorder action.
- **Settings page** — More currently displays local preview account information only. Profile editing, notification preferences, appearance, currency, privacy, and sign-out controls are not implemented.

These footer destinations remain visible to communicate the intended application structure, but unfinished destinations are disabled so users cannot navigate to incomplete screens.

## Limitations

- **Local session state** — cart contents, checkout results, and notification read status reset when the app restarts.
- **Demo purchasing only** — checkout does not process payments, create a server-side order, or arrange real delivery.
- **In-app notifications only** — purchase updates appear inside the Notifications page; remote push notifications are not configured.
- **No authentication or backend account** — the displayed Victor24 account is local preview content.

## Testing

The test suite covers:

- product API parsing and failures;
- first-page and additional-page loading;
- pagination offsets, duplicate prevention, retry behavior, and cancellation;
- debounced search and combined filters;
- product-detail loading, gallery controls, reviews, and out-of-stock behavior;
- cart quantities, totals, deletion, and stock limits;
- Buy Now and demo checkout behavior;
- notification creation, empty state, order details, viewed status, and View All behavior;
- haptic-feedback fallbacks.
