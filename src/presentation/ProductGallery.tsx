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
      {width > 0 && <ScrollView ref={gallery} horizontal pagingEnabled showsHorizontalScrollIndicator={false} scrollEventThrottle={16}
        onContentSizeChange={() => gallery.current?.scrollTo({ x: width * selected, animated: false })}
        onScroll={event => setSelected(Math.max(0, Math.min(images.length - 1, Math.round(event.nativeEvent.contentOffset.x / width))))}>
        {images.map((uri, index) => <View key={`${uri}-${index}`} style={{ width, height: Math.min(width * 1.12, 480), padding: 12, paddingBottom: 48 }}>
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
  hero: { backgroundColor: '#F3F4F5', minHeight: 285 },
  image: { width: '100%', height: '100%' },
  dots: { position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', justifyContent: 'center' },
  dotButton: { width: 24, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#CACDD2' },
  activeDot: { backgroundColor: '#202020' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  fallbackText: { color: '#8B919D', fontSize: 13 },
});
