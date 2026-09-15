import Ionicons from '@expo/vector-icons/Ionicons';
import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScreenShell({ title, goBack, children }: PropsWithChildren<{ title: string; goBack: () => void }>) {
  return <SafeAreaView style={styles.page}><View style={styles.app}>
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color="#252930" />
      </Pressable>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
    </View>
    {children}
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', backgroundColor: '#F4F5F7' },
  app: { flex: 1, width: '100%', maxWidth: 560, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, borderBottomWidth: 1, borderColor: '#ECEEF1' },
  back: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#252930' },
});
