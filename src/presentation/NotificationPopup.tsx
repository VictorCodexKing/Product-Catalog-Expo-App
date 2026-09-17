import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PurchaseNotification } from './CartContext';

export default function NotificationPopup({ notifications, onClose, onViewAll, initialSelection = null }: { notifications: PurchaseNotification[]; onClose: () => void; onViewAll: () => void; initialSelection?: PurchaseNotification | null }) {
  const [selected, setSelected] = useState(initialSelection);
  return <Modal transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss notifications" onPress={onClose} style={StyleSheet.absoluteFill} />
      <View style={styles.popup} accessibilityViewIsModal>
        <View style={styles.header}><Text accessibilityRole="header" style={styles.title}>{selected ? 'Purchase update' : 'Notifications'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close notifications" onPress={onClose} style={styles.close}><Ionicons name="close" size={22} color="#252930" /></Pressable></View>
        <ScrollView contentContainerStyle={styles.content}>
          {!notifications.length && <View style={styles.empty}><Ionicons name="notifications-outline" size={32} color="#858B94" /><Text style={styles.title}>All caught up</Text><Text style={styles.message}>You have no notifications yet.</Text></View>}
          {(selected ? [selected] : notifications.slice(0, 3)).map(notification => <Pressable key={notification.id} accessibilityRole="button" accessibilityLabel={`View notification: ${notification.title}`} onPress={() => setSelected(notification)} style={styles.card}>
            <Ionicons name="checkmark-circle-outline" size={25} color="#167A3D" />
            <View style={styles.copy}><Text style={styles.cardTitle}>{notification.title}</Text><Text style={styles.message} numberOfLines={selected ? undefined : 2}>{notification.message}</Text><Text style={styles.time}>{new Date(notification.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text></View>
          </Pressable>)}
        </ScrollView>
        <Pressable accessibilityRole="button" accessibilityLabel="View all notifications" onPress={onViewAll} style={styles.all}><Text style={styles.allText}>View all notifications</Text><Ionicons name="arrow-forward" size={17} color="#C24908" /></Pressable>
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
  content: { padding: 18, gap: 12 },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 22 },
  card: { flexDirection: 'row', gap: 12, paddingVertical: 8 },
  copy: { flex: 1, gap: 6 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#252930' },
  message: { fontSize: 13, lineHeight: 20, color: '#727A85' },
  time: { fontSize: 11, color: '#858B94' },
  all: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderTopWidth: 1, borderColor: '#ECEEF1' },
  allText: { fontSize: 13, fontWeight: '700', color: '#C24908' },
});
