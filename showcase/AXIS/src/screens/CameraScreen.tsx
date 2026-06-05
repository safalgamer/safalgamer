import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { identifyObject } from '../services/vision';
import { speak } from '../services/voice';
import { useAxisStore } from '../store/axisStore';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { startSpeaking, stopSpeaking } = useAxisStore();

  if (!permission) {
    return <View style={styles.container}><ActivityIndicator color="#00D9FF" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>AXIS needs camera access</Text>
        <Text style={styles.subtitle}>To see the world and identify objects</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const captureAndIdentify = async () => {
    if (!cameraRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    setResult('');

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
      });

      if (photo?.base64) {
        const identification = await identifyObject(photo.base64);
        setResult(identification);

        // Speak the result
        startSpeaking();
        await speak(identification, () => {
          stopSpeaking();
        });
      }
    } catch (error) {
      setResult('Failed to capture. Try again.');
    }

    setIsAnalyzing(false);
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
          <Text style={styles.headerStatus}>vision mode</Text>
        </View>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />
      </View>

      {/* Result */}
      {result ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>AXIS SEES</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      ) : (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>
            {isAnalyzing ? 'ANALYZING...' : 'POINT AND CAPTURE'}
          </Text>
          {isAnalyzing && <ActivityIndicator color="#00D9FF" style={{ marginTop: 10 }} />}
        </View>
      )}

      {/* Capture Button */}
      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={[styles.captureButton, isAnalyzing && styles.captureButtonDisabled]}
          onPress={captureAndIdentify}
          disabled={isAnalyzing}
        >
          <View style={styles.captureInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerOrbCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00D9FF',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerStatus: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
  },
  cameraContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  resultCard: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    minHeight: 80,
    justifyContent: 'center',
  },
  resultLabel: {
    fontSize: 10,
    color: 'rgba(0, 217, 255, 0.6)',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 22,
  },
  buttonArea: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 217, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#00D9FF',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00D9FF',
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 100,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#00D9FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#0a0a0f',
    fontSize: 14,
    fontWeight: '600',
  },
});
