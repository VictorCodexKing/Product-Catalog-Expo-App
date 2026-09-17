import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import FooterTabs from './FooterTabs';
import { PurchaseNotification, useCart } from './CartContext';
import NotificationPopup from './NotificationPopup';
import { RootStackParamList } from './navigation';
import ScreenShell from './ScreenShell';

export function MoreScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'More'>) {
  return <ScreenShell title="More" goBack={navigation.goBack}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.heading}>Account settings</Text>
      <View style={styles.card}>
        <View style={styles.profile}><View style={styles.avatar}><Text style={styles.initials}>V24</Text></View>
          <View style={styles.profileText}><Text style={styles.heading}>Victor24</Text><Text style={styles.muted}>Local preview account</Text></View>
        </View>
        <View style={styles.row}><Text style={styles.muted}>GitHub</Text><Text style={styles.value}>VictorCodexKing</Text></View>
        <View style={styles.row}><Text style={styles.muted}>Currency</Text><Text style={styles.value}>USD ($)</Text></View>
      </View>
      <Text style={styles.muted}>Your cart is saved for this app session.</Text>
    </ScrollView>
    <FooterTabs active="More" />
  </ScreenShell>;
}

export function NotificationsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Notifications'>) {
  const { notifications, markNotificationViewed } = useCart();
  const [selected, setSelected] = useState<PurchaseNotification | null>(null);
  const [showingAll, setShowingAll] = useState(false);
  const visibleNotifications = showingAll ? notifications : notifications.slice(0, 5);
  return <ScreenShell title="Notifications" goBack={navigation.goBack}>
    {!notifications.length ? <View style={styles.empty}>
      <View style={styles.avatar}><Ionicons name="notifications-outline" size={30} color="#E86619" /></View>
      <Text style={styles.heading}>No notifications available</Text>
      <Text style={styles.emptyHint}>Check back later for updates</Text>
    </View> : <ScrollView contentContainerStyle={styles.notifications}>
      {visibleNotifications.map(notification => <Pressable key={notification.id} accessibilityRole="button" accessibilityLabel={`View notification: ${notification.title}`} onPress={() => setSelected(notification)} style={[styles.notificationCard, !notification.viewed && styles.unreadCard]}>
        <View style={[styles.notificationIcon, notification.viewed && styles.viewedIcon]}><Ionicons name={notification.viewed ? 'checkmark' : 'checkmark-circle'} size={24} color={notification.viewed ? '#7E858F' : '#E86619'} /></View>
        <View style={styles.notificationText}>
          <View style={styles.notificationHeading}><Text style={styles.notificationTitle}>{notification.title}</Text>{notification.viewed ? <Text style={styles.viewedLabel}>Viewed</Text> : <View accessibilityLabel="Unread notification" style={styles.unreadDot} />}</View>
          <Text style={styles.muted}>{notification.message}</Text>
          <Text style={styles.time}>{new Date(notification.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text>
        </View>
      </Pressable>)}
      {!showingAll && notifications.length > 5 && <Pressable accessibilityRole="button" accessibilityLabel="View all notifications" onPress={() => setShowingAll(true)} style={styles.viewAll}><Text style={styles.viewAllText}>View All</Text></Pressable>}
    </ScrollView>}
    {selected && <NotificationPopup notification={selected} onClose={() => setSelected(null)} onView={() => { markNotificationViewed(selected.id); setSelected(null); }} />}
  </ScreenShell>;
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 20 },
  heading: { fontSize: 18, fontWeight: '700', color: '#252930' },
  muted: { fontSize: 13, color: '#7E858F', lineHeight: 21 },
  emptyHint: { fontSize: 12, color: '#9A9FA7' },
  card: { borderWidth: 1, borderColor: '#ECEEF1', borderRadius: 18, padding: 20, gap: 20 },
  profile: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  profileText: { flex: 1, gap: 4 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF0E5', alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 17, fontWeight: '700', color: '#A5521D' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  value: { flexShrink: 1, fontSize: 13, color: '#252930' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  notifications: { padding: 24, gap: 16 },
  notificationCard: { flexDirection: 'row', gap: 13, padding: 17, borderWidth: 1, borderColor: '#ECEEF1', borderRadius: 18, backgroundColor: '#FFFFFF' },
  unreadCard: { borderColor: '#FFD8C1', backgroundColor: '#FFFBF8' },
  notificationIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF0E5', alignItems: 'center', justifyContent: 'center' },
  viewedIcon: { backgroundColor: '#EFF1F3' },
  notificationText: { flex: 1, gap: 5 },
  notificationHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notificationTitle: { fontSize: 15, fontWeight: '700', color: '#252930' },
  viewedLabel: { marginLeft: 'auto', color: '#7E858F', fontSize: 10, fontWeight: '700' },
  unreadDot: { marginLeft: 'auto', width: 7, height: 7, borderRadius: 4, backgroundColor: '#E86619' },
  time: { fontSize: 10, color: '#9A9FA7', marginTop: 3 },
  viewAll: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E4E7EB' },
  viewAllText: { color: '#C24908', fontSize: 13, fontWeight: '700' },
});
