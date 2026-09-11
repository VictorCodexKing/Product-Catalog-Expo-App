# Product-Catalog-Expo-App

A small mobile product catalog built with React Native (Expo). It browses the free DummyJSON products API with pagination, debounced search, a detail screen, and clearly distinguished loading / error / empty / success states.

## Stack

- **Expo** (SDK ~57, managed workflow)
- **React Native** with **React** 19
- **TypeScript**
- **React Navigation** (native stack) for list → detail navigation
- **Jest** with the **jest-expo** preset for unit tests
- **ESLint** (`eslint-config-expo`) for linting

## Features

- **Product list** — title, thumbnail, and price for each product.
- **Pagination** — additional pages load automatically as you scroll, using the
  DummyJSON `skip` parameter (20 items per page).
- **Product detail** — tap a product to see its image gallery, full
  description, price, rating (stars + numeric), and brand/category.
- **Distinct states** — visually separated loading (blue spinner), error (red
  panel with a **Retry** button), empty (neutral), and success views, on both
  the list and the detail screen.
- **Debounced search** — a search box (400 ms debounce) queries the API and
  resets pagination for the new query.

## How to run

Requires Node 18+ (developed on Node 22) and npm.

```bash
npm install          # install dependencies
npx expo start       # start the Expo dev server
```

Then open the app on a device/emulator via the Expo Go app or a simulator
(press `a` for Android, `i` for iOS, or scan the QR code).

>
> ```bash
> npx tsc --noEmit     # or: npm run typecheck
> npm run lint
> npm test
> 
> ```

