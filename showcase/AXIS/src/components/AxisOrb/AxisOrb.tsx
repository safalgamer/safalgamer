import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const COLORS = {
  primary: '#00D9FF',
  secondary: '#0099CC',
  glow: '#00CCFF',
  speaking: '#33E0FF',
};

export type OrbState = 'idle' | 'speaking' | 'guardian' | 'listening';

const ORB_SIZE = 60;

interface Props {
  state?: OrbState;
}

export const AxisOrb: React.FC<Props> = ({ state = 'idle' }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  const ring1Scale = useSharedValue(1);
  const ring2Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0);
  const ring2Opacity = useSharedValue(0);

  // Always-on breathing pulse
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.06, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  // State-based animations
  useEffect(() => {
    switch (state) {
      case 'speaking':
        ring1Opacity.value = withRepeat(
          withSequence(
            withTiming(0.6, { duration: 400 }),
            withTiming(0, { duration: 400 })
          ),
          -1,
          false
        );
        ring1Scale.value = withRepeat(
          withTiming(1.8, { duration: 800, easing: Easing.out(Easing.ease) }),
          -1,
          false
        );
        ring2Opacity.value = withRepeat(
          withSequence(
            withTiming(0.4, { duration: 400 }),
            withTiming(0, { duration: 400 })
          ),
          -1,
          false
        );
        ring2Scale.value = withRepeat(
          withTiming(2.2, { duration: 800, easing: Easing.out(Easing.ease) }),
          -1,
          false
        );
        break;

      case 'guardian':
        opacity.value = withTiming(0.15, { duration: 800 });
        scale.value = withTiming(0.7, { duration: 800 });
        ring1Opacity.value = withTiming(0, { duration: 500 });
        ring2Opacity.value = withTiming(0, { duration: 500 });
        break;

      case 'listening':
        scale.value = withTiming(1.2, { duration: 300 });
        break;

      default:
        opacity.value = withTiming(1, { duration: 500 });
        ring1Opacity.value = withTiming(0, { duration: 500 });
        ring2Opacity.value = withTiming(0, { duration: 500 });
        ring1Scale.value = withTiming(1, { duration: 500 });
        ring2Scale.value = withTiming(1, { duration: 500 });
    }
  }, [state]);

  const animatedOrbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedRing1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const animatedRing2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedOrbStyle]}>
      {/* Speaking rings */}
      {state === 'speaking' && (
        <>
          <Animated.View style={[styles.ring, animatedRing1Style]}>
            <Svg width={ORB_SIZE * 2} height={ORB_SIZE * 2}>
              <Circle
                cx={ORB_SIZE}
                cy={ORB_SIZE}
                r={ORB_SIZE * 0.5}
                stroke={COLORS.speaking}
                strokeWidth="2"
                fill="none"
              />
            </Svg>
          </Animated.View>
          <Animated.View style={[styles.ring, animatedRing2Style]}>
            <Svg width={ORB_SIZE * 2.5} height={ORB_SIZE * 2.5}>
              <Circle
                cx={ORB_SIZE * 1.25}
                cy={ORB_SIZE * 1.25}
                r={ORB_SIZE * 0.6}
                stroke={COLORS.speaking}
                strokeWidth="1.5"
                fill="none"
              />
            </Svg>
          </Animated.View>
        </>
      )}

      {/* Main orb */}
      <Svg width={ORB_SIZE} height={ORB_SIZE}>
        <Defs>
          <RadialGradient id="orbGrad" cx="40%" cy="35%" r="55%">
            <Stop offset="0%" stopColor="#66f0ff" stopOpacity="1" />
            <Stop offset="40%" stopColor={COLORS.primary} stopOpacity="0.95" />
            <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.85" />
          </RadialGradient>
          <RadialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={COLORS.glow} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={COLORS.glow} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Circle cx={ORB_SIZE / 2} cy={ORB_SIZE / 2} r={ORB_SIZE * 0.42} fill="url(#innerGlow)" />
        <Circle cx={ORB_SIZE / 2} cy={ORB_SIZE / 2} r={ORB_SIZE * 0.36} fill="url(#orbGrad)" />
        <Circle cx={ORB_SIZE / 2 - 8} cy={ORB_SIZE / 2 - 8} r={ORB_SIZE * 0.12} fill="rgba(255,255,255,0.25)" />
        <Circle cx={ORB_SIZE / 2 - 12} cy={ORB_SIZE / 2 - 14} r={3} fill="rgba(255,255,255,0.5)" />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  ring: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AxisOrb;
