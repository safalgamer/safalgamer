import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MicIcon, ChatBubbleIcon } from '../components/Icons/IconSet';

const { width, height } = Dimensions.get('window');

interface LaunchScreenProps {
  onModeSelected: (mode: 'voice' | 'chat') => void;
  onNeedOnboarding: () => void;
}

export default function LaunchScreen({ onModeSelected, onNeedOnboarding }: LaunchScreenProps) {
  const orbScale = useRef(new Animated.Value(0.3)).current;
  const orbOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const questionOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(orbOpacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.spring(orbScale, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(questionOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(buttonsOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Floating Orb */}
      <Animated.View
        style={[
          styles.orbContainer,
          {
            opacity: orbOpacity,
            transform: [{ scale: Animated.multiply(orbScale, pulseAnim) }],
          },
        ]}
      >
        <View style={styles.orbOuter}>
          <View style={styles.orbMiddle}>
            <View style={styles.orbCore} />
          </View>
        </View>
      </Animated.View>

      {/* AXIS Title */}
      <Animated.View style={[styles.titleContainer, { opacity: titleOpacity }]}>
        <Text style={styles.title}>AXIS</Text>
        <Text style={styles.subtitle}>Your Life. Under Control.</Text>
      </Animated.View>

      {/* Question */}
      <Animated.View style={[styles.questionContainer, { opacity: questionOpacity }]}>
        <Text style={styles.question}>How do you want to talk to me?</Text>
      </Animated.View>

      {/* Mode Buttons */}
      <Animated.View style={[styles.buttonsContainer, { opacity: buttonsOpacity }]}>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => onModeSelected('voice')}
          activeOpacity={0.7}
        >
          <View style={[styles.modeButtonInner, styles.voiceButton]}>
            <MicIcon size={32} color="#00D9FF" />
            <Text style={styles.modeLabel}>Voice</Text>
            <Text style={styles.modeDesc}>Full JARVIS experience. Speak out loud.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => onModeSelected('chat')}
          activeOpacity={0.7}
        >
          <View style={[styles.modeButtonInner, styles.chatButton]}>
            <ChatBubbleIcon size={32} color="rgba(255,255,255,0.6)" />
            <Text style={styles.modeLabel}>Chat</Text>
            <Text style={styles.modeDesc}>Silent mode. Type to AXIS.</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  orbContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  orbMiddle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 122, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbCore: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 12,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 3,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  questionContainer: {
    marginBottom: 40,
  },
  question: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontWeight: '300',
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  modeButton: {
    width: '100%',
  },
  modeButtonInner: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  voiceButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  chatButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  modeLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modeDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.45)',
  },
});
