# animation-pipeline

**Code-driven 2D animation generation pipeline for YouTube content.**

A Python-based system that automates animation creation from storyboards to rendered video output using Pillow and FFmpeg.

## features

- **Story-driven** — define scenes programmatically via story renderer
- **CLI interface** — command-line controls for batch generation
- **No ML required** — lightweight, CPU-only pipeline using Pillow + FFmpeg
- **Modular design** — separate modules for rendering, animation, and CLI

## tech stack

| Component | Technology |
|-----------|-----------|
| Language | Python 3 |
| Imaging | Pillow |
| Video | FFmpeg |
| CLI | argparse |

## quick start

### Prerequisites

- Python 3.8+
- FFmpeg installed and in PATH

### Run

```bash
python run.py
```

## project structure

```
├── run.py           # Entry point
├── cli.py           # Command-line interface
├── animate.py       # Animation engine
├── story_render.py  # Storyboard rendering
├── src/             # Source modules
└── output/          # Rendered output (gitignored)
```

## license

MIT
