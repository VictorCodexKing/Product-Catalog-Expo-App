import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProductDetail } from '../data/products';

function GalleryImage({ uri, title }: { uri: string; title: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <View style={styles.fallback}><Ionicons name="image-outline" size={40} color="#9A9EA6" /><Text style={styles.fallbackText}>Image unavailable</Text></View>
  ) : <Image source={{ uri }} accessibilityLabel={title} contentFit="contain" style={styles.image} onError={() => setFailed(true)} />;
}

export default function ProductGallery({ product }: { product: ProductDetail }) {
  const images = product.images.length ? product.images : [product.thumbnail];
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(0);
  const gallery = useRef<ScrollView>(null);
  return (
    <View testID="product-gallery" style={styles.hero} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 && <ScrollView ref={gallery} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={event => setSelected(Math.max(0, Math.min(images.length - 1, Math.round(event.nativeEvent.contentOffset.x / width))))}>
        {images.map((uri, index) => <View key={`${uri}-${index}`} style={{ width, height: 270, padding: 18 }}>
          <GalleryImage uri={uri} title={`${product.title}, image ${index + 1} of ${images.length}`} />
        </View>)}
      </ScrollView>}
      {images.length > 1 && <View style={styles.dots}>
        {images.map((_, index) => <Pressable key={index} accessibilityRole="button" accessibilityLabel={`Show image ${index + 1}`}
          accessibilityState={{ selected: selected === index }} style={styles.dotButton}
          onPress={() => { gallery.current?.scrollTo({ x: width * index, animated: true }); setSelected(index); }}>
          <View style={[styles.dot, index === selected && styles.activeDot]} />
        </Pressable>)}
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#F3F4F5', minHeight: 285, paddingBottom: 15 },
  image: { width: '100%', height: '100%' },
  dots: { flexDirection: 'row', justifyContent: 'center' },
  dotButton: { minWidth: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#CACDD2' },
  activeDot: { backgroundColor: '#262A31', width: 18 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  fallbackText: { color: '#8B919D', fontSize: 13 },
});
