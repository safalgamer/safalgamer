import json
from datetime import datetime
from groq_client import call_groq
from memory import get_context_summary, save_memory
from config import SERIES_CONCEPT

FOCUS_MODULES = ["episodes", "dialogue", "characters", "builds", "world_events", "storylines"]


def generate_episode(memory):
    context = get_context_summary(memory, "episodes")
    ep_count = len(memory.get("episodes", [])) + 1

    system = """You are an expert Minecraft SMP story writer. Generate compelling episode content.
Output ONLY valid JSON with these exact fields:
{
  "number": <int>,
  "title": "<string>",
  "summary": "<2-3 sentence overview>",
  "key_events": ["<event1>", "<event2>", "<event3>"],
  "character_moments": ["<moment1>", "<moment2>"],
  "builds_featured": ["<build1>", "<build2>"],
  "cliffhanger": "<string ending on tension>",
  "camera_angles": ["<angle1>", "<angle2>", "<angle3>"],
  "music_mood": "<mood suggestion>"
}"""

    user = f"""SERIES CONCEPT:
{SERIES_CONCEPT}

EXISTING CONTEXT:
{context}

Generate Episode #{ep_count}. Make it unique, dramatic, and build on existing lore.
Connect to previous events. Include at least one surprising twist."""

    raw = call_groq(system, user)

    try:
        data = json.loads(raw)
        data["generated_at"] = datetime.now().isoformat()
        data["raw_content"] = raw
        return data
    except json.JSONDecodeError:
        return {
            "number": ep_count,
            "title": f"Episode {ep_count}",
            "summary": raw[:500],
            "raw_content": raw,
            "generated_at": datetime.now().isoformat()
        }


def generate_dialogue(memory):
    context = get_context_summary(memory, "dialogue")
    chars = memory.get("characters", [])

    char_info = ""
    if chars:
        recent = chars[-5:]
        char_info = "\n".join([
            f"- {c.get('name', 'Unknown')}: {c.get('personality', 'N/A')} | "
            f"Role: {c.get('role', 'N/A')} | Motivation: {c.get('motivation', 'N/A')}"
            for c in recent
        ])

    system = """You are a Minecraft SMP dialogue writer. Generate natural, dramatic dialogue.
Output ONLY valid JSON:
{
  "scene": "<location/setting>",
  "characters_involved": ["<name1>", "<name2>"],
  "dialogue_lines": [
    {"speaker": "<name>", "line": "<dialogue>", "emotion": "<emotion>"},
    {"speaker": "<name>", "line": "<dialogue>", "emotion": "<emotion>"}
  ],
  "stage_direction": "<what happens between lines>",
  "tension_level": "<low/medium/high/extreme>",
  "episode_tie_in": "<which episode this fits>"
}

Write 6-10 dialogue lines. Make it feel natural, not cringey."""

    user = f"""SERIES CONCEPT:
{SERIES_CONCEPT}

AVAILABLE CHARACTERS:
{char_info if char_info else "No characters yet - create a scene with unnamed archetypes"}

CONTEXT:
{context}

Generate a dialogue scene. Focus on conflict, secrets, or alliance-building."""

    raw = call_groq(system, user)

    try:
        data = json.loads(raw)
        data["generated_at"] = datetime.now().isoformat()
        data["raw_content"] = raw
        return data
    except json.JSONDecodeError:
        return {
            "scene": "Unknown",
            "characters_involved": [],
            "dialogue_lines": [],
            "raw_content": raw,
            "generated_at": datetime.now().isoformat()
        }


def generate_character(memory):
    context = get_context_summary(memory, "characters")
    existing_names = [c.get("name", "") for c in memory.get("characters", [])]

    system = """You are a Minecraft SMP character designer. Create deep, interesting characters.
Output ONLY valid JSON:
{
  "name": "<minecraft-username-style name>",
  "nickname": "<what others call them>",
  "role": "<protagonist/antagonist/ally/enemy/mysterious/merchant/traitor>",
  "personality": "<3-4 personality traits>",
  "backstory": "<2-3 sentences>",
  "motivation": "<what drives them>",
  "secret": "<hidden truth about them>",
  "skills": ["<skill1>", "<skill2>", "<skill3>"],
  "alliances": ["<who they align with>"],
  "rivals": ["<who they oppose>"],
  "signature_build": "<their iconic structure>",
  "catchphrase": "<something they say often>",
  "story_arc": "<where their story is heading>"
}"""

    user = f"""SERIES CONCEPT:
{SERIES_CONCEPT}

EXISTING CHARACTERS: {', '.join(existing_names) if existing_names else 'None yet'}

CONTEXT:
{context}

Create a NEW character (not in existing list). Make them complex and interesting.
Give them a hidden secret that could create drama later."""

    raw = call_groq(system, user)

    try:
        data = json.loads(raw)
        data["generated_at"] = datetime.now().isoformat()
        data["raw_content"] = raw
        return data
    except json.JSONDecodeError:
        return {
            "name": "Unknown",
            "raw_content": raw,
            "generated_at": datetime.now().isoformat()
        }


def generate_build(memory):
    context = get_context_summary(memory, "builds")

    system = """You are a Minecraft SMP build planner. Design epic builds for storytelling.
Output ONLY valid JSON:
{
  "name": "<build name>",
  "type": "<castle/base/village/ruin/dungeon/monument/redstone/laboratory>",
  "description": "<detailed description>",
  "story_purpose": "<why this build matters to the story>",
  "location": "<biome/coordinates style location>",
  "materials": ["<block1>", "<block2>", "<block3>"],
  "estimated_size": "<small/medium/large/massive>",
  "hidden_features": ["<secret room>", "<trap>", "<hidden passage>"],
  "redstone_elements": ["<contraption1>", "<contraption2>"],
  "associated_characters": ["<who built/owns it>"],
  "lore_significance": "<historical importance>",
  "screenshots_angles": ["<angle1>", "<angle2>"]
}"""

    user = f"""SERIES CONCEPT:
{SERIES_CONCEPT}

CONTEXT:
{context}

Design a build that serves the SMP narrative. It should have hidden elements,
lore significance, and be visually impressive. Think Hermitcraft-level."""

    raw = call_groq(system, user)

    try:
        data = json.loads(raw)
        data["generated_at"] = datetime.now().isoformat()
        data["raw_content"] = raw
        return data
    except json.JSONDecodeError:
        return {
            "name": "Unknown Build",
            "raw_content": raw,
            "generated_at": datetime.now().isoformat()
        }


def generate_world_event(memory):
    context = get_context_summary(memory, "world_events")

    system = """You are a Minecraft SMP world event designer. Create server-wide events.
Output ONLY valid JSON:
{
  "title": "<event name>",
  "type": "<discovery/invasion/election/festival/war/mystery/natural_disaster>",
  "description": "<what happens>",
  "triggers": ["<what causes this event>"],
  "effects_on_players": ["<effect1>", "<effect2>"],
  "new_locations": ["<places that appear>"],
  "new_items_rewards": ["<special items or rewards>"],
  "duration": "<how many episodes this spans>",
  "alliance_shifts": "<how alliances change>",
  "corruption_level": "<none/minor/spreading/severe/critical>",
  "build_requirements": ["<what needs to be built for this>"],
  "dramatic_moments": ["<peak drama moments>"]
}"""

    user = f"""SERIES CONCEPT:
{SERIES_CONCEPT}

CONTEXT:
{context}

Create a world event that shakes up the server. Should connect to The Corruption
or introduce new lore. Make it player-driven where possible."""

    raw = call_groq(system, user)

    try:
        data = json.loads(raw)
        data["generated_at"] = datetime.now().isoformat()
        data["raw_content"] = raw
        return data
    except json.JSONDecodeError:
        return {
            "title": "Unknown Event",
            "raw_content": raw,
            "generated_at": datetime.now().isoformat()
        }


def generate_storyline(memory):
    context = get_context_summary(memory, "storylines")

    system = """You are a Minecraft SMP story arc planner. Design multi-episode storylines.
Output ONLY valid JSON:
{
  "title": "<arc name>",
  "summary": "<3-4 sentence overview>",
  "episodes_span": "<how many episodes (e.g., '5-8')>",
  "key_characters": ["<character1>", "<character2>"],
  "main_conflict": "<the central tension>",
  "subplots": ["<subplot1>", "<subplot2>"],
  "climax_description": "<what the peak moment looks like>",
  "resolution_type": "<triumph/tragedy/mystery/ongoing>",
  "build_requirements": ["<epic builds needed>"],
  "foreshadowing_elements": ["<hints to drop early>"],
  "twist": "<unexpected turn>"
}"""

    user = f"""SERIES CONCEPT:
{SERIES_CONCEPT}

CONTEXT:
{context}

Create a new story arc that could run for several episodes. It should introduce
new tensions while building on existing lore. Include a shocking twist."""

    raw = call_groq(system, user)

    try:
        data = json.loads(raw)
        data["generated_at"] = datetime.now().isoformat()
        data["raw_content"] = raw
        return data
    except json.JSONDecodeError:
        return {
            "title": "Unknown Arc",
            "raw_content": raw,
            "generated_at": datetime.now().isoformat()
        }


def generate_ideas(memory):
    context = get_context_summary(memory)

    system = """You are a Minecraft SMP brainstorm machine. Generate raw ideas.
Output ONLY valid JSON array of strings:
["idea1", "idea2", "idea3", "idea4", "idea5"]

Each idea should be 1-2 sentences max. Be creative and wild."""

    user = f"""SERIES CONCEPT:
{SERIES_CONCEPT}

CONTEXT:
{context}

Generate 5 fresh ideas that could become episodes, characters, builds, or events.
Think outside the box. Mix Minecraft mechanics with storytelling."""

    raw = call_groq(system, user)

    try:
        ideas = json.loads(raw)
        return ideas
    except json.JSONDecodeError:
        return [raw[:200]]


# Map focus to generator
GENERATORS = {
    "episodes": generate_episode,
    "dialogue": generate_dialogue,
    "characters": generate_character,
    "builds": generate_build,
    "world_events": generate_world_event,
    "storylines": generate_storyline,
    "ideas": generate_ideas,
}
