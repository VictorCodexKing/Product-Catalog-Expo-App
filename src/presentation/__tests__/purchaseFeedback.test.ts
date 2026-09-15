import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { purchaseFeedback } from '../purchaseFeedback';

jest.mock('expo-haptics');
afterEach(() => { jest.restoreAllMocks(); jest.clearAllMocks(); });

test('uses native Android confirmation for both purchase actions', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  await purchaseFeedback('cart');
  await purchaseFeedback('buy');
  expect(Haptics.performAndroidHapticsAsync).toHaveBeenCalledTimes(2);
  expect(Haptics.performAndroidHapticsAsync).toHaveBeenCalledWith(Haptics.AndroidHaptics.Confirm);
  expect(Haptics.notificationAsync).not.toHaveBeenCalled();
});

test.each(['ios', 'web'] as const)('confirms cart success and Buy Now taps on %s', async platform => {
  jest.replaceProperty(Platform, 'OS', platform);
  await purchaseFeedback('cart');
  await purchaseFeedback('buy');
  expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
  expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
});

test('unavailable haptics do not reject or block the purchase action', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  jest.mocked(Haptics.notificationAsync).mockRejectedValueOnce(new Error('Unavailable'));
  await expect(purchaseFeedback('cart')).resolves.toBeUndefined();
});
