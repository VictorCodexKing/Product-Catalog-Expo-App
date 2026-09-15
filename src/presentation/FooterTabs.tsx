import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RootStackParamList } from './navigation';

const tabs = [
  { title: 'Home', icon: 'home-outline' },
  { title: 'Products', icon: 'cube-outline' },
  { title: 'Orders', icon: 'receipt-outline' },
  { title: 'More', icon: 'ellipsis-horizontal' },
] as const;

export default function FooterTabs({ active }: { active: 'Products' | 'More' }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return <View style={styles.tabs} accessibilityRole="tablist">
    {tabs.map(({ title, icon }) => {
      const selected = title === active;
      const enabled = title === 'Products' || title === 'More';
      return <Pressable key={title} disabled={!enabled} accessibilityRole="tab"
        accessibilityLabel={enabled ? title : `${title}, coming soon`}
        accessibilityState={{ selected, disabled: !enabled }} style={styles.tab}
        onPress={() => {
          if (selected || !enabled) return;
          if (title === 'Products') navigation.popTo('Products');
          else navigation.navigate('More');
        }}>
        <View style={[styles.icon, selected && styles.selected]}><Ionicons name={icon} size={23} color={selected ? '#E86619' : '#91959C'} /></View>
        <Text style={[styles.label, selected && styles.selectedLabel]}>{title}</Text>
      </Pressable>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#ECEEF1', paddingTop: 10, paddingBottom: 12, backgroundColor: '#FFFFFF' },
  tab: { flex: 1, alignItems: 'center', gap: 5 },
  icon: { paddingHorizontal: 20, paddingVertical: 7, borderRadius: 14 },
  selected: { backgroundColor: '#FFF0E5' },
  label: { fontSize: 11, color: '#91959C' },
  selectedLabel: { color: '#E86619', fontWeight: '700' },
});
