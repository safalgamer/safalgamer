import json
import os
from datetime import datetime

MEMORY_FILE = "memory.json"

DEFAULT_MEMORY = {
    "series_concept": "",
    "episodes": [],
    "characters": [],
    "storylines": [],
    "dialogues": [],
    "builds": [],
    "world_events": [],
    "ideas_pool": [],
    "generation_count": 0,
    "last_focus": "",
    "created_at": "",
    "updated_at": ""
}


def load_memory():
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    memory = DEFAULT_MEMORY.copy()
    memory["created_at"] = datetime.now().isoformat()
    save_memory(memory)
    return memory


def save_memory(memory):
    memory["updated_at"] = datetime.now().isoformat()
    with open(MEMORY_FILE, "w", encoding="utf-8") as f:
        json.dump(memory, f, indent=2, ensure_ascii=False)


def get_context_summary(memory, focus=None):
    parts = []

    if memory.get("series_concept"):
        parts.append(f"SERIES: {memory['series_concept']}")

    if memory.get("characters"):
        chars = memory["characters"][-5:]
        char_summaries = []
        for c in chars:
            name = c.get("name", "Unknown")
            role = c.get("role", "")
            char_summaries.append(f"{name} ({role})")
        parts.append(f"CHARACTERS: {', '.join(char_summaries)}")

    if memory.get("episodes"):
        eps = memory["episodes"][-3:]
        ep_summaries = [f"Ep{e.get('number', '?')}: {e.get('title', 'Untitled')}" for e in eps]
        parts.append(f"RECENT EPISODES: {', '.join(ep_summaries)}")

    if memory.get("storylines"):
        sl = memory["storylines"][-3:]
        sl_summaries = [s.get("title", s.get("summary", "Untitled"))[:80] for s in sl]
        parts.append(f"ACTIVE STORYLINES: {', '.join(sl_summaries)}")

    if memory.get("builds"):
        blds = memory["builds"][-3:]
        b_summaries = [b.get("name", "Unnamed build") for b in blds]
        parts.append(f"RECENT BUILDS: {', '.join(b_summaries)}")

    if memory.get("world_events"):
        evts = memory["world_events"][-3:]
        e_summaries = [e.get("title", "Event") for e in evts]
        parts.append(f"WORLD EVENTS: {', '.join(e_summaries)}")

    if memory.get("ideas_pool"):
        ideas = memory["ideas_pool"][-5:]
        parts.append(f"IDEAS POOL: {' | '.join(ideas)}")

    return "\n".join(parts)


def add_episode(memory, episode_data):
    memory["episodes"].append(episode_data)
    memory["generation_count"] += 1
    memory["last_focus"] = "episodes"


def add_character(memory, character_data):
    memory["characters"].append(character_data)
    memory["generation_count"] += 1
    memory["last_focus"] = "characters"


def add_dialogue(memory, dialogue_data):
    memory["dialogues"].append(dialogue_data)
    memory["generation_count"] += 1
    memory["last_focus"] = "dialogue"


def add_build(memory, build_data):
    memory["builds"].append(build_data)
    memory["generation_count"] += 1
    memory["last_focus"] = "builds"


def add_world_event(memory, event_data):
    memory["world_events"].append(event_data)
    memory["generation_count"] += 1
    memory["last_focus"] = "world_events"


def add_storyline(memory, storyline_data):
    memory["storylines"].append(storyline_data)
    memory["generation_count"] += 1
    memory["last_focus"] = "storylines"


def add_idea(memory, idea):
    if idea not in memory["ideas_pool"]:
        memory["ideas_pool"].append(idea)
        if len(memory["ideas_pool"]) > 50:
            memory["ideas_pool"] = memory["ideas_pool"][-50:]
