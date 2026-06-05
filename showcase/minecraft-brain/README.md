# Minecraft SMP AI Brain

Advanced AI-powered content generator for Minecraft SMP series with deep lore.

## Quick Start

### 1. Set your Groq API key
```bash
set GROQ_API_KEY=your_key_here
```
Get free key at: https://console.groq.com

### 2. Install dependencies
```bash
py -m pip install -r requirements.txt
```

### 3. Run

**Windows:**
```
start.bat
```

**Command line:**
```bash
# Run continuously (generates content every 30s)
py brain.py

# Generate one piece of content
py brain.py --once

# Generate with specific focus
py brain.py --once --focus characters

# Seed initial content (2 characters + 1 episode)
py brain.py --seed

# Custom cycle interval (60 seconds)
py brain.py --cycle 60
```

## What It Generates

| Module | Description |
|--------|-------------|
| `episodes` | Full episode outlines with events, cliffhangers, camera angles |
| `dialogue` | Character dialogue scenes with emotions and stage directions |
| `characters` | Deep characters with backstories, secrets, and story arcs |
| `builds` | Epic build designs with lore significance and hidden features |
| `world_events` | Server-wide events that shake up alliances and corruption |
| `storylines` | Multi-episode story arcs with twists and foreshadowing |

## Output Structure

```
output/
  episodes/      - Episode markdown files
  dialogue/      - Dialogue scripts
  characters/    - Character profiles
  builds/        - Build designs
  world_events/  - World event plans
  storylines/    - Story arc documents
  ideas_*.md     - Raw idea dumps
```

## Memory System

The brain remembers everything. All generated content is saved to `memory.json`
and used as context for future generations. Characters persist across episodes,
storylines connect, and builds have lore significance.

## Customization

Edit `config.py` to change:
- `SERIES_CONCEPT` - Your series premise
- `GROQ_MODEL` - AI model (default: llama-3.1-70b-versatile)
- `CYCLE_INTERVAL` - Seconds between generations

## Files

- `brain.py` - Main brain engine with continuous loop
- `generators.py` - AI prompts for each content type
- `writers.py` - Markdown output writers
- `memory.py` - Persistent memory system
- `groq_client.py` - Groq API integration
- `config.py` - Configuration
