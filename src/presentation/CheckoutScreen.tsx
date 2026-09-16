import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useCart } from './CartContext';
import { RootStackParamList } from './navigation';
import { ProductPrice } from './ProductBits';
import ScreenShell from './ScreenShell';

export default function CheckoutScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Checkout'>) {
  const cart = useCart();
  const directItem = route.params?.buyNow;
  const items = directItem ? [directItem] : cart.items;
  const [completed, setCompleted] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const total = items.reduce((cents, item) => cents + Math.round(item.product.price * 100) * item.quantity, 0) / 100;
  return <ScreenShell title="Checkout" goBack={navigation.goBack}>
    {completed || !items.length ? <View style={styles.empty}>
      <Ionicons name={completed ? 'checkmark-circle-outline' : 'cart-outline'} size={54} color="#E86619" />
      <Text style={styles.heading}>{completed ? 'Order confirmed' : 'Your cart is empty'}</Text>
      <Text style={styles.muted}>{completed ? deliveryMessage : 'Add a product to start checkout.'}</Text>
      <Pressable accessibilityRole="button" style={styles.button} onPress={() => navigation.popTo('Products')}><Text style={styles.buttonText}>Continue shopping</Text></Pressable>
    </View> : <>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>ORDER REVIEW</Text>
        {items.map(({ product, quantity }) => <View key={product.id} style={styles.item}>
          <Image source={{ uri: product.thumbnail }} contentFit="contain" style={styles.image} />
          <View style={styles.info}><Text style={styles.title}>{product.title}</Text><ProductPrice product={product} compact /><Text style={styles.muted}>Quantity: {quantity}</Text></View>
        </View>)}
        <View style={styles.note}><Ionicons name="information-circle-outline" size={22} color="#9B632E" /><Text style={styles.noteText}>Demo checkout. No payment or delivery will be processed.</Text></View>
      </ScrollView>
      <View style={styles.summary}>
        <View style={styles.totalRow}><Text style={styles.heading}>Total</Text><Text style={styles.total}>${total.toFixed(2)}</Text></View>
        <Pressable accessibilityRole="button" style={styles.button} onPress={() => {
          if (completed) return;
          // Buy Now checks out this selection without changing the existing cart.
          const notification = cart.recordPurchase(items);
          setDeliveryMessage(notification?.message ?? 'Your purchase is confirmed.');
          setCompleted(true);
          if (!directItem) items.forEach(item => cart.setQuantity(item.product.id, 0));
        }}><Text style={styles.buttonText}>Place demo order</Text></Pressable>
      </View>
    </>}
  </ScreenShell>;
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 20 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: '#858B94' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingBottom: 20, borderBottomWidth: 1, borderColor: '#ECEEF1' },
  image: { width: 88, height: 100, borderRadius: 14, backgroundColor: '#F5F5F3' },
  info: { flex: 1, gap: 8 },
  title: { fontSize: 14, fontWeight: '600', lineHeight: 21, color: '#252930' },
  muted: { fontSize: 13, color: '#7E858F', lineHeight: 21 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF5E9', borderRadius: 14, padding: 16 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 20, color: '#9B632E' },
  summary: { padding: 24, borderTopWidth: 1, borderColor: '#ECEEF1', gap: 20 },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontSize: 20, fontWeight: '700', color: '#252930' },
  total: { fontSize: 27, fontWeight: '700', color: '#252930' },
  button: { backgroundColor: '#20242B', borderRadius: 18, minHeight: 52, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 20 },
});
