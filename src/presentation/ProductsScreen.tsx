import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { ComponentProps, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Product } from '../data/products';
import { useProducts } from './useProducts';

type IconName = ComponentProps<typeof Ionicons>['name'];
const accent = '#E86619';
const tabs: { title: string; icon: IconName }[] = [
  { title: 'Home', icon: 'home-outline' },
  { title: 'Products', icon: 'cube-outline' },
  { title: 'Orders', icon: 'receipt-outline' },
  { title: 'More', icon: 'ellipsis-horizontal' },
];

// These controls reserve the reference layout for later catalog features.
function UpcomingControl({ label, icon, search = false }: { label: string; icon: IconName; search?: boolean }) {
  return (
    <Pressable disabled accessibilityRole="button" accessibilityLabel={`${label}, coming soon`}
      accessibilityState={{ disabled: true }} style={[styles.control, search && styles.search]}>
      {search && <Ionicons name="search-outline" size={19} color="#8C9199" />}
      {(search || label === 'Status' || label === 'Category') && <Text style={styles.controlText}>{label}</Text>}
      {!search && <Ionicons name={icon} size={label === 'Status' || label === 'Category' ? 15 : 21} color="#787F89" />}
    </Pressable>
  );
}

export function ProductRow({ product }: { product: Product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const inStock = product.stock > 0;
  return (
    <View style={styles.product}>
      <View style={styles.thumbnail}>
        {imageFailed ? <Ionicons name="image-outline" size={27} color="#9CA2AA" accessibilityLabel="Image unavailable" /> : (
          <Image source={{ uri: product.thumbnail }} style={styles.image} contentFit="contain"
            accessibilityLabel={product.title} onError={() => setImageFailed(true)} />
        )}
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
    </View>
  );
}

function CatalogState({ status, retry }: { status: 'loading' | 'error' | 'empty'; retry: () => void }) {
  return (
    <View style={styles.state} accessibilityLiveRegion="polite">
      {status === 'loading' ? <ActivityIndicator accessible accessibilityRole="progressbar" size="large" color={accent} accessibilityLabel="Loading products" /> : (
        <View style={styles.stateIcon}><Ionicons name={status === 'error' ? 'cloud-offline-outline' : 'cube-outline'} size={30} color={accent} /></View>
      )}
      <Text style={styles.stateTitle}>{status === 'loading' ? 'Loading products' : status === 'error' ? 'Couldn’t load products' : 'No products yet'}</Text>
      <Text style={styles.stateDescription}>{status === 'loading' ? 'Your catalog is on its way.' : status === 'error' ? 'Check your connection and try again.' : 'Check back soon for new arrivals.'}</Text>
      {status !== 'loading' && <Pressable accessibilityRole="button" onPress={retry} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable>}
    </View>
  );
}

export default function ProductsScreen() {
  const { products, total, status, retry, loadMore, loadingMore, pageError, retryMore, hasMore } = useProducts();
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.app}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>THE EVERYDAY COLLECTION</Text><Text accessibilityRole="header" style={styles.heading}>Products</Text></View>
          <View style={styles.avatar} accessibilityLabel="Victor24"><Text style={styles.avatarText}>V24</Text></View>
        </View>
        <View style={styles.toolbar}>
          <View style={styles.controls}>
            <UpcomingControl label="Search products" icon="search-outline" search />
            <UpcomingControl label="Filter products" icon="options-outline" />
            <UpcomingControl label="Camera scanner" icon="scan-outline" />
          </View>
          <View style={styles.controls}>
            <UpcomingControl label="Status" icon="chevron-down" />
            <UpcomingControl label="Category" icon="chevron-down" />
          </View>
        </View>
        <View style={styles.listHeading}>
          <Text style={styles.sectionLabel}>ALL PRODUCTS</Text>
          {status === 'success' && <Text style={styles.count}>{products.length} of {total}</Text>}
        </View>
        {status !== 'success' ? <CatalogState status={status} retry={retry} /> : (
          <FlatList data={products} keyExtractor={item => String(item.id)}
            renderItem={({ item }) => <ProductRow product={item} />}
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
        <View style={styles.tabs} accessibilityRole="tablist">
          {tabs.map(tab => {
            const selected = tab.title === 'Products';
            return (
              <Pressable key={tab.title} disabled={!selected} accessibilityRole="tab"
                accessibilityLabel={selected ? tab.title : `${tab.title}, coming soon`}
                accessibilityState={{ selected, disabled: !selected }} style={styles.tab}>
                <View style={[styles.tabIcon, selected && styles.selectedTab]}>
                  <Ionicons name={tab.icon} size={23} color={selected ? accent : '#91959C'} />
                </View>
                <Text style={[styles.tabLabel, selected && styles.selectedLabel]}>{tab.title}</Text>
              </Pressable>
            );
          })}
        </View>
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
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF0E5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFE1C9' },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#A5521D' },
  toolbar: { paddingHorizontal: 24, gap: 12, paddingBottom: 21 },
  controls: { flexDirection: 'row', gap: 10 },
  control: { minWidth: 44, minHeight: 44, paddingHorizontal: 11, borderWidth: 1, borderColor: '#E9EAED', borderRadius: 11, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDFDFD' },
  search: { flex: 1, justifyContent: 'flex-start' },
  controlText: { color: '#858B94', fontSize: 13 },
  listHeading: { paddingHorizontal: 24, paddingVertical: 13, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F0F1F3', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FCFCFD' },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: '#858B94' },
  count: { fontSize: 11, color: '#858B94' },
  list: { paddingHorizontal: 24 },
  product: { flexDirection: 'row', gap: 15, paddingVertical: 20, borderBottomWidth: 1, borderColor: '#EDEFF1', alignItems: 'center' },
  thumbnail: { width: 80, height: 86, borderRadius: 13, backgroundColor: '#F5F5F3', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
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
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#ECEEF1', paddingTop: 10, paddingBottom: 12, backgroundColor: '#FFFFFF' },
  tab: { flex: 1, alignItems: 'center', gap: 5 },
  tabIcon: { paddingHorizontal: 20, paddingVertical: 7, borderRadius: 14 },
  selectedTab: { backgroundColor: '#FFF0E5' },
  tabLabel: { fontSize: 11, color: '#91959C' },
  selectedLabel: { color: accent, fontWeight: '700' },
});
