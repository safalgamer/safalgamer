"""
Story Manager - Complete storytelling animation system.
Chains scenes together and exports videos.
"""

import json
import subprocess
import random
from pathlib import Path
from typing import List, Optional, Dict, Any
from dataclasses import dataclass, field
from PIL import Image

from src.scenes.scene import Scene, SceneRenderer, create_scene
from src.characters.character import Character, CharacterState, Direction, create_character
from src.backgrounds.background import Background, BackgroundType, create_background
from src.dialogue.dialogue import Dialogue, DialogueType


@dataclass
class Story:
    """A complete story with scenes."""
    title: str
    scenes: List[Scene] = field(default_factory=list)
    author: str = "Animation System"
    
    def add_scene(self, scene: Scene):
        """Add scene to story."""
        self.scenes.append(scene)
    
    @property
    def duration(self) -> float:
        """Total story duration in seconds."""
        return sum(s.duration for s in self.scenes)
    
    @property
    def frame_count(self) -> int:
        """Total frame count."""
        return sum(s.frames for s in self.scenes)


@dataclass
class StoryConfig:
    """Configuration for story rendering."""
    width: int = 1920
    height: int = 1080
    fps: int = 30
    output_dir: str = "./output"
    

class StoryRenderer:
    """Renders complete stories to videos."""
    
    def __init__(self, config: StoryConfig = None):
        self.config = config or StoryConfig()
        self.scene_renderer = SceneRenderer(
            self.config.width,
            self.config.height,
            self.config.fps
        )
        
        # Seed for reproducibility
        random.seed(42)
    
    def render_story(self, story: Story, output_file: str = "output.mp4") -> Optional[Path]:
        """Render story to video."""
        output_dir = Path(self.config.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"Rendering story: {story.title}")
        print(f"Duration: {story.duration:.1f}s, Frames: {story.frame_count}")
        
        # Render all scenes
        all_frames = []
        
        for i, scene in enumerate(story.scenes):
            print(f"  Scene {i+1}/{len(story.scenes)}: {scene.scene_id}")
            frames = self.scene_renderer.render_scene(scene)
            all_frames.extend(frames)
        
        print(f"Total frames: {len(all_frames)}")
        
        # Save frames to temp directory
        frames_dir = output_dir / "frames_story"
        frames_dir.mkdir(parents=True, exist_ok=True)
        
        print("Saving frames...")
        frame_paths = []
        
        for i, frame in enumerate(all_frames):
            path = frames_dir / f"frame_{i:05d}.png"
            frame.save(path)
            frame_paths.append(path)
        
        # Encode to video
        print("Encoding video...")
        video_path = output_dir / output_file
        
        pattern = str(frames_dir / "frame_%05d.png")
        
        cmd = [
            "ffmpeg",
            "-y",
            "-framerate", str(self.config.fps),
            "-i", pattern,
            "-fps_mode", "cfr",
            "-pix_fmt", "yuv420p",
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", "23",
            str(video_path)
        ]
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=3600  # 1 hour max
            )
            
            if result.returncode == 0:
                print(f"Video saved: {video_path}")
            else:
                print(f"Encoding error: {result.stderr[:500]}")
                return None
        except subprocess.TimeoutExpired:
            print("Encoding timeout")
            return None
        except Exception as e:
            print(f"Error: {e}")
            return None
        
        # Cleanup frames
        print("Cleaning up...")
        for p in frame_paths:
            try:
                p.unlink()
            except:
                pass
        
        try:
            frames_dir.rmdir()
        except:
            pass
        
        return video_path


# Story builder helper
class StoryBuilder:
    """Builder for creating stories programmatically."""
    
    def __init__(self, title: str):
        self.title = title
        self.scenes: List[Scene] = []
        self.current_bg = BackgroundType.PLAIN
    
    def set_background(self, bg_type: BackgroundType) -> "StoryBuilder":
        """Set default background for upcoming scenes."""
        self.current_bg = bg_type
        return self
    
    def add_scene(
        self,
        scene_id: str,
        duration: float,
        characters: List[Dict] = None,
        dialogues: List[str] = None,
        narration: str = ""
    ) -> "StoryBuilder":
        """Add a scene."""
        
        scene = create_scene(
            scene_id=scene_id,
            duration=duration,
            background=self.current_bg,
            characters=characters,
            dialogues=dialogues,
            narration=narration
        )
        
        self.scenes.append(scene)
        return self
    
    def build(self) -> Story:
        """Build the story."""
        return Story(title=self.title, scenes=self.scenes)


# Preset story templates
def create_sample_story() -> Story:
    """Create a simple sample story."""
    
    builder = StoryBuilder("The New Friend")
    
    # Scene 1: School classroom
    builder.set_background(BackgroundType.CLASSROOM)
    builder.add_scene(
        "intro",
        duration=4.0,
        characters=[{"name": "Emma", "x": 700}, {"name": "Max", "x": 1200}],
        dialogues=["Emma: Hi Max! Welcome to our school!", "Max: Thanks Emma! I'm nervous..."],
        narration="On the first day of school..."
    )
    
    # Scene 2: Classroom scene
    builder.add_scene(
        "classroom",
        duration=5.0,
        characters=[{"name": "Emma", "x": 600}, {"name": "Max", "x": 1000}, {"name": "Teacher", "x": 1400}],
        dialogues=["Teacher: Class, say hello to our new student!", "Emma: Welcome Max!", "Max: Thank you everyone!"],
        narration=""
    )
    
    # Scene 3: Park
    builder.set_background(BackgroundType.PARK)
    builder.add_scene(
        "playground",
        duration=4.0,
        characters=[{"name": "Emma", "x": 800}, {"name": "Max", "x": 1100}],
        dialogues=["Emma: Want to play on the swings?", "Max: That sounds fun!"],
        narration="Making new friends..."
    )
    
    # Scene 4: Ending
    builder.set_background(BackgroundType.PLAIN)
    builder.add_scene(
        "ending",
        duration=4.0,
        narration="The End - Thanks for watching!"
    )
    
    return builder.build()


def create_moral_story() -> Story:
    """Create a simple moral story."""
    
    builder = StoryBuilder("The Honest Child")
    
    # Scene 1: Home
    builder.set_background(BackgroundType.HOME)
    builder.add_scene(
        "intro",
        duration=4.0,
        characters=[{"name": "Tom", "x": 960, "style": "cartoon"}],
        dialogues=["Tom: I found some money on the street!"],
        narration="Once upon a time..."
    )
    
    # Scene 2: At home
    builder.set_background(BackgroundType.HOME)
    builder.add_scene(
        "home",
        duration=5.0,
        characters=[{"name": "Tom", "x": 700}, {"name": "Mom", "x": 1200}],
        dialogues=["Tom: Should we keep it?", "Mom: Honesty is the best policy."],
        narration=""
    )
    
    # Scene 3: Return money
    builder.set_background(BackgroundType.STREET)
    builder.add_scene(
        "street",
        duration=5.0,
        characters=[{"name": "Tom", "x": 700}, {"name": "Neighbor", "x": 1200}],
        dialogues=["Tom: I found this near your house.", "Neighbor: Thank you, honest boy!"],
        narration="Being honest feels good!"
    )
    
    # Scene 4: Reward
    builder.set_background(BackgroundType.PLAIN)
    builder.add_scene(
        "ending",
        duration=4.0,
        narration="Moral: Honesty is always rewarded. The End!"
    )
    
    return builder.build()


def create_story_from_config(config: Dict) -> Story:
    """Create story from JSON config."""
    
    builder = StoryBuilder(config.get("title", "Untitled Story"))
    
    for scene_config in config.get("scenes", []):
        # Set background
        bg_name = scene_config.get("background", "plain")
        try:
            bg = BackgroundType[bg_name.upper()]
            builder.set_background(bg)
        except:
            builder.set_background(BackgroundType.PLAIN)
        
        # Characters
        characters = scene_config.get("characters", [])
        
        # Dialogues
        dialogues = scene_config.get("dialogues", [])
        
        # Narration
        narration = scene_config.get("narration", "")
        
        builder.add_scene(
            scene_config.get("id", f"scene_{len(builder.scenes)}"),
            scene_config.get("duration", 4.0),
            characters=characters,
            dialogues=dialogues,
            narration=narration
        )
    
    return builder.build()


# Main CLI
def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Story Animation System")
    parser.add_argument("--sample", action="store_true", help="Generate sample story")
    parser.add_argument("--moral", action="store_true", help="Generate moral story")
    parser.add_argument("--config", type=str, help="JSON config file")
    parser.add_argument("-o", "--output", default="story.mp4", help="Output file")
    parser.add_argument("-d", "--dir", default="./output", help="Output directory")
    
    args = parser.parse_args()
    
    # Create config
    config = StoryConfig(output_dir=args.dir)
    renderer = StoryRenderer(config)
    
    # Generate story
    if args.sample:
        story = create_sample_story()
    elif args.moral:
        story = create_moral_story()
    elif args.config:
        with open(args.config) as f:
            story_config = json.load(f)
        story = create_story_from_config(story_config)
    else:
        print("Use --sample, --moral, or --config")
        return 1
    
    # Render
    result = renderer.render_story(story, args.output)
    
    if result:
        print(f"SUCCESS: {result}")
        return 0
    return 1


if __name__ == "__main__":
    exit(main())