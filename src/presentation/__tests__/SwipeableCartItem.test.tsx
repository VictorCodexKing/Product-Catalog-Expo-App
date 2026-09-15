import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { GestureResponderEvent, PanResponder, PanResponderGestureState, Text } from 'react-native';

import SwipeableCartItem from '../SwipeableCartItem';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
const event = {} as GestureResponderEvent;
const movement = (dx: number, dy = 0, vx = 0) => ({ dx, dy, vx }) as PanResponderGestureState;

test('left swipes reveal deletion, right swipes close it, and vertical movement stays scrollable', async () => {
  const responder = jest.spyOn(PanResponder, 'create');
  const onDelete = jest.fn();
  await render(<SwipeableCartItem title="Perfume" onDelete={onDelete}><Text>Perfume</Text></SwipeableCartItem>);
  const handlers = responder.mock.calls[0][0];
  expect(handlers.onMoveShouldSetPanResponder?.(event, movement(-50, 90))).toBe(false);
  expect(handlers.onMoveShouldSetPanResponder?.(event, movement(-60, 4))).toBe(true);
  expect(screen.queryByRole('button', { name: 'Delete Perfume' })).toBeNull();
  await act(() => {
    handlers.onPanResponderGrant?.(event, movement(0));
    handlers.onPanResponderMove?.(event, movement(-60));
    handlers.onPanResponderRelease?.(event, movement(-60));
  });
  expect(onDelete).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Delete Perfume' })).toBeOnTheScreen();
  await act(() => {
    handlers.onPanResponderGrant?.(event, movement(0));
    handlers.onPanResponderMove?.(event, movement(60));
    handlers.onPanResponderRelease?.(event, movement(60));
  });
  expect(screen.queryByRole('button', { name: 'Delete Perfume' })).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Show delete for Perfume' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Delete Perfume' }));
  expect(onDelete).toHaveBeenCalledTimes(1);
  responder.mockRestore();
});
