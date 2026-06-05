import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { getTodaySteps, isStepCounterAvailable } from '../services/stepCounter';
import { getTodayScreenTimeFormatted } from '../services/screenTimeTracker';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  userName: string;
  mainGoal?: { text: string; progress: number };
  mood?: { score: number; mood: string };
  sleep?: { hours: number; quality: number };
  steps?: number;
  screenTime?: string;
  streaks?: { name: string; count: number }[];
  lastAxisMessage?: string;
}

export default function HomeScreen({
  userName,
  mainGoal,
  mood,
  sleep,
  steps: stepsProp,
  screenTime: screenTimeProp,
  streaks,
  lastAxisMessage,
}: HomeScreenProps) {
  const [currentTime, setCurrentTime] = useState(getTimeString());
  const [liveSteps, setLiveSteps] = useState(stepsProp || 0);
  const [liveScreenTime, setLiveScreenTime] = useState(screenTimeProp || '0m');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getTimeString());
      // Update steps from pedometer
      if (isStepCounterAvailable()) {
        setLiveSteps(getTodaySteps());
      }
      // Update screen time
      setLiveScreenTime(getTodayScreenTimeFormatted());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const displaySteps = isStepCounterAvailable() ? liveSteps : (stepsProp || 0);
  const displayScreenTime = liveScreenTime;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerOrb}>
            <View style={styles.headerOrbCore} />
          </View>
          <Text style={styles.headerTitle}>AXIS</Text>
        </View>
        <Text style={styles.headerTime}>{currentTime}</Text>
      </View>

      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>{getGreeting()}, {userName}.</Text>
        {lastAxisMessage && (
          <Text style={styles.axisThought}>{lastAxisMessage}</Text>
        )}
      </View>

      {/* Main Goal Card */}
      {mainGoal && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>TODAY'S MAIN GOAL</Text>
          <Text style={styles.goalText}>{mainGoal.text}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${mainGoal.progress}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{mainGoal.progress}%</Text>
        </View>
      )}

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        {mood && (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>MOOD</Text>
            <View style={styles.moodRow}>
              <View style={[styles.moodDot, { backgroundColor: getMoodColor(mood.mood) }]} />
              <Text style={styles.moodText}>{mood.mood}</Text>
            </View>
            <Text style={styles.statSubtext}>score: {mood.score}/10</Text>
          </View>
        )}

        {sleep && (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SLEEP</Text>
            <Text style={styles.statValue}>{sleep.hours}h</Text>
            <Text style={styles.statSubtext}>Quality: {sleep.quality}/10</Text>
          </View>
        )}

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>STEPS</Text>
          <Text style={styles.statValue}>{displaySteps.toLocaleString()}</Text>
          <Text style={styles.statSubtext}>today</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>SCREEN</Text>
          <Text style={styles.statValue}>{displayScreenTime}</Text>
          <Text style={styles.statSubtext}>today</Text>
        </View>
      </View>

      {/* Habit Streaks */}
      {streaks && streaks.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>STREAKS</Text>
          {streaks.map((streak, i) => (
            <View key={i} style={styles.streakRow}>
              <Text style={styles.streakName}>{streak.name}</Text>
              <View style={styles.streakBadge}>
                <Text style={styles.streakCount}>{streak.count} days</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function getTimeString(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "You should be sleeping";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "It's getting late";
}

function getMoodColor(mood: string): string {
  const colors: Record<string, string> = {
    fine: '#34C759',
    tired: '#FF9500',
    stressed: '#FF3B30',
    motivated: '#00D9FF',
    down: '#8E8E93',
    neutral: '#FFCC00',
  };
  return colors[mood] || '#8E8E93';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerOrb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerOrbCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00D9FF',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
  },
  headerTime: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  greetingSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  axisThought: {
    fontSize: 14,
    color: 'rgba(0, 217, 255, 0.6)',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  goalText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    marginBottom: 6,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#00D9FF',
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  statCard: {
    width: (width - 40) / 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.25)',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  moodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  moodText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  streakName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  streakBadge: {
    backgroundColor: 'rgba(0, 217, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  streakCount: {
    fontSize: 12,
    color: '#00D9FF',
    fontWeight: '600',
  },
});
