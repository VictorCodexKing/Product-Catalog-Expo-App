import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CatalogFilters, Product } from '../data/products';
import { useProducts } from './useProducts';
import { CartButton, DiscountBadge } from './ProductBits';
import { useCart } from './CartContext';
import { RootStackParamList } from './navigation';
import FooterTabs from './FooterTabs';
import CatalogControls from './CatalogControls';
import { useDebouncedValue } from './useDebouncedValue';

const accent = '#E86619';

export function ProductRow({ product, onPress }: { product: Product; onPress: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const inStock = product.stock > 0;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`View ${product.title}`} style={styles.product}>
      <View style={styles.thumbnail}>
        {imageFailed ? <Ionicons name="image-outline" size={27} color="#9CA2AA" accessibilityLabel="Image unavailable" /> : (
          <Image source={{ uri: product.thumbnail }} style={styles.image} contentFit="contain"
            accessibilityLabel={product.title} onError={() => setImageFailed(true)} />
        )}
        <View style={styles.discount}><DiscountBadge percentage={product.discountPercentage} small /></View>
      </View>
      <View style={styles.productInfo}>
        <View style={[styles.badge, !inStock && styles.soldOut]}>
          <Ionicons name={inStock ? 'checkmark-circle' : 'close-circle'} size={12} color={inStock ? '#22763A' : '#A73939'} />
          <Text style={[styles.badgeText, !inStock && styles.soldOutText]}>{inStock ? 'In stock' : 'Out of stock'}</Text>
        </View>
        <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
        <View style={styles.priceLine}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <Text style={styles.stock}>·  {product.stock} in stock</Text>
        </View>
        <Text style={styles.category}>{product.category.replace(/-/g, ' ')}</Text>
      </View>
    </Pressable>
  );
}

function CatalogState({ status, retry, filtered, clear }: { status: 'loading' | 'error' | 'empty'; retry: () => void; filtered: boolean; clear: () => void }) {
  return (
    <View style={styles.state} accessibilityLiveRegion="polite">
      {status === 'loading' ? <ActivityIndicator accessible accessibilityRole="progressbar" size="large" color={accent} accessibilityLabel="Loading products" /> : (
        <View style={styles.stateIcon}><Ionicons name={status === 'error' ? 'cloud-offline-outline' : 'cube-outline'} size={30} color={accent} /></View>
      )}
      <Text style={styles.stateTitle}>{status === 'loading' ? 'Loading products' : status === 'error' ? 'Couldn’t load products' : filtered ? 'No matching products' : 'No products yet'}</Text>
      <Text style={styles.stateDescription}>{status === 'loading' ? 'Your catalog is on its way.' : status === 'error' ? 'Check your connection and try again.' : filtered ? 'Try another search or clear your filters.' : 'Check back soon for new arrivals.'}</Text>
      {status !== 'loading' && <Pressable accessibilityRole="button" onPress={status === 'empty' && filtered ? clear : retry} style={styles.retry}><Text style={styles.retryText}>{status === 'empty' && filtered ? 'Clear all filters' : 'Try again'}</Text></Pressable>}
    </View>
  );
}

export default function ProductsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { notifications = [] } = useCart();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const debouncedQuery = useDebouncedValue(query.trim());
  const waiting = query.trim() !== debouncedQuery;
  const filtered = Boolean(query.trim() || category || brand || minPrice != null || maxPrice != null);
  const clear = () => { setQuery(''); setCategory(''); setBrand(''); setMinPrice(null); setMaxPrice(null); };
  const applyFilters = (filters: Pick<CatalogFilters, 'category' | 'brand' | 'minPrice' | 'maxPrice'>) => {
    setCategory(filters.category ?? '');
    setBrand(filters.brand ?? '');
    setMinPrice(filters.minPrice ?? null);
    setMaxPrice(filters.maxPrice ?? null);
  };
  const { products, total, status: resultStatus, retry, loadMore, loadingMore, pageError, retryMore, hasMore } = useProducts({ query: debouncedQuery, category, brand, minPrice, maxPrice });
  const status = waiting ? 'loading' : resultStatus;
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.app}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>THE EVERYDAY COLLECTION</Text><Text accessibilityRole="header" style={styles.heading}>Products</Text></View>
          <View style={styles.headerActions}>
            <CartButton onPress={() => navigation.navigate('Cart')} />
            <Pressable accessibilityRole="button" accessibilityLabel="Open notifications" style={styles.notification}
              onPress={() => navigation.navigate('Notifications')}><Ionicons name="notifications-outline" size={23} color="#20242B" />
              {notifications.some(notification => !notification.viewed) && <View style={styles.notificationDot} />}
            </Pressable>
          </View>
        </View>
        <CatalogControls query={query} onQuery={setQuery} category={category} brand={brand} minPrice={minPrice} maxPrice={maxPrice} onApply={applyFilters} />
        <View style={styles.listHeading} accessibilityLiveRegion="polite">
          <Text style={styles.sectionLabel}>{filtered ? 'RESULTS' : 'ALL PRODUCTS'}</Text>
          {filtered && <Pressable accessibilityRole="button" accessibilityLabel="Reset filters" onPress={clear} style={styles.reset}><Text style={styles.resetText}>Reset</Text></Pressable>}
          {status === 'success' && <Text style={styles.count}>{products.length} of {total}</Text>}
        </View>
        {status !== 'success' ? <CatalogState status={status} retry={retry} filtered={filtered} clear={clear} /> : (
          <FlatList key={JSON.stringify([debouncedQuery, category, brand, minPrice, maxPrice])} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" data={products} keyExtractor={item => String(item.id)}
            renderItem={({ item }) => <ProductRow product={item} onPress={() => navigation.navigate('ProductDetails', { productId: item.id })} />}
            onEndReached={loadMore} onEndReachedThreshold={0.4}
            contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View style={styles.pagination} accessibilityLiveRegion="polite">
                {loadingMore ? <><ActivityIndicator accessible color={accent} accessibilityRole="progressbar" accessibilityLabel="Loading more products" /><Text style={styles.footerText}>Loading more products…</Text></> : pageError ? (
                  <View style={styles.pageError}>
                    <Text style={styles.pageErrorText}>Couldn’t load more products.</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel="Retry loading more products" onPress={retryMore} style={styles.retry}>
                      <Text style={styles.retryText}>Try again</Text>
                    </Pressable>
                  </View>
                ) : <Text style={styles.footerText}>{hasMore ? 'Scroll for more products' : 'You’ve reached the end'}</Text>}
              </View>
            } />
        )}
        <FooterTabs active="Products" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F5F7', alignItems: 'center' },
  app: { flex: 1, width: '100%', maxWidth: 560, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 26, paddingBottom: 22 },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.6, color: '#8B7B6F', marginBottom: 7 },
  heading: { fontSize: 33, fontWeight: '700', letterSpacing: -1.1, color: '#20242B' },
  notification: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EAEBEE' },
  notificationDot: { position: 'absolute', right: 8, top: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5A00', borderWidth: 1.5, borderColor: '#FFFFFF' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reset: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', marginVertical: -12 },
  resetText: { color: '#B94C12', fontSize: 12, fontWeight: '600' },
  listHeading: { paddingHorizontal: 24, paddingVertical: 13, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F0F1F3', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FCFCFD' },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: '#858B94' },
  count: { fontSize: 11, color: '#858B94' },
  list: { paddingHorizontal: 24 },
  product: { flexDirection: 'row', gap: 15, paddingVertical: 20, borderBottomWidth: 1, borderColor: '#EDEFF1', alignItems: 'center' },
  thumbnail: { width: 80, height: 86, borderRadius: 13, backgroundColor: '#F5F5F3', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  discount: { position: 'absolute', top: 0, left: 0 },
  productInfo: { flex: 1, gap: 5 },
  badge: { flexDirection: 'row', gap: 4, alignItems: 'center', alignSelf: 'flex-start', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3, backgroundColor: '#E6F6E9' },
  badgeText: { fontSize: 10, color: '#22763A', fontWeight: '600' },
  soldOut: { backgroundColor: '#FDEBEC' },
  soldOutText: { color: '#A73939' },
  productTitle: { fontSize: 14, lineHeight: 20, fontWeight: '600', color: '#252930' },
  priceLine: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  price: { fontSize: 15, fontWeight: '700', color: '#252930' },
  stock: { fontSize: 11, color: '#7E858F' },
  category: { fontSize: 11, color: '#858B94', textTransform: 'capitalize' },
  pagination: { paddingVertical: 24, alignItems: 'center', gap: 10 },
  footerText: { textAlign: 'center', fontSize: 12, color: '#858B94' },
  pageError: { alignItems: 'center', gap: 12, padding: 18, width: '100%', backgroundColor: '#FFF4F3', borderRadius: 12 },
  pageErrorText: { fontSize: 13, color: '#A73939' },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 },
  stateIcon: { backgroundColor: '#FFF2E8', padding: 18, borderRadius: 40 },
  stateTitle: { fontSize: 19, fontWeight: '600', color: '#252930', textAlign: 'center' },
  stateDescription: { color: '#7E858F', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  retry: { backgroundColor: accent, borderRadius: 11, paddingHorizontal: 24, paddingVertical: 14 },
  retryText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
});
