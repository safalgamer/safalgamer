import { Audio } from 'expo-av';
import ENV from '../config/env';

let recording: Audio.Recording | null = null;

export async function startRecording(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') return false;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    const { recording: rec } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recording = rec;
    return true;
  } catch (e) {
    console.log('Recording start error:', e);
    return false;
  }
}

export async function stopRecording(): Promise<string | null> {
  try {
    if (!recording) return null;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recording = null;
    if (!uri) return null;

    return await transcribe(uri);
  } catch (e) {
    console.log('Recording stop error:', e);
    recording = null;
    return null;
  }
}

export async function cancelRecording(): Promise<void> {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync();
      recording = null;
    }
  } catch {}
}

export function isRecording(): boolean {
  return recording !== null;
}

async function transcribe(uri: string): Promise<string | null> {
  try {
    // Read file as base64
    const response = await fetch(uri);
    const blob = await response.blob();

    // Use XMLHttpRequest for better RN compatibility
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result.text || null);
        } catch {
          resolve(null);
        }
      };
      xhr.onerror = () => resolve(null);
      xhr.open('POST', 'https://api.groq.com/openai/v1/audio/transcriptions');
      xhr.setRequestHeader('Authorization', `Bearer ${ENV.GROQ_API_KEY}`);

      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('model', 'whisper-large-v3-turbo');
      formData.append('response_format', 'json');

      xhr.send(formData as any);
    });
  } catch (e) {
    console.log('Transcription error:', e);
    return null;
  }
}
