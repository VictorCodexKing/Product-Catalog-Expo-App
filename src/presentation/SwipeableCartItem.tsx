import Ionicons from '@expo/vector-icons/Ionicons';
import { PropsWithChildren, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

const revealWidth = 80;
const clamp = (x: number) => Math.max(-revealWidth, Math.min(0, x));

export default function SwipeableCartItem({ title, onDelete, children }: PropsWithChildren<{ title: string; onDelete: () => void }>) {
  const [revealed, setRevealed] = useState(false);
  // Keep one controller per row so a re-render cannot interrupt an active swipe.
  const [{ translateX, gesture, settle }] = useState(() => {
    const translateX = new Animated.Value(0);
    let start = 0;
    const settle = (open: boolean) => {
      setRevealed(open);
      Animated.timing(translateX, { toValue: open ? -revealWidth : 0, duration: 180, useNativeDriver: true }).start();
    };
    const gesture = PanResponder.create({
      // Claim horizontal intent only, so the cart still scrolls vertically.
      onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.5,
      onPanResponderGrant: () => translateX.stopAnimation(value => { start = value; }),
      onPanResponderMove: (_, { dx }) => { const x = clamp(start + dx); setRevealed(x < 0); translateX.setValue(x); },
      onPanResponderRelease: (_, { dx, vx }) => settle(vx < -0.4 || (vx <= 0.4 && clamp(start + dx) < -revealWidth / 2)),
      onPanResponderTerminate: () => settle(false),
    });
    return { translateX, gesture, settle };
  });
  return <View style={styles.container}>
    <View style={styles.deleteArea} pointerEvents={revealed ? 'auto' : 'none'}
      accessibilityElementsHidden={!revealed} importantForAccessibility={revealed ? 'auto' : 'no-hide-descendants'}>
      {revealed && <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${title}`} onPress={onDelete} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={23} color="#FFFFFF" /><Text style={styles.deleteText}>Delete</Text>
      </Pressable>}
    </View>
    <Animated.View testID={`swipe-${title}`} {...gesture.panHandlers} style={[styles.row, { transform: [{ translateX }] }]}>
      <View style={styles.content}>{children}</View>
      {/* A tap alternative also makes deletion available to keyboards and screen readers. */}
      <Pressable accessibilityRole="button" accessibilityLabel={`${revealed ? 'Hide' : 'Show'} delete for ${title}`}
        onPress={() => settle(!revealed)} style={styles.more}>
        <Ionicons name="ellipsis-horizontal" size={18} color="#9399A1" />
      </Pressable>
    </Animated.View>
  </View>;
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderBottomWidth: 1, borderColor: '#ECEEF1' },
  row: { backgroundColor: '#FFFFFF', paddingTop: 20, paddingBottom: 16 },
  content: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  deleteArea: { position: 'absolute', right: 0, top: 14, bottom: 14, width: revealWidth },
  deleteButton: { flex: 1, borderRadius: 14, backgroundColor: '#E5484D', justifyContent: 'center', alignItems: 'center', gap: 8 },
  deleteText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  more: { alignSelf: 'center', marginTop: -10, marginBottom: -12, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
});
