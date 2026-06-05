import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline, Polygon } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const MicIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1="12" y1="19" x2="12" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="8" y1="23" x2="16" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const SendIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="22" y1="2" x2="11" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Polygon points="22,2 15,22 11,13 2,9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </Svg>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Polyline points="9,22 9,12 15,12 15,22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const ChatIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const StatsIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="18" y1="20" x2="18" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="12" y1="20" x2="12" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="6" y1="20" x2="6" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const VoiceIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z" fill={color} opacity="0.3"/>
    <Path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="12" y1="19" x2="12" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="8" y1="23" x2="16" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const ChatBubbleIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill={color} opacity="0.3"/>
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const MoonIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const SunIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2"/>
    <Line x1="12" y1="1" x2="12" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="12" y1="21" x2="12" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="1" y1="12" x2="3" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="21" y1="12" x2="23" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const HeartIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const FireIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 23c-4.97 0-9-2.69-9-6 0-2.16 1.34-4.13 3-5.5 0 0 .5 3 3.5 3 .5-3 2.5-6 4-8 1.5 2 2 4 2 6 2 0 3.5 2 3.5 4.5 0 3.31-4.03 6-9 6z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const TargetIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2"/>
    <Circle cx="12" cy="12" r="2" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const ActivityIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const FootstepsIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M13 4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zM7 8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" fill={color} opacity="0.5"/>
    <Path d="M19 8l-3 8h-2l-2-5-2 5H8l-3-8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke={color} strokeWidth="2"/>
    <Line x1="12" y1="18" x2="12.01" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const LockIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth="2"/>
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const EyeIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="2"/>
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const BrainIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 .5.1 1 .2 1.5C6.1 8.5 5 10 5 11.8c0 1.5.7 2.8 1.8 3.7-.3.5-.5 1.1-.5 1.8 0 2.2 1.8 4 4 4h3.4c2.2 0 4-1.8 4-4 0-.7-.2-1.3-.5-1.8 1.1-.9 1.8-2.2 1.8-3.7 0-1.8-1.1-3.3-2.7-3.8.1-.5.2-1 .2-1.5C16.5 4 14.5 2 12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 2v18" stroke={color} strokeWidth="1.5" opacity="0.5"/>
  </Svg>
);

export const StopIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="6" y="6" width="12" height="12" rx="2" fill={color}/>
  </Svg>
);

export const PlayIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polygon points="5,3 19,12 5,21" fill={color}/>
  </Svg>
);

export const ArrowUpIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="12" y1="19" x2="12" y2="5" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <Polyline points="5,12 12,5 19,12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const WaveformIcon: React.FC<IconProps & { active?: boolean }> = ({ size = 24, color = '#fff', active = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="4" y1="12" x2="4" y2={active ? "6" : "10"} stroke={color} strokeWidth="2" strokeLinecap="round" opacity={active ? 1 : 0.4}/>
    <Line x1="8" y1="12" x2="8" y2={active ? "4" : "8"} stroke={color} strokeWidth="2" strokeLinecap="round" opacity={active ? 1 : 0.4}/>
    <Line x1="12" y1="12" x2="12" y2={active ? "2" : "9"} stroke={color} strokeWidth="2" strokeLinecap="round" opacity={active ? 1 : 0.4}/>
    <Line x1="16" y1="12" x2="16" y2={active ? "5" : "8"} stroke={color} strokeWidth="2" strokeLinecap="round" opacity={active ? 1 : 0.4}/>
    <Line x1="20" y1="12" x2="20" y2={active ? "7" : "10"} stroke={color} strokeWidth="2" strokeLinecap="round" opacity={active ? 1 : 0.4}/>
  </Svg>
);
