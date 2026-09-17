import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { PurchaseNotification } from './CartContext';

export default function NotificationPopup({ notification, onClose, onView }: { notification: PurchaseNotification; onClose: () => void; onView: () => void }) {
  return <Modal transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss purchase details" onPress={onClose} style={StyleSheet.absoluteFill} />
      <View style={styles.popup} accessibilityViewIsModal>
        <View style={styles.header}><Text accessibilityRole="header" style={styles.title}>Purchase details</Text><Pressable accessibilityRole="button" accessibilityLabel="Close purchase details" onPress={onClose} style={styles.close}><Ionicons name="close" size={22} color="#252930" /></Pressable></View>
        <View style={styles.content}>
          <View style={styles.success}><Ionicons name="checkmark-circle" size={28} color="#167A3D" /><Text style={styles.cardTitle}>{notification.title}</Text>{notification.viewed && <Text style={styles.viewed}>Viewed</Text>}</View>
          <Text style={styles.message}>{notification.message}</Text>
          <View style={styles.detail}><Text style={styles.label}>Items</Text><Text style={styles.value}>{notification.items}</Text></View>
          <View style={styles.detail}><Text style={styles.label}>Order total</Text><Text style={styles.value}>${notification.total.toFixed(2)}</Text></View>
          <Text style={styles.time}>{new Date(notification.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={notification.viewed ? 'Close viewed notification' : 'View notification'} onPress={notification.viewed ? onClose : onView} style={styles.all}><Text style={styles.allText}>{notification.viewed ? 'Close' : 'View'}</Text></Pressable>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#18202C73' },
  popup: { width: '100%', maxWidth: 380, maxHeight: '70%', backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 22, paddingRight: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ECEEF1' },
  title: { fontSize: 17, fontWeight: '700', color: '#252930' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 22, gap: 16 },
  success: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#252930' },
  viewed: { marginLeft: 'auto', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, color: '#5E6670', backgroundColor: '#EFF1F3', fontSize: 10, fontWeight: '700' },
  message: { fontSize: 13, lineHeight: 20, color: '#727A85' },
  detail: { gap: 5, padding: 13, borderRadius: 13, backgroundColor: '#F6F7F9' },
  label: { fontSize: 10, fontWeight: '700', color: '#858B94', textTransform: 'uppercase' },
  value: { fontSize: 13, fontWeight: '600', color: '#252930' },
  time: { fontSize: 11, color: '#858B94' },
  all: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderTopWidth: 1, borderColor: '#ECEEF1' },
  allText: { fontSize: 13, fontWeight: '700', color: '#C24908' },
});
