# nexus-lite

**Self-evolving AI system with memory, LLM fine-tuning, and autonomous research pipelines.**

Nexus-lite is an experimental AI framework that maintains persistent memory, runs automated research loops, and interfaces with local LLMs for self-improvement. Built for developers exploring AI autonomy and agent architectures.

## features

- **Persistent memory** — stores learned information in structured JSONL format
- **Self-modifying code** — experimental runtime code evolution (use with caution)
- **Hardware-aware** — monitors system resources and adapts behavior
- **Model fine-tuning** — integrates with Hugging Face Transformers, PEFT, and bitsandbytes
- **ChromaDB integration** — vector similarity search for memory retrieval
- **API server** — REST API for external interaction with AI capabilities

## tech stack

| Component | Technology |
|-----------|-----------|
| Language | Python 3.10+ |
| ML Framework | PyTorch, Transformers |
| Fine-tuning | PEFT, bitsandbytes, TRL |
| Vector Store | ChromaDB |
| API | FastAPI / Flask |
| Config | YAML |

## quick start

### Prerequisites

- Python 3.10+
- CUDA-capable GPU recommended for model operations

### Setup

```bash
git clone https://github.com/crierofficial/nexus-lite.git
cd nexus-lite
pip install -e .
```

### Run

```bash
python main.py
```

## project structure

```
nexus-lite/
├── nexus/           # Core AI system modules
├── body/            # Interface and I/O modules
├── config/          # System configuration
├── utils/           # Utility functions
├── tests/           # Test suite
├── models/          # Local model storage
├── data/            # Memory and state data (gitignored)
├── logs/            # System logs (gitignored)
├── scripts/         # Utility scripts
├── main.py          # Entry point
└── config.yaml      # System configuration
```

## warnings

- **Experimental**: This project explores self-modifying code patterns — proceed with caution
- **Resource intensive**: LLM operations require significant RAM/VRAM
- **Data privacy**: Memory files are stored locally and excluded from version control

## license

MIT
