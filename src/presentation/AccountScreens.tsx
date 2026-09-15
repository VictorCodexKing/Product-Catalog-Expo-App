import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import FooterTabs from './FooterTabs';
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
  return <ScreenShell title="Notifications" goBack={navigation.goBack}>
    <View style={styles.empty}>
      <View style={styles.avatar}><Ionicons name="notifications-outline" size={30} color="#E86619" /></View>
      <Text style={styles.heading}>All caught up</Text>
      <Text style={styles.muted}>You have no notifications yet.</Text>
    </View>
  </ScreenShell>;
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 20 },
  heading: { fontSize: 18, fontWeight: '700', color: '#252930' },
  muted: { fontSize: 13, color: '#7E858F', lineHeight: 21 },
  card: { borderWidth: 1, borderColor: '#ECEEF1', borderRadius: 18, padding: 20, gap: 20 },
  profile: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  profileText: { flex: 1, gap: 4 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF0E5', alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 17, fontWeight: '700', color: '#A5521D' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  value: { flexShrink: 1, fontSize: 13, color: '#252930' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
});
