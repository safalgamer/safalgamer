import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useAxisStore } from '../store/axisStore';
import { processUserMessage } from '../services/chatEngine';
import { speak, stopSpeaking, isCurrentlySpeaking } from '../services/voice';
import { startRecording, stopRecording, cancelRecording, isRecording } from '../services/speechToText';
import { MicIcon, StopIcon } from '../components/Icons/IconSet';

export default function VoiceScreen() {
  const { isTyping, setIsTyping, startSpeaking, stopSpeaking: storeStopSpeaking } = useAxisStore();
  const [lastUserText, setLastUserText] = useState('');
  const [lastAxisText, setLastAxisText] = useState('');
  const [statusText, setStatusText] = useState('Tap to speak or type below');
  const [isListening, setIsListening] = useState(false);
  const [textInput, setTextInput] = useState('');

  const orbScale = useRef(new Animated.Value(1)).current;
  const dotAnims = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale, { toValue: 1.06, duration: 2000, useNativeDriver: true }),
        Animated.timing(orbScale, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (isListening) {
      const waves = Animated.loop(
        Animated.stagger(150, dotAnims.map((dot) =>
          Animated.sequence([
            Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          ])
        ))
      );
      waves.start();
      return () => waves.stop();
    }
  }, [isListening]);

  const handleTap = async () => {
    if (isTyping) return;

    // If AXIS is speaking, stop
    const speaking = await isCurrentlySpeaking();
    if (speaking) {
      await stopSpeaking();
      storeStopSpeaking();
      setStatusText('Tap to speak');
      return;
    }

    // If recording, stop and process
    if (isListening) {
      setIsListening(false);
      setStatusText('Processing...');

      const transcribedText = await stopRecording();

      if (transcribedText && transcribedText.trim()) {
        setLastUserText(transcribedText);

        await processUserMessage(
          transcribedText,
          (response) => setLastAxisText(response),
          () => { setIsTyping(true); setStatusText('Thinking...'); },
          () => { setIsTyping(false); setStatusText('Tap to speak'); }
        );
      } else {
        setStatusText("Didn't catch that. Tap to retry.");
      }
      return;
    }

    // Start recording
    const success = await startRecording();
    if (success) {
      setIsListening(true);
      setStatusText('Listening...');
    } else {
      setStatusText('Mic unavailable. Check permissions.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerOrb}>
          <View style={styles.headerOrbCore} />
        </View>
        <View>
          <Text style={styles.headerTitle}>AXIS</Text>
          <Text style={styles.headerStatus}>voice mode</Text>
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusArea}>
        {isListening && (
          <View style={styles.waveContainer}>
            {dotAnims.map((anim, i) => (
              <Animated.View key={i} style={[
                styles.waveBar,
                {
                  opacity: anim,
                  height: anim.interpolate({ inputRange: [0.3, 1], outputRange: [8, 32] }),
                },
              ]} />
            ))}
          </View>
        )}
        {isTyping && (
          <View style={styles.thinkingDots}>
            <View style={[styles.thinkingDot, { opacity: 0.4 }]} />
            <View style={[styles.thinkingDot, { opacity: 0.6 }]} />
            <View style={[styles.thinkingDot, { opacity: 0.8 }]} />
          </View>
        )}
      </View>

      {/* Conversation */}
      <View style={styles.conversationArea}>
        {lastUserText ? (
          <View style={styles.userMessageRow}>
            <View style={styles.userBubble}>
              <Text style={styles.userText}>{lastUserText}</Text>
            </View>
          </View>
        ) : null}

        {lastAxisText ? (
          <View style={styles.axisMessageRow}>
            <View style={styles.axisAvatar}>
              <View style={styles.axisAvatarDot} />
            </View>
            <View style={styles.axisBubble}>
              <Text style={styles.axisText}>{lastAxisText}</Text>
            </View>
          </View>
        ) : null}

        {!lastUserText && !lastAxisText && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Voice mode active</Text>
            <Text style={styles.emptySubtext}>
              Tap the button. Speak.{'\n'}AXIS listens and responds out loud.
            </Text>
          </View>
        )}
      </View>

      {/* Mic Button */}
      <View style={styles.buttonArea}>
        <Text style={styles.statusText}>{statusText}</Text>
        <TouchableOpacity style={styles.micButtonOuter} onPress={handleTap} activeOpacity={0.7}>
          <Animated.View style={[
            styles.micButton,
            isListening && styles.micButtonActive,
            { transform: [{ scale: orbScale }] },
          ]}>
            {isListening ? (
              <StopIcon size={32} color="#0a0a0f" />
            ) : (
              <MicIcon size={32} color="#0a0a0f" />
            )}
          </Animated.View>
        </TouchableOpacity>

        {/* Text fallback */}
        <View style={styles.textInputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Or type here..."
            placeholderTextColor="rgba(255,255,255,0.2)"
            value={textInput}
            onChangeText={setTextInput}
            onSubmitEditing={async () => {
              if (!textInput.trim() || isTyping) return;
              const msg = textInput.trim();
              setTextInput('');
              setLastUserText(msg);
              await processUserMessage(
                msg,
                (response) => setLastAxisText(response),
                () => { setIsTyping(true); setStatusText('Thinking...'); },
                () => { setIsTyping(false); setStatusText('Tap to speak or type below'); }
              );
            }}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.textSendButton}
            onPress={async () => {
              if (!textInput.trim() || isTyping) return;
              const msg = textInput.trim();
              setTextInput('');
              setLastUserText(msg);
              await processUserMessage(
                msg,
                (response) => setLastAxisText(response),
                () => { setIsTyping(true); setStatusText('Thinking...'); },
                () => { setIsTyping(false); setStatusText('Tap to speak or type below'); }
              );
            }}
          >
            <Text style={styles.textSendArrow}>&#8593;</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerOrb: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  headerOrbCore: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#00D9FF' },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 2 },
  headerStatus: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
  statusArea: { height: 60, alignItems: 'center', justifyContent: 'center' },
  waveContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 40 },
  waveBar: { width: 4, borderRadius: 2, backgroundColor: '#00D9FF' },
  thinkingDots: { flexDirection: 'row', gap: 6 },
  thinkingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00D9FF' },
  conversationArea: { flex: 1, paddingHorizontal: 20, paddingVertical: 20 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '300', color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 22 },
  userMessageRow: { alignItems: 'flex-end', marginBottom: 12 },
  userBubble: {
    backgroundColor: '#00D9FF', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 18, borderBottomRightRadius: 4, maxWidth: '80%',
  },
  userText: { color: '#0a0a0f', fontSize: 15, fontWeight: '500' },
  axisMessageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  axisAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0, 217, 255, 0.12)',
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  axisAvatarDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00D9FF' },
  axisBubble: {
    backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 18, borderBottomLeftRadius: 4, maxWidth: '75%',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  axisText: { color: 'rgba(255,255,255,0.88)', fontSize: 15, lineHeight: 21 },
  buttonArea: { alignItems: 'center', paddingBottom: 40, paddingTop: 20 },
  statusText: { color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 16 },
  micButtonOuter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  micButton: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#00D9FF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#00D9FF', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 15, elevation: 10,
  },
  micButtonActive: { backgroundColor: '#FF3B30', shadowColor: '#FF3B30' },
  textInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
    width: '100%',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  textSendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00D9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  textSendArrow: {
    color: '#0a0a0f',
    fontSize: 18,
    fontWeight: '700',
  },
});
