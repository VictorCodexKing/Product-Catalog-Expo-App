import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCart } from './CartContext';
import type { RootStackParamList } from './navigation';
import { ProductPrice } from './ProductBits';
import SwipeableCartItem from './SwipeableCartItem';

export default function CartScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Cart'>) {
  const { items, itemCount, total, setQuantity } = useCart();
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.app}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="#252930" />
          </Pressable>
          <View style={styles.headerText}>
            <Text accessibilityRole="header" style={styles.heading}>Cart</Text>
            <Text style={styles.muted}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</Text>
          </View>
          <Ionicons name="cart-outline" size={24} color="#E86619" />
        </View>
        {items.length ? <>
          <FlatList data={items} keyExtractor={item => String(item.product.id)} contentContainerStyle={styles.list}
            renderItem={({ item: { product, quantity } }) => (
              <SwipeableCartItem title={product.title} onDelete={() => setQuantity(product.id, 0)}>
                <Image source={{ uri: product.thumbnail }} contentFit="contain" accessibilityLabel={product.title} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
                  <ProductPrice product={product} compact />
                  <Text style={styles.muted}>Price per item</Text>
                  {quantity >= product.stock && <Text style={styles.muted}>Stock limit reached</Text>}
                </View>
                <View style={styles.stepper}>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Decrease ${product.title} quantity`}
                    onPress={() => setQuantity(product.id, quantity - 1)} style={styles.iconButton}>
                    <Ionicons name="remove" size={18} color="#252930" />
                  </Pressable>
                  <Text accessibilityLabel={`${product.title} quantity: ${quantity}`} style={styles.quantity}>{quantity}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Increase ${product.title} quantity`}
                    disabled={quantity >= product.stock} accessibilityState={{ disabled: quantity >= product.stock }}
                    onPress={() => setQuantity(product.id, quantity + 1)} style={styles.iconButton}>
                    <Ionicons name="add" size={18} color={quantity >= product.stock ? '#BCC0C6' : '#252930'} />
                  </Pressable>
                </View>
              </SwipeableCartItem>
            )} />
          <View style={styles.summary} accessibilityLiveRegion="polite">
            <View style={styles.totalRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.total}>${total.toFixed(2)}</Text></View>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Checkout')} style={styles.checkout}>
              <Text style={styles.browseText}>Checkout</Text><Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
            </Pressable>
          </View>
        </> : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Ionicons name="cart-outline" size={36} color="#E86619" /></View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyDescription}>Find something you love in the collection.</Text>
            <Pressable accessibilityRole="button" onPress={() => navigation.popTo('Products')} style={styles.browse}>
              <Text style={styles.browseText}>Browse products</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F5F7', alignItems: 'center' },
  app: { flex: 1, width: '100%', maxWidth: 560, backgroundColor: '#FFFFFF' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderColor: '#ECEEF1' },
  headerText: { flex: 1, gap: 3 },
  heading: { fontSize: 28, fontWeight: '700', color: '#252930' },
  muted: { fontSize: 12, fontWeight: '400', color: '#7E858F' },
  list: { paddingHorizontal: 24 },
  image: { width: 88, height: 100, borderRadius: 14, backgroundColor: '#F5F5F3' },
  info: { flex: 1, gap: 7 },
  title: { fontSize: 14, lineHeight: 20, fontWeight: '600', color: '#252930' },
  stepper: { alignItems: 'center', borderWidth: 1, borderColor: '#E9EAED', borderRadius: 24 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  quantity: { minWidth: 24, textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#252930' },
  summary: { padding: 24, borderTopWidth: 1, borderColor: '#ECEEF1', gap: 18 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkout: { minHeight: 52, borderRadius: 18, backgroundColor: '#20242B', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  totalLabel: { fontSize: 17, fontWeight: '600', color: '#252930' },
  total: { fontSize: 26, fontWeight: '700', color: '#252930' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 },
  emptyIcon: { padding: 22, borderRadius: 48, backgroundColor: '#FFF0E5' },
  emptyTitle: { fontSize: 21, fontWeight: '600', color: '#252930' },
  emptyDescription: { fontSize: 13, color: '#7E858F', textAlign: 'center', lineHeight: 20 },
  browse: { marginTop: 6, backgroundColor: '#E86619', borderRadius: 11, paddingHorizontal: 24, paddingVertical: 15 },
  browseText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
