import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { BottomTabParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import VoiceScreen from '../screens/VoiceScreen';
import CameraScreen from '../screens/CameraScreen';
import LifeStatsScreen from '../screens/LifeStatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useAxisStore } from '../store/axisStore';
import { HomeIcon, ChatIcon, MicIcon, EyeIcon, StatsIcon, SettingsIcon } from '../components/Icons/IconSet';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const ICON_SIZE = 26;

export default function MainTabs() {
  const { userName, interactionMode } = useAxisStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#00D9FF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.2)',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color }) => <HomeIcon size={ICON_SIZE} color={color} />,
        }}
      >
        {() => (
          <HomeScreen
            userName={userName || 'User'}
            mainGoal={{ text: 'Set your first goal', progress: 0 }}
            mood={{ score: 7, mood: 'neutral' }}
            sleep={{ hours: 7.5, quality: 7 }}
            steps={0}
            screenTime="0h"
            streaks={[]}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Chat"
        options={{
          tabBarLabel: interactionMode === 'voice' ? 'Voice' : 'Chat',
          tabBarIcon: ({ color }) =>
            interactionMode === 'voice' ? (
              <MicIcon size={ICON_SIZE} color={color} />
            ) : (
              <ChatIcon size={ICON_SIZE} color={color} />
            ),
        }}
      >
        {() => interactionMode === 'voice' ? <VoiceScreen /> : <ChatScreen />}
      </Tab.Screen>

      <Tab.Screen
        name="Camera"
        options={{
          tabBarLabel: 'Vision',
          tabBarIcon: ({ color }) => <EyeIcon size={ICON_SIZE} color={color} />,
        }}
      >
        {() => <CameraScreen />}
      </Tab.Screen>

      <Tab.Screen
        name="LifeStats"
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color }) => <StatsIcon size={ICON_SIZE} color={color} />,
        }}
      >
        {() => (
          <LifeStatsScreen
            moodHistory={[]}
            sleepHistory={[]}
            habitStreaks={[]}
            screenTimeBreakdown={[]}
            productivityScore={0}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Settings"
        options={{
          tabBarIcon: ({ color }) => <SettingsIcon size={ICON_SIZE} color={color} />,
        }}
      >
        {() => (
          <SettingsScreen
            settings={{ interactionMode: interactionMode || 'chat' }}
            trustedContacts={[]}
            subscriptionPrice={299}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(10, 10, 15, 0.97)',
    borderTopColor: 'rgba(255,255,255,0.05)',
    borderTopWidth: 1,
    height: 85,
    paddingTop: 8,
    paddingBottom: 30,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tabIcon: {
    marginTop: 4,
  },
});
