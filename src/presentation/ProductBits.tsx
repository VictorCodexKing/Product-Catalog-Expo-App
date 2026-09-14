import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Product } from '../data/products';
import { useCart } from './CartContext';

export function DiscountBadge({ percentage, small = false }: { percentage: number; small?: boolean }) {
  if (percentage <= 0) return null;
  return <Text style={[styles.discount, small && styles.smallDiscount]}>{`-${Math.round(percentage) || '<1'}%`}</Text>;
}

export function Stars({ rating, size = 18 }: { rating: number; size?: number }) {
  // Keep numeric scores available to screen readers, but render only stars.
  const rounded = Math.round(rating * 2) / 2;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`Rated ${rating} out of 5 stars`} style={styles.stars}>
      {[1, 2, 3, 4, 5].map(star => <Ionicons key={star} accessible={false}
        name={rounded >= star ? 'star' : rounded >= star - 0.5 ? 'star-half' : 'star-outline'} size={size} color="#F59E0B" />)}
    </View>
  );
}

export function ProductPrice({ product }: { product: Product }) {
  const discount = product.discountPercentage;
  // The reference uses API price as the selling price; infer the crossed-out price.
  const original = discount > 0 && discount < 100 ? product.price / (1 - discount / 100) : null;
  return (
    <View style={styles.priceRow}>
      <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      {original !== null && <Text accessibilityLabel={`Before discount: $${original.toFixed(2)}`} style={styles.original}>${original.toFixed(2)}</Text>}
      <DiscountBadge percentage={discount} />
    </View>
  );
}

export function CartButton({ onPress }: { onPress: () => void }) {
  const { itemCount } = useCart();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open cart, ${itemCount} items`} style={styles.cartButton}>
      <Ionicons name="bag-outline" size={23} color="#20242B" />
      {itemCount > 0 && <View style={styles.countBadge}><Text style={styles.countText}>{itemCount > 99 ? '99+' : itemCount}</Text></View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  discount: { alignSelf: 'flex-start', color: '#C83036', backgroundColor: '#FFE5E6', fontWeight: '700', fontSize: 13, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7 },
  smallDiscount: { backgroundColor: '#EF454A', color: '#FFFFFF', fontSize: 11, borderRadius: 7, paddingHorizontal: 6, paddingVertical: 4 },
  stars: { flexDirection: 'row', gap: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  price: { fontSize: 27, fontWeight: '700', letterSpacing: -0.7, color: '#20242B' },
  original: { fontSize: 16, color: '#8B919D', textDecorationLine: 'line-through' },
  cartButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EAEBEE' },
  countBadge: { position: 'absolute', right: -3, top: -3, minWidth: 18, paddingHorizontal: 4, height: 18, borderRadius: 9, backgroundColor: '#E86619', alignItems: 'center', justifyContent: 'center' },
  countText: { fontSize: 9, fontWeight: '700', color: '#FFFFFF' },
});
