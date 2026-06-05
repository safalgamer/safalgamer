import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "YOUR_GROQ_API_KEY_HERE")
GROQ_MODEL = "llama-3.3-70b-versatile"

# How often the brain runs a cycle (seconds)
CYCLE_INTERVAL = 30

# Series concept - customize this
SERIES_CONCEPT = """
An SMP server with deep lore. Multiple players each have hidden backstories
that slowly unravel. The world has ancient ruins, a mysterious force called
'The Corruption' that spreads, and players must choose to fight it or harness it.
Politics, betrayals, alliances, and epic builds drive the narrative forward.
"""

# Output paths
OUTPUT_DIR = "output"
MEMORY_FILE = "memory.json"
