import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductDetail } from '../data/products';
import { useCart } from './CartContext';
import { RootStackParamList } from './navigation';
import { CartButton, ProductPrice, Stars } from './ProductBits';
import ProductGallery from './ProductGallery';
import { useProduct } from './useProduct';
import { purchaseFeedback } from './purchaseFeedback';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

function DetailContent({ product, buyNow }: { product: ProductDetail; buyNow: (quantity: number) => void }) {
  const { items, addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [buyOpen, setBuyOpen] = useState(false);
  const [added, setAdded] = useState(0);
  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(0), 1800);
    return () => clearTimeout(timer);
  }, [added]);
  const inCart = items.find(item => item.product.id === product.id)?.quantity ?? 0;
  const remaining = Math.max(0, product.stock - inCart);
  const amount = Math.min(quantity, product.stock);
  const inStock = product.stock > 0;
  const cannotAdd = remaining < 1;
  const selectionTotal = (Math.round(product.price * 100) * amount / 100).toFixed(2);

  return (
    <>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <ProductGallery product={product} />
        <View style={styles.content}>
          <View style={styles.meta}>
            <View style={[styles.stockBadge, !inStock && styles.outOfStock]}>
              <View style={[styles.stockDot, !inStock && styles.outOfStockDot]} />
              <Text style={[styles.stockText, !inStock && styles.outOfStockText]}>{inStock ? 'In stock' : 'Out of stock'}</Text>
            </View>
            <Text style={styles.category}>{product.category.replace(/-/g, ' ')}</Text>
          </View>
          <Text accessibilityRole="header" style={styles.title}>{product.title}</Text>
          <ProductPrice product={product} />
          <View style={styles.ratingRow}><Stars rating={product.rating} /><Text style={styles.muted}>{product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'}</Text></View>

          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description || 'No description available.'}</Text>
          </View>

          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>Dimensions</Text>
            <View style={styles.dimensions}>
              {(['width', 'height', 'depth'] as const).map(dimension => <View key={dimension} style={styles.dimension}>
                <Text style={styles.dimensionValue}>{product.dimensions[dimension]}</Text><Text style={styles.dimensionLabel}>{dimension}</Text>
              </View>)}
            </View>
            <View style={styles.specLine}><Text style={styles.muted}>Weight</Text><Text style={styles.specValue}>{product.weight}</Text></View>
            {product.brand && <View style={styles.specLine}><Text style={styles.muted}>Brand</Text><Text style={styles.specValue}>{product.brand}</Text></View>}
            <View style={styles.specLine}><Text style={styles.muted}>Availability</Text><Text style={styles.specValue}>{product.availabilityStatus} · {product.stock} available</Text></View>
          </View>

          <View style={styles.serviceRow}>
            <View style={styles.service}><Ionicons name="car-outline" size={23} color="#656D76" /><Text style={styles.serviceTitle}>Shipping</Text><Text style={styles.serviceText}>{product.shippingInformation}</Text></View>
            <View style={styles.service}><Ionicons name="shield-checkmark-outline" size={23} color="#656D76" /><Text style={styles.serviceTitle}>Warranty</Text><Text style={styles.serviceText}>{product.warrantyInformation}</Text></View>
          </View>

          <View style={styles.section}>
            <View style={styles.reviewHeading}><Text accessibilityRole="header" style={styles.sectionTitle}>Customer reviews</Text><Text style={styles.reviewCount}>{product.reviews.length}</Text></View>
            {product.reviews.length === 0 ? <Text style={styles.description}>No reviews yet.</Text> : product.reviews.map((review, index) => (
              <View key={`${review.reviewerName}-${review.date}-${index}`} style={styles.review}>
                <View style={styles.reviewerLine}>
                  <View style={styles.reviewerAvatar}><Text style={styles.reviewerInitial}>{review.reviewerName.charAt(0)}</Text></View>
                  <View style={styles.reviewerInfo}><Text style={styles.reviewerName}>{review.reviewerName}</Text><Text style={styles.reviewDate}>{new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</Text></View>
                  <Stars rating={review.rating} size={13} />
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.purchase}>
        {added > 0 && <View style={styles.toast} accessibilityLiveRegion="polite"><Ionicons name="checkmark-circle" size={17} color="#167A3D" /><Text style={styles.toastText}>Added to Cart</Text></View>}
        <View style={styles.purchaseRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Add to cart" disabled={cannotAdd}
            style={({ pressed }) => [styles.addButton, cannotAdd && styles.disabledOutline, pressed && styles.pressed]} onPress={() => {
              if (cannotAdd) return;
              addItem(product, 1);
              setAdded(previous => previous + 1);
              void purchaseFeedback('cart');
              setQuantity(1);
            }}>
            <Ionicons name={added ? 'checkmark' : 'cart-outline'} size={23} color={cannotAdd ? '#A4A9B1' : '#252930'} />
            <Text style={[styles.cartLabel, cannotAdd && { color: '#A4A9B1' }]}>{added ? 'Added' : 'Add to Cart'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Buy now" disabled={!inStock}
            style={({ pressed }) => [styles.buyButton, !inStock && styles.disabledButton, pressed && styles.pressed]} onPress={() => {
              if (!inStock) return;
              void purchaseFeedback('buy');
              setQuantity(1);
              setBuyOpen(true);
            }}>
            <Text style={styles.addText}>Buy Now</Text>
          </Pressable>
        </View>
      </View>
      <Modal visible={buyOpen} transparent animationType="slide" onRequestClose={() => setBuyOpen(false)}>
        <View style={styles.sheetOverlay}>
          <Pressable accessibilityRole="button" accessibilityLabel="Dismiss purchase options" onPress={() => setBuyOpen(false)} style={StyleSheet.absoluteFill} />
          <SafeAreaView edges={['bottom']} style={styles.sheet} accessibilityViewIsModal>
            <View style={styles.handle} />
            <View style={styles.sheetHeading}><Text accessibilityRole="header" style={styles.sectionTitle}>Your selection</Text><Pressable accessibilityRole="button" accessibilityLabel="Close purchase options" onPress={() => setBuyOpen(false)} style={styles.step}><Ionicons name="close" size={24} color="#252930" /></Pressable></View>
            <ScrollView contentContainerStyle={styles.sheetContent}>
              <View style={styles.sheetProduct}>
                <Image source={{ uri: product.thumbnail }} contentFit="contain" style={styles.sheetImage} accessibilityLabel={`${product.title} thumbnail`} />
                <View style={styles.sheetInfo}><Text numberOfLines={2} style={styles.sectionTitle}>{product.title}</Text><ProductPrice product={product} /><Text style={styles.muted}>{product.stock} in stock</Text></View>
              </View>
              <View style={styles.quantityCard}>
                <View><Text style={styles.quantityLabel}>Quantity</Text><Text accessibilityLabel={`Selected quantity total: $${selectionTotal}`} style={styles.quantityTotal}>${selectionTotal} total</Text></View>
                <View style={styles.stepper}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Decrease quantity" disabled={amount <= 1} style={styles.step} onPress={() => setQuantity(amount - 1)}><Ionicons name="remove" size={18} color={amount <= 1 ? '#BCC0C6' : '#20242B'} /></Pressable>
                  <Text accessibilityLabel={`Quantity ${amount}`} style={styles.quantity}>{amount}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Increase quantity" disabled={amount >= product.stock} style={styles.step} onPress={() => setQuantity(amount + 1)}><Ionicons name="add" size={18} color={amount >= product.stock ? '#BCC0C6' : '#20242B'} /></Pressable>
                </View>
              </View>
            </ScrollView>
            <Pressable accessibilityRole="button" accessibilityLabel="Confirm buy now" disabled={!inStock} style={[styles.buyButton, styles.confirmButton]} onPress={() => {
              // Quantity is confirmed here; opening or dismissing the sheet never changes the cart.
              if (!amount) return;
              setBuyOpen(false);
              void purchaseFeedback('buy');
              buyNow(amount);
            }}><Text style={styles.addText}>Buy Now · ${selectionTotal}</Text></Pressable>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

export default function ProductDetailsScreen({ route, navigation }: Props) {
  const { product, status, retry } = useProduct(route.params.productId);
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.app}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to products" onPress={() => navigation.goBack()} style={styles.back}><Ionicons name="chevron-back" size={25} color="#20242B" /></Pressable>
          <CartButton onPress={() => navigation.navigate('Cart')} />
        </View>
        {status === 'success' && product ? <DetailContent key={product.id} product={product}
          buyNow={quantity => navigation.navigate('Checkout', { buyNow: { product, quantity } })} /> : (
          <View style={styles.state} accessibilityLiveRegion="polite">
            {status === 'loading' ? <ActivityIndicator accessible accessibilityRole="progressbar" accessibilityLabel="Loading product" color="#E86619" size="large" /> : <Ionicons name={status === 'error' ? 'cloud-offline-outline' : 'cube-outline'} size={40} color="#E86619" />}
            <Text style={styles.stateTitle}>{status === 'loading' ? 'Loading product' : status === 'empty' ? 'Product not found' : 'Couldn’t load this product'}</Text>
            <Text style={styles.stateDescription}>{status === 'loading' ? 'A closer look is on its way.' : status === 'empty' ? 'This product is no longer available.' : 'Please check your connection and try again.'}</Text>
            {status === 'error' && <Pressable accessibilityRole="button" onPress={retry} style={styles.stateRetry}><Text style={styles.addText}>Try again</Text></Pressable>}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', backgroundColor: '#F4F5F7' },
  app: { width: '100%', maxWidth: 560, flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F3F4F5' },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F5' },
  scroll: { flex: 1 },
  content: { marginTop: -10, padding: 24, paddingBottom: 4, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: '#FFFFFF', gap: 14 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  stockBadge: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#DFF8E9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  stockDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#179548' },
  stockText: { color: '#167A3D', fontSize: 11, fontWeight: '600' },
  outOfStock: { backgroundColor: '#FDEBEC' },
  outOfStockDot: { backgroundColor: '#B43D42' },
  outOfStockText: { color: '#A73939' },
  category: { color: '#92969D', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', flexShrink: 1 },
  title: { color: '#20242B', fontSize: 26, lineHeight: 33, fontWeight: '700', letterSpacing: -0.7 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quantityCard: { marginTop: 4, padding: 14, borderRadius: 16, backgroundColor: '#F7F8F9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  quantityLabel: { fontSize: 13, fontWeight: '700', color: '#252930' },
  quantityTotal: { marginTop: 4, fontSize: 11, color: '#858B94' },
  muted: { fontSize: 12, color: '#858B94' },
  section: { marginTop: 10, gap: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#252A32' },
  description: { fontSize: 14, lineHeight: 23, color: '#737A84' },
  dimensions: { flexDirection: 'row', gap: 8 },
  dimension: { flex: 1, paddingVertical: 15, alignItems: 'center', backgroundColor: '#F6F7F8', borderRadius: 12, gap: 6 },
  dimensionValue: { fontSize: 17, fontWeight: '600', color: '#252A32' },
  dimensionLabel: { fontSize: 11, textTransform: 'capitalize', color: '#858B94' },
  specLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  specValue: { fontSize: 12, color: '#414852', flexShrink: 1, textAlign: 'right' },
  serviceRow: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  service: { flex: 1, borderWidth: 1, borderColor: '#ECEEF0', borderRadius: 14, padding: 15, gap: 7 },
  serviceTitle: { fontSize: 12, fontWeight: '600', color: '#343A43' },
  serviceText: { fontSize: 11, color: '#858B94', lineHeight: 17 },
  reviewHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewCount: { backgroundColor: '#F0F1F3', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, color: '#7E858F', fontSize: 11 },
  review: { borderBottomWidth: 1, borderColor: '#ECEEF0', paddingTop: 12, paddingBottom: 10, gap: 10 },
  reviewerLine: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  reviewerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F6EDE5', alignItems: 'center', justifyContent: 'center' },
  reviewerInitial: { fontSize: 12, fontWeight: '600', color: '#91725A' },
  reviewerInfo: { flex: 1, gap: 4 },
  reviewerName: { fontSize: 12, fontWeight: '600', color: '#343A43' },
  reviewDate: { fontSize: 10, color: '#959AA2' },
  reviewComment: { color: '#717984', fontSize: 13, lineHeight: 20 },
  purchase: { borderTopWidth: 1, borderColor: '#ECEEF0', paddingHorizontal: 24, paddingBottom: 14, paddingTop: 12, gap: 9, backgroundColor: '#FFFFFF' },
  purchaseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E4E6E9', borderRadius: 25 },
  step: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  quantity: { minWidth: 26, fontSize: 14, fontWeight: '600', color: '#20242B', textAlign: 'center' },
  addButton: { flex: 1, minHeight: 54, borderRightWidth: 1, borderColor: '#E4E6E9', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', gap: 4 },
  cartLabel: { fontSize: 10, fontWeight: '600', color: '#252930', textAlign: 'center' },
  sheetOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: '#18202C73' },
  sheet: { width: '100%', maxWidth: 560, maxHeight: '85%', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: '#FFFFFF', paddingHorizontal: 22, paddingBottom: 16 },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: '#DADDE2', marginTop: 10 },
  sheetHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6 },
  sheetContent: { gap: 20, paddingBottom: 22 },
  sheetProduct: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  sheetImage: { width: 100, height: 112, borderRadius: 16, backgroundColor: '#F4F5F7' },
  sheetInfo: { flex: 1, gap: 10 },
  confirmButton: { width: '100%', minHeight: 58, marginBottom: 8 },
  addText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', flexShrink: 1, textAlign: 'center' },
  buyButton: { width: '70%', minHeight: 54, paddingHorizontal: 20, borderRadius: 18, backgroundColor: '#FF5A00', justifyContent: 'center', alignItems: 'center' },
  toast: { position: 'absolute', right: 24, top: -39, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 18, backgroundColor: '#E8F7ED', borderWidth: 1, borderColor: '#C7EAD2' },
  toastText: { fontSize: 11, fontWeight: '700', color: '#167A3D' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  disabledButton: { backgroundColor: '#A4A9B1' },
  disabledOutline: { borderColor: '#D7DADF' },
  state: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28, gap: 16 },
  stateTitle: { fontSize: 19, fontWeight: '600', color: '#20242B', textAlign: 'center' },
  stateDescription: { fontSize: 13, lineHeight: 20, color: '#858B94', textAlign: 'center' },
  stateRetry: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, backgroundColor: '#E86619' },
});
