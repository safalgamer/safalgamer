import * as Speech from 'expo-speech';

/**
 * AXIS Voice System
 * Device-native TTS — no API keys, works offline.
 * Speech recognition will be added as a native module later.
 */

export async function speak(text: string, onDone?: () => void): Promise<void> {
  try {
    const speaking = await Speech.isSpeakingAsync();
    if (speaking) await Speech.stop();
    await Speech.speak(text, {
      language: 'en-US',
      pitch: 0.85,
      rate: 0.88,
      onDone: () => onDone?.(),
      onError: () => onDone?.(),
    });
  } catch {
    onDone?.();
  }
}

export async function stopSpeaking(): Promise<void> {
  try {
    const speaking = await Speech.isSpeakingAsync();
    if (speaking) await Speech.stop();
  } catch {}
}

export async function isCurrentlySpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}

export function initVoiceRecognition(): void {
  // TODO: Add native speech recognition module
}

export async function startListening(onResult: (text: string) => void): Promise<boolean> {
  // TODO: Add native speech recognition
  return false;
}

export async function stopListening(): Promise<void> {
  // TODO: Add native speech recognition
}

export function getIsListening(): boolean {
  return false;
}
