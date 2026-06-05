import sys
import time
import random
import signal
import argparse
from datetime import datetime

from config import CYCLE_INTERVAL, SERIES_CONCEPT, OUTPUT_DIR
from memory import load_memory, save_memory, add_episode, add_character, add_dialogue
from memory import add_build, add_world_event, add_storyline, add_idea
from generators import GENERATORS, generate_ideas
from writers import WRITERS

running = True


def signal_handler(sig, frame):
    global running
    print("\n[Brain] Shutting down gracefully...")
    running = False


signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


BANNER = r"""
 __  __  _  _  _  _  ___  ___  ___  ___  _  _  ___  ___ 
|  \/  || \| || \| |/ __|| _ \/ _ \/ _ \| \| |/ __|| _ \
| |\/| ||    ||    | (_  |   / (_) \_,_/|    |\__ \|  _/
|_|  |_||_|\_||_|\_|\___||_|_\\___/(_) |_|\_||___/|_|  
                                                         
    Minecraft SMP AI Brain - Never Stops Creating
"""


def print_status(memory, cycle):
    chars = len(memory.get("characters", []))
    eps = len(memory.get("episodes", []))
    builds = len(memory.get("builds", []))
    events = len(memory.get("world_events", []))
    arcs = len(memory.get("storylines", []))
    ideas = len(memory.get("ideas_pool", []))

    print(f"\n{'='*60}")
    print(f"  Cycle #{cycle} | {datetime.now().strftime('%H:%M:%S')}")
    print(f"  Episodes: {eps} | Characters: {chars} | Builds: {builds}")
    print(f"  Events: {events} | Arcs: {arcs} | Ideas: {ideas}")
    print(f"{'='*60}")


def pick_focus(memory):
    focus_modules = ["episodes", "dialogue", "characters", "builds", "world_events", "storylines"]
    last = memory.get("last_focus", "")

    weights = {
        "episodes": 2.0,
        "dialogue": 1.5,
        "characters": 1.5,
        "builds": 1.0,
        "world_events": 1.0,
        "storylines": 1.0,
    }

    if last in weights:
        weights[last] *= 0.3

    ep_count = len(memory.get("episodes", []))
    char_count = len(memory.get("characters", []))

    if ep_count < 2:
        weights["episodes"] *= 3
    if char_count < 3:
        weights["characters"] *= 2.5
    if ep_count > 5 and char_count > 3:
        weights["storylines"] *= 1.5
        weights["world_events"] *= 1.5

    focus_list = list(weights.keys())
    weight_list = [weights[f] for f in focus_list]
    return random.choices(focus_list, weights=weight_list, k=1)[0]


def run_cycle(memory, cycle_num, force_focus=None):
    print_status(memory, cycle_num)

    if force_focus:
        focus = force_focus
    else:
        focus = pick_focus(memory)

    print(f"  [Focus] {focus.upper()}")

    if focus not in GENERATORS:
        print(f"  [Error] Unknown focus: {focus}")
        return

    if random.random() < 0.15 and not force_focus:
        print("  [Bonus] Generating raw ideas...")
        ideas = generate_ideas(memory)
        for idea in ideas:
            add_idea(memory, idea)
        writers_func = WRITERS.get("ideas")
        if writers_func:
            writers_func(ideas, OUTPUT_DIR)
        print(f"  [Ideas] Added {len(ideas)} raw ideas to pool")

    print(f"  [Generating] Creating {focus} content...")
    data = GENERATORS[focus](memory)

    if isinstance(data, list):
        if focus == "ideas":
            for idea in data:
                add_idea(memory, idea)
            path = WRITERS[focus](data, OUTPUT_DIR)
        else:
            print(f"  [Error] Unexpected list response for {focus}")
            return
    elif isinstance(data, dict):
        add_funcs = {
            "episodes": add_episode,
            "dialogue": add_dialogue,
            "characters": add_character,
            "builds": add_build,
            "world_events": add_world_event,
            "storylines": add_storyline,
        }

        add_func = add_funcs.get(focus)
        if add_func:
            add_func(memory, data)

        writer_func = WRITERS.get(focus)
        if writer_func:
            path = writer_func(data, OUTPUT_DIR)
            print(f"  [Saved] {path}")
    else:
        print(f"  [Error] Unexpected response type: {type(data)}")
        return

    save_memory(memory)

    title = data.get("title", data.get("name", "Content")) if isinstance(data, dict) else f"{len(data)} ideas"
    print(f"  [Done] Generated: {title}")


def run_once(memory, focus=None):
    cycle = memory.get("generation_count", 0) + 1
    run_cycle(memory, cycle, force_focus=focus)
    print(f"\n[Brain] Single generation complete. Check {OUTPUT_DIR}/ for output.")


def run_continuous(memory):
    print(BANNER)
    print(f"  Concept: {SERIES_CONCEPT[:80].strip()}...")
    print(f"  Cycle: every {CYCLE_INTERVAL}s")
    print(f"  Output: {OUTPUT_DIR}/")
    print(f"  Press Ctrl+C to stop\n")

    cycle = memory.get("generation_count", 0)

    global running
    while running:
        cycle += 1
        try:
            run_cycle(memory, cycle)
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"  [Error] {e}")

        if not running:
            break

        print(f"\n  [Sleep] Waiting {CYCLE_INTERVAL}s until next cycle...")
        for i in range(CYCLE_INTERVAL):
            if not running:
                break
            time.sleep(1)

    save_memory(memory)
    print(f"\n[Brain] Stopped. Generated {cycle} cycles total.")
    print(f"  Output saved in: {OUTPUT_DIR}/")


def main():
    parser = argparse.ArgumentParser(description="Minecraft SMP AI Brain")
    parser.add_argument("--once", action="store_true", help="Run one generation cycle then exit")
    parser.add_argument("--focus", choices=["episodes", "dialogue", "characters", "builds", "world_events", "storylines", "ideas"],
                        help="Force a specific focus (use with --once)")
    parser.add_argument("--cycle", type=int, default=CYCLE_INTERVAL, help="Override cycle interval in seconds")
    parser.add_argument("--seed", action="store_true", help="Generate initial seed content (characters + episode)")
    args = parser.parse_args()

    memory = load_memory()

    if not memory.get("series_concept"):
        memory["series_concept"] = SERIES_CONCEPT
        save_memory(memory)

    if args.seed:
        print("[Seed] Generating initial content...")
        run_cycle(memory, 1, force_focus="characters")
        run_cycle(memory, 2, force_focus="characters")
        run_cycle(memory, 3, force_focus="episodes")
        print("[Seed] Initial content generated.")
        return

    if args.once:
        run_once(memory, focus=args.focus)
    else:
        import config
        config.CYCLE_INTERVAL = args.cycle
        run_continuous(memory)


if __name__ == "__main__":
    main()
