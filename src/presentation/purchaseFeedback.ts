import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export async function purchaseFeedback(action: 'cart' | 'buy') {
  try {
    if (Platform.OS === 'android') await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm);
    else if (action === 'cart') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Unsupported hardware or browser permissions must never block a purchase action.
  }
}
