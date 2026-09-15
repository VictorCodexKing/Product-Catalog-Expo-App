import type { CartItem } from './CartContext';

export type RootStackParamList = {
  Products: undefined;
  ProductDetails: { productId: number };
  Cart: undefined;
  Checkout: { buyNow?: CartItem } | undefined;
  More: undefined;
  Notifications: undefined;
};
