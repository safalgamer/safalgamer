import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { OnboardingData } from '../types';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: (data: OnboardingData) => void;
}

const QUESTIONS = [
  { key: 'name', question: "First things first. What's your name?", placeholder: "Your name..." },
  { key: 'age', question: "How old are you?", placeholder: "Age...", keyboardType: 'numeric' as const },
  { key: 'dailyRoutine', question: "Walk me through your day. What does a typical day look like for you?", placeholder: "I wake up at..." },
  { key: 'wakeTime', question: "What time do you usually wake up?", placeholder: "7am..." },
  { key: 'classSchedule', question: "Do you have classes? What's the schedule like?", placeholder: "My classes are..." },
  { key: 'currentGoals', question: "What are you working toward right now? Goals, projects, anything.", placeholder: "Right now I'm focused on..." },
  { key: 'currentMood', question: "How are you feeling right now? Be honest. I'll know anyway.", placeholder: "Honestly, I feel..." },
  { key: 'biggestStruggle', question: "What's the hardest thing you're dealing with right now?", placeholder: "The hardest thing is..." },
  { key: 'fitnessHabits', question: "How's your fitness? Exercise, sleep, eating — give me the real picture.", placeholder: "Well..." },
  { key: 'creativeProjects', question: "Any creative projects? YouTube, coding, art, music — anything you build?", placeholder: "I'm working on..." },
  { key: 'mostWantedHelp', question: "Last one. What do you want me to help you with the most?", placeholder: "I need help with..." },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [input, setInput] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const orbPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    animateQuestion();
    // Orb pulse
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [step]);

  const animateQuestion = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const handleNext = () => {
    if (!input.trim()) return;

    const currentKey = QUESTIONS[step].key as keyof OnboardingData;
    const newData = { ...data, [currentKey]: input.trim() };
    setData(newData);
    setInput('');

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(newData as OnboardingData);
    }
  };

  const currentQ = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Mini Orb */}
      <Animated.View style={[styles.miniOrb, { transform: [{ scale: orbPulse }] }]}>
        <View style={styles.miniOrbOuter}>
          <View style={styles.miniOrbCore} />
        </View>
      </Animated.View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{step + 1} / {QUESTIONS.length}</Text>
      </View>

      {/* Question Area */}
      <ScrollView style={styles.questionArea} contentContainerStyle={styles.questionContent}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.axisLabel}>AXIS</Text>
          <Text style={styles.question}>{currentQ.question}</Text>
        </Animated.View>

        {/* Previous answers summary */}
        {step > 0 && (
          <View style={styles.historyContainer}>
            {Object.entries(data).slice(-3).map(([key, value]) => (
              <View key={key} style={styles.historyItem}>
                <Text style={styles.historyKey}>{key}</Text>
                <Text style={styles.historyValue} numberOfLines={2}>{value}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder={currentQ.placeholder}
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={input}
          onChangeText={setInput}
          multiline
          autoFocus
          returnKeyType="send"
          onSubmitEditing={handleNext}
          keyboardType={currentQ.keyboardType || 'default'}
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={handleNext}
          disabled={!input.trim()}
        >
          <Text style={styles.sendArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 60,
  },
  miniOrb: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  miniOrbOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  miniOrbCore: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#007AFF',
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1,
    marginBottom: 6,
  },
  progressFill: {
    height: 2,
    backgroundColor: '#007AFF',
    borderRadius: 1,
  },
  progressText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    textAlign: 'right',
  },
  questionArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionContent: {
    paddingBottom: 20,
  },
  axisLabel: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 12,
  },
  question: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: 32,
  },
  historyContainer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  historyItem: {
    marginBottom: 12,
  },
  historyKey: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  historyValue: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 120,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
  },
  sendArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});
