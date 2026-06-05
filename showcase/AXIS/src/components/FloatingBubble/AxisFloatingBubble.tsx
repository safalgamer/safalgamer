import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { AxisOrb } from '../AxisOrb/AxisOrb';
import { OrbState } from '../../store/axisStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUBBLE_SIZE = 72;
const HIT_SIZE = 88;
const EDGE_MARGIN = 8;
const SNAP_THRESHOLD = SCREEN_WIDTH / 2;

interface FloatingBubbleProps {
  state?: OrbState;
  onTap?: () => void;
  onLongPress?: () => void;
  visible?: boolean;
}

export const AxisFloatingBubble: React.FC<FloatingBubbleProps> = ({
  state = 'idle',
  onTap,
  onLongPress,
  visible = true,
}) => {
  const posX = useSharedValue(SCREEN_WIDTH - BUBBLE_SIZE - EDGE_MARGIN);
  const posY = useSharedValue(SCREEN_HEIGHT * 0.35);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const hasMoved = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Only capture if finger moved more than 5px
        return Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5;
      },
      onPanResponderGrant: () => {
        hasMoved.current = false;
        longPressTimer.current = setTimeout(() => {
          if (!hasMoved.current) {
            onLongPress?.();
          }
        }, 600);
      },
      onPanResponderMove: (_, gesture) => {
        hasMoved.current = true;
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        // Use absolute position tracking
        posX.value = posX.value + gesture.dx;
        posY.value = posY.value + gesture.dy;
      },
      onPanResponderRelease: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        // Snap to nearest edge
        const currentX = posX.value;
        const targetX = currentX < SNAP_THRESHOLD
          ? EDGE_MARGIN
          : SCREEN_WIDTH - BUBBLE_SIZE - EDGE_MARGIN;

        const clampedY = Math.max(
          60,
          Math.min(posY.value, SCREEN_HEIGHT - BUBBLE_SIZE - 100)
        );

        posX.value = withSpring(targetX, { damping: 18, stiffness: 180 });
        posY.value = withSpring(clampedY, { damping: 18, stiffness: 180 });

        // If barely moved, treat as tap
        if (!hasMoved.current) {
          onTap?.();
        }
      },
    })
  ).current;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value },
      { translateY: posY.value },
    ],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      {...panResponder.panHandlers}
    >
      <View style={styles.touchArea}>
        <AxisOrb state={state} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: HIT_SIZE,
    height: HIT_SIZE,
    zIndex: 9999,
    elevation: 50,
  },
  touchArea: {
    width: HIT_SIZE,
    height: HIT_SIZE,
    borderRadius: HIT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    // Debug: uncomment to see hit area
    // backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
});

export default AxisFloatingBubble;
