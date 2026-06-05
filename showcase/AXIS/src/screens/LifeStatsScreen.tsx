import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

interface LifeStatsScreenProps {
  moodHistory: { date: string; score: number; mood: string }[];
  sleepHistory: { date: string; duration: number; quality: number }[];
  habitStreaks: { name: string; streak: number; icon: string }[];
  screenTimeBreakdown: { app: string; minutes: number }[];
  productivityScore: number;
  axisCommentary?: string;
}

export default function LifeStatsScreen({
  moodHistory,
  sleepHistory,
  habitStreaks,
  screenTimeBreakdown,
  productivityScore,
  axisCommentary,
}: LifeStatsScreenProps) {
  const getMoodColor = (score: number): string => {
    if (score >= 8) return '#34C759';
    if (score >= 6) return '#FFCC00';
    if (score >= 4) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LIFE STATS</Text>
        <View style={styles.headerOrb}>
          <View style={styles.headerOrbCore} />
        </View>
      </View>

      {/* AXIS Commentary */}
      {axisCommentary && (
        <View style={styles.commentaryCard}>
          <Text style={styles.commentaryLabel}>AXIS OBSERVATION</Text>
          <Text style={styles.commentaryText}>{axisCommentary}</Text>
        </View>
      )}

      {/* Productivity Score */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>PRODUCTIVITY SCORE</Text>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{productivityScore}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
      </View>

      {/* Mood Graph */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>MOOD — PAST 7 DAYS</Text>
        <View style={styles.moodGraph}>
          {moodHistory.map((entry, i) => (
            <View key={i} style={styles.moodBar}>
              <View
                style={[
                  styles.moodBarFill,
                  {
                    height: `${entry.score * 10}%`,
                    backgroundColor: getMoodColor(entry.score),
                  },
                ]}
              />
              <Text style={styles.moodBarLabel}>
                {new Date(entry.date).toLocaleDateString('en', { weekday: 'short' }).charAt(0)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Sleep Chart */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>SLEEP QUALITY</Text>
        {sleepHistory.map((entry, i) => (
          <View key={i} style={styles.sleepRow}>
            <Text style={styles.sleepDate}>
              {new Date(entry.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
            <View style={styles.sleepBarContainer}>
              <View
                style={[
                  styles.sleepBar,
                  { width: `${entry.quality * 10}%` },
                ]}
              />
            </View>
            <Text style={styles.sleepValue}>{entry.duration.toFixed(1)}h</Text>
          </View>
        ))}
      </View>

      {/* Habit Streaks */}
      {habitStreaks.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>HABIT STREAKS</Text>
          {habitStreaks.map((habit, i) => (
            <View key={i} style={styles.habitRow}>
              <Text style={styles.habitIcon}>{habit.icon}</Text>
              <Text style={styles.habitName}>{habit.name}</Text>
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>{habit.streak} days</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Screen Time */}
      {screenTimeBreakdown.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>SCREEN TIME TODAY</Text>
          {screenTimeBreakdown.map((app, i) => (
            <View key={i} style={styles.appRow}>
              <Text style={styles.appName}>{app.app}</Text>
              <Text style={styles.appTime}>{app.minutes}m</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
  },
  headerOrb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerOrbCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  commentaryCard: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.15)',
  },
  commentaryLabel: {
    fontSize: 10,
    color: 'rgba(0, 122, 255, 0.6)',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },
  commentaryText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  scoreCard: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  scoreLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 16,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 56,
    color: '#007AFF',
    fontWeight: '200',
  },
  scoreMax: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.25)',
    fontWeight: '300',
    marginLeft: 4,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 16,
  },
  moodGraph: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  moodBar: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  moodBarFill: {
    width: 20,
    borderRadius: 4,
    marginBottom: 6,
  },
  moodBarLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
  },
  sleepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sleepDate: {
    width: 70,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  sleepBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    marginHorizontal: 10,
  },
  sleepBar: {
    height: 6,
    backgroundColor: '#5856D6',
    borderRadius: 3,
  },
  sleepValue: {
    width: 35,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  habitIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  habitName: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  streakBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  streakText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  appRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  appName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  appTime: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
});
