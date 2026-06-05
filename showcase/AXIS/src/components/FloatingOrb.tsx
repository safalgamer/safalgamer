import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
} from 'react-native';

interface FloatingOrbProps {
  isActive: boolean;
  isSpeaking: boolean;
  isGuardianMode: boolean;
  onPress: () => void;
}

export default function FloatingOrb({
  isActive,
  isSpeaking,
  isGuardianMode,
  onPress,
}: FloatingOrbProps) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(0.8)).current;

  // Drag handler
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  // Breathing pulse animation
  useEffect(() => {
    if (isActive && !isGuardianMode) {
      const breathe = Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 0.8,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      breathe.start();
      return () => breathe.stop();
    }
  }, [isActive, isGuardianMode]);

  // Speaking ring animation
  useEffect(() => {
    if (isSpeaking) {
      const rings = Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      rings.start();
      return () => rings.stop();
    }
  }, [isSpeaking]);

  if (isGuardianMode) {
    // Invisible in guardian mode
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Animated.View
          style={[
            styles.orbOuter,
            {
              transform: [{ scale: breatheAnim }],
              opacity: isActive ? 1 : 0.4,
            },
          ]}
        >
          {/* Speaking rings */}
          {isSpeaking && (
            <>
              <Animated.View
                style={[
                  styles.speakingRing,
                  styles.ring1,
                  {
                    opacity: ringAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 0],
                    }),
                    transform: [
                      {
                        scale: ringAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.8],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.speakingRing,
                  styles.ring2,
                  {
                    opacity: ringAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.4, 0],
                    }),
                    transform: [
                      {
                        scale: ringAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 2.2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </>
          )}

          {/* Orb layers */}
          <View style={styles.orbMiddle}>
            <View style={styles.orbCore} />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    zIndex: 1000,
  },
  orbOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  orbMiddle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbCore: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  speakingRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  ring1: {},
  ring2: {},
});
