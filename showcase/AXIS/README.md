# AXIS — AI Companion

**Your local-first AI companion. Private, on-device, and context-aware.**

AXIS is a React Native (Expo) mobile companion app that runs AI models locally and provides context-aware assistance based on your location, activity, and preferences.

> ⚠️ **Development status:** Active. Some features are in progress.

## features

- **AI chat** — powered by Groq LLMs with conversation memory
- **Location-aware** — geofenced home/college zones trigger contextual actions
- **Journal** — daily journal entries with mood tracking
- **Memories** — searchable memory storage with local SQLite
- **Voice (TTS)** — text-to-speech responses
- **Floating orb UI** — always-accessible AI companion interface
- **Local-first** — data stored on-device with SQLite
- **Privacy-focused** — no cloud storage of personal data

## tech stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native, Expo |
| Language | TypeScript |
| AI | Groq SDK (LLaMA 3.3) |
| Database | Expo SQLite |
| Navigation | @react-navigation |
| Location | Expo Location (geofencing) |
| Voice | expo-av (TTS) |
| Camera | expo-camera |

## quick start

### Prerequisites

- Node.js 18+
- Expo CLI (`npx expo`)
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Setup

```bash
git clone https://github.com/crierofficial/AXIS.git
cd AXIS
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key for LLM inference |
| `DB_ENCRYPTION_KEY` | No | 64-char hex key for local DB encryption |
| `HOME_LATITUDE` | No | Home geofence center latitude |
| `HOME_LONGITUDE` | No | Home geofence center longitude |
| `COLLEGE_LATITUDE` | No | College geofence center latitude |
| `COLLEGE_LONGITUDE` | No | College geofence center longitude |

### Run

```bash
npx expo start
```

## project structure

```
src/
├── config/        # Environment configuration
├── screens/       # Screen components (Chat, Journal, Memories, etc.)
├── services/      # Business logic (database, location, voice, AI)
├── components/    # Reusable UI components
├── navigation/    # React Navigation setup
├── stores/        # State management
└── types/         # TypeScript type definitions
```

## limitations

- **Voice recognition** — Speech-to-text is not yet implemented (TTS only)
- **Screen reader** — Accessibility overlay is a stub
- **Guardian mode** — Parental monitoring features are in development
- **Vision** — Camera-based object/face detection is experimental

## license

MIT
