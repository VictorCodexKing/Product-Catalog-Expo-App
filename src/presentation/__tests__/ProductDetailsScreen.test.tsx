import { fireEvent, render, screen } from '@testing-library/react-native';
import { ComponentProps } from 'react';

import { ProductDetail } from '../../data/products';
import { CartProvider } from '../CartContext';
import ProductDetailsScreen from '../ProductDetailsScreen';
import { useProduct } from '../useProduct';
import { purchaseFeedback } from '../purchaseFeedback';

jest.mock('../useProduct');
jest.mock('../purchaseFeedback');
jest.mock('@expo/vector-icons/Ionicons', () => () => null);

const useProductMock = jest.mocked(useProduct);
const retry = jest.fn();
const navigation = { goBack: jest.fn(), navigate: jest.fn() };
const props = {
  route: { key: 'detail-1', name: 'ProductDetails', params: { productId: 1 } }, navigation,
} as unknown as ComponentProps<typeof ProductDetailsScreen>;
const product: ProductDetail = {
  id: 1, title: 'Everyday Perfume', thumbnail: 'https://example.com/thumb.png', price: 9.99,
  discountPercentage: 10.48, stock: 3, category: 'beauty', brand: 'Everyday', rating: 4.42,
  description: 'A refreshing everyday fragrance with bright citrus top notes, soft floral middle notes, and a warm woody finish. Apply lightly to pulse points and store the bottle in a cool, dry place away from direct sunlight.',
  weight: 7, dimensions: { width: 10, height: 20, depth: 8 }, availabilityStatus: 'In Stock',
  warrantyInformation: 'One year warranty', shippingInformation: 'Ships in 3 days',
  reviews: [
    { rating: 3, reviewerName: 'Alex', comment: 'Fresh and comfortable for daily use.', date: '2026-01-01T12:00:00Z' },
    { rating: 5, reviewerName: 'Sam', comment: 'The fragrance lasts all day.', date: '2026-01-02T12:00:00Z' },
  ],
  images: ['https://example.com/front.png', 'https://example.com/back.png'],
};
async function renderDetails(overrides: Partial<ReturnType<typeof useProduct>> = {}) {
  useProductMock.mockReturnValue({ product, status: 'success', error: null, retry, ...overrides });
  return render(<CartProvider><ProductDetailsScreen {...props} /></CartProvider>);
}
beforeEach(() => jest.clearAllMocks());

test('shows the complete description, pricing, specifications, and every review with star-only ratings', async () => {
  await renderDetails();
  expect(screen.getByRole('button', { name: 'Add to cart' })).toHaveStyle({ backgroundColor: 'transparent' });
  expect(screen.getByRole('button', { name: 'Buy now' })).toHaveStyle({ width: '70%', backgroundColor: '#FF5A00' });
  expect(useProductMock).toHaveBeenCalledWith(1);
  expect(screen.getByText(product.title)).toBeOnTheScreen();
  expect(screen.getByText(product.description).props.numberOfLines).toBeUndefined();
  expect(screen.getByLabelText('Selected quantity total: $9.99')).toBeOnTheScreen();
  expect(screen.getByText('$11.16')).toHaveStyle({ textDecorationLine: 'line-through' });
  expect(screen.getByLabelText('Before discount: $11.16')).toBeOnTheScreen();
  expect(screen.getAllByText('-10%')).toHaveLength(1);
  expect(screen.getByText('Description')).toBeOnTheScreen();
  expect(screen.queryByText('PRODUCT DETAILS')).toBeNull();
  expect(screen.queryByText('Find your everyday favorite.')).toBeNull();
  for (const text of ['width', 'height', 'depth', '10', '20', '8', 'Weight', '7', 'Everyday', 'In Stock · 3 available', product.shippingInformation, product.warrantyInformation]) {
    expect(screen.getByText(text)).toBeOnTheScreen();
  }
  for (const review of product.reviews) {
    expect(screen.getByText(review.reviewerName)).toBeOnTheScreen();
    expect(screen.getByText(review.comment)).toBeOnTheScreen();
  }
  for (const rating of [product.rating, ...product.reviews.map(review => review.rating)]) {
    expect(screen.getByRole('image', { name: `Rated ${rating} out of 5 stars` })).toBeOnTheScreen();
    expect(screen.queryByText(String(rating))).toBeNull();
  }
});

test('renders both real gallery images after layout and selects the second image', async () => {
  await renderDetails();
  await fireEvent(screen.getByTestId('product-gallery'), 'layout', { nativeEvent: { layout: { width: 390, height: 285, x: 0, y: 0 } } });
  for (const [index, uri] of product.images.entries()) {
    expect(screen.getByLabelText(`${product.title}, image ${index + 1} of 2`)).toHaveProp('source', [{ uri }]);
  }
  await fireEvent.press(screen.getByRole('button', { name: 'Show image 2' }));
  expect(screen.getByRole('button', { name: 'Show image 2', selected: true })).toBeOnTheScreen();
  await fireEvent(screen.getByLabelText(`${product.title}, image 1 of 2`), 'scroll', { nativeEvent: { contentOffset: { x: 0, y: 0 } } });
  expect(screen.getByRole('button', { name: 'Show image 1', selected: true })).toBeOnTheScreen();
});

test('adds the selected quantity to the real cart and blocks repeated additions at the stock limit', async () => {
  await renderDetails();
  expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
  await fireEvent.press(screen.getByRole('button', { name: 'Increase quantity' }));
  expect(screen.getByLabelText('Quantity 2')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Decrease quantity' }));
  expect(screen.getByLabelText('Quantity 1')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Increase quantity' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Add to cart' }));
  expect(screen.getByRole('button', { name: 'Open cart, 2 items' })).toBeOnTheScreen();
  expect(screen.getByText('Added to Cart')).toBeOnTheScreen();
  expect(purchaseFeedback).toHaveBeenCalledWith('cart');
  await fireEvent.press(screen.getByRole('button', { name: 'Increase quantity' }));
  expect(screen.getByRole('button', { name: 'Add to cart' })).toBeDisabled();
  expect(screen.getByLabelText('Selected quantity total: $19.98')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Decrease quantity' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Add to cart' }));
  expect(screen.getByRole('button', { name: 'Open cart, 3 items' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Add to cart' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Buy now' })).toBeEnabled();
  await fireEvent.press(screen.getByRole('button', { name: 'Add to cart' }));
  expect(screen.getByRole('button', { name: 'Open cart, 3 items' })).toBeOnTheScreen();
});

test('Buy Now checks out the selected quantity directly without adding it to the cart', async () => {
  await renderDetails();
  await fireEvent.press(screen.getByRole('button', { name: 'Increase quantity' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Buy now' }));
  expect(navigation.navigate).toHaveBeenCalledWith('Checkout', { buyNow: { product, quantity: 2 } });
  expect(purchaseFeedback).toHaveBeenCalledWith('buy');
  expect(screen.getByRole('button', { name: 'Open cart, 0 items' })).toBeOnTheScreen();
});

test('prevents adding an out-of-stock product', async () => {
  await renderDetails({ product: { ...product, stock: 0, availabilityStatus: 'Out of Stock' } });
  expect(screen.getByRole('button', { name: 'Buy now' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Add to cart' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
  expect(screen.getByLabelText('Quantity 0')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Add to cart' }));
  expect(screen.getByRole('button', { name: 'Open cart, 0 items' })).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Buy now' }));
  expect(purchaseFeedback).not.toHaveBeenCalled();
});

test('opens the cart and navigates back to products', async () => {
  await renderDetails();
  await fireEvent.press(screen.getByRole('button', { name: 'Open cart, 0 items' }));
  expect(navigation.navigate).toHaveBeenCalledWith('Cart');
  await fireEvent.press(screen.getByRole('button', { name: 'Back to products' }));
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
});

test.each([
  ['loading', 'Loading product'], ['empty', 'Product not found'], ['error', 'Couldn’t load this product'],
] as const)('shows the %s state without purchase controls', async (status, title) => {
  await renderDetails({ product: null, status, error: status === 'error' ? 'Offline' : null });
  expect(screen.getByText(title)).toBeOnTheScreen();
  expect(screen.queryByText(product.title)).toBeNull();
  expect(screen.queryByRole('button', { name: 'Add to cart' })).toBeNull();
  if (status === 'loading') expect(screen.getByRole('progressbar', { name: 'Loading product' })).toBeOnTheScreen();
  if (status === 'error') {
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledTimes(1);
  } else expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
});
