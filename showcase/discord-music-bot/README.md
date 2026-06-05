# discord-music-bot

**A feature-rich Discord music bot powered by discord.js and discord-player.**

Play music from YouTube, Spotify, and other sources in your Discord voice channels with queue management and playback controls.

## features

- **Music playback** — play songs from YouTube, Spotify, and more
- **Queue management** — add, remove, skip, and shuffle tracks
- **Playback controls** — pause, resume, stop, volume control
- **Voice integration** — automatic voice channel join/leave

## tech stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js |
| Library | discord.js 14, discord-player 7 |
| Voice | @discordjs/voice |
| FFmpeg | ffmpeg-static |

## quick start

### Prerequisites

- Node.js 18+
- Discord Bot Token (from Discord Developer Portal)

### Setup

```bash
git clone https://github.com/crierofficial/discord-music-bot.git
cd discord-music-bot
npm install
```

### Configure

```bash
cp .env.example .env
# Add your Discord bot token to .env
```

### Run

```bash
node index.js
```

## license

MIT
