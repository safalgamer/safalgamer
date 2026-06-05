"""
Story Renderer - Command-line entry point.
"""

import json
import subprocess
import random
import sys
from pathlib import Path
from dataclasses import dataclass

# Add project to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))


@dataclass
class StoryConfig:
    width: int = 1920
    height: int = 1080
    fps: int = 30
    output_dir: str = "./output"


class Story:
    def __init__(self, title: str, scenes: list = None):
        self.title = title
        self.scenes = scenes or []
        
    def add_scene(self, scene):
        self.scenes.append(scene)
    
    @property
    def duration(self) -> float:
        return sum(s.duration for s in self.scenes)
    
    @property
    def frame_count(self) -> int:
        return sum(s.frames for s in self.scenes)


class StoryRenderer:
    def __init__(self, config: StoryConfig):
        self.config = config
        from src.scenes.scene import SceneRenderer
        self.scene_renderer = SceneRenderer(config.width, config.height, config.fps)
        random.seed(42)
    
    def render_story(self, story: Story, output_file: str = "output.mp4") -> Path:
        output_dir = Path(self.config.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"Rendering: {story.title}")
        print(f"Duration: {story.duration:.1f}s, Frames: {story.frame_count}")
        
        all_frames = []
        
        for i, scene in enumerate(story.scenes):
            print(f"  Scene {i+1}/{len(story.scenes)}: {scene.scene_id}")
            frames = self.scene_renderer.render_scene(scene)
            all_frames.extend(frames)
        
        print(f"Total frames: {len(all_frames)}")
        
        # Save frames
        frames_dir = output_dir / "frames_temp"
        frames_dir.mkdir(parents=True, exist_ok=True)
        
        print("Saving frames...")
        frame_paths = []
        
        for i, frame in enumerate(all_frames):
            path = frames_dir / f"frame_{i:05d}.png"
            frame.save(path, quality=95)
            frame_paths.append(path)
        
        # Encode
        print("Encoding...")
        video_path = output_dir / output_file
        pattern = str(frames_dir / "frame_%05d.png")
        
        cmd = [
            "ffmpeg", "-y",
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
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)
            
            if result.returncode == 0:
                print(f"Done: {video_path}")
            else:
                print(f"Error: {result.stderr[:300]}")
                return None
        except Exception as e:
            print(f"Error: {e}")
            return None
        
        # Cleanup
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


class StoryBuilder:
    def __init__(self, title: str):
        self.title = title
        self.scenes = []
        self.current_bg = "plain"
    
    def set_background(self, bg_type: str) -> "StoryBuilder":
        self.current_bg = bg_type
        return self
    
    def add_scene(self, scene) -> "StoryBuilder":
        self.scenes.append(scene)
        return self
    
    def build(self) -> Story:
        return Story(self.title, self.scenes)


def render_sample_story(output_file: str, output_dir: str) -> Path:
    """Render sample story."""
    
    config = StoryConfig()
    config.output_dir = output_dir
    renderer = StoryRenderer(config)
    
    # Import builders
    from src.scenes.scene import create_scene
    from src.backgrounds.background import BackgroundType
    
    builder = StoryBuilder("The New Friend")
    
    # Scene 1: Classroom intro
    scene1 = create_scene(
        "classroom_intro",
        duration=4.0,
        background=BackgroundType.CLASSROOM,
        characters=[{"name": "Emma", "x": 700}, {"name": "Max", "x": 1200}],
        dialogues=["Emma: Hi Max! Welcome!", "Max: Thanks!"],
        narration="First day of school..."
    )
    builder.add_scene(scene1)
    
    # Scene 2: Park
    scene2 = create_scene(
        "playground",
        duration=4.0,
        background=BackgroundType.PARK,
        characters=[{"name": "Emma", "x": 800}, {"name": "Max", "x": 1100}],
        dialogues=["Emma: Want to play?", "Max: Yes!"],
        narration="Making friends..."
    )
    builder.add_scene(scene2)
    
    # Scene 3: Ending
    scene3 = create_scene(
        "ending",
        duration=3.0,
        dialogues=[],
        narration="The End! Thanks for watching!"
    )
    builder.add_scene(scene3)
    
    story = StoryBuilder("The New Friend").build()
    story.scenes = builder.scenes
    
    return renderer.render_story(story, output_file)


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Story Renderer")
    parser.add_argument("--sample", action="store_true", help="Render sample story")
    parser.add_argument("-o", "--output", default="story.mp4")
    parser.add_argument("-d", "--dir", default="./output")
    
    args = parser.parse_args()
    
    if args.sample:
        result = render_sample_story(args.output, args.dir)
        if result:
            print(f"SUCCESS: {result}")
            return 0
        return 1
    
    print("Use --sample flag")
    return 0


if __name__ == "__main__":
    exit(main())