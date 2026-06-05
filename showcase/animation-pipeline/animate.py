"""
Proper State-Based Story Renderer.
Uses time-based animation with interpolation - NOT frame generation.
"""

import sys
import subprocess
import random
from pathlib import Path
from dataclasses import dataclass

# Add project to path  
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.core.animation_state import (
    AnimationEngine,
    StoryState,
    SceneState,
    create_walk_animation,
    create_talk_animation,
    EasingType
)
from src.characters.character import StickmanCharacter, CartoonCharacter, CharacterState as CharAnimState
from src.backgrounds.background import create_background, BackgroundType
from src.dialogue.dialogue import SpeechBubbleRenderer


@dataclass
class RenderConfig:
    width: int = 1920
    height: int = 1080
    fps: int = 30
    output_dir: str = './output'


class StateBasedRenderer:
    """Renderer that derives frames from global state."""
    
    def __init__(self, config: RenderConfig):
        self.config = config
        self.dialogue_renderer = SpeechBubbleRenderer()
        self.fps = config.fps
        random.seed(42)  # Fixed seed
    
    def render_dialogue_frame(self, frame_data: dict, state: SceneState):
        """Render dialogue from current state."""
        if state.current_dialogue:
            # Get speaker info
            speaker = state.current_dialogue.split(":")[0] if ":" in state.current_dialogue else ""
            text = state.current_dialogue.split(":")[1] if ":" in state.current_dialogue else state.current_dialogue
            
            from src.dialogue.dialogue import Dialogue, DialogueType
            dlg = Dialogue(speaker=speaker.strip(), text=text.strip(), type=DialogueType.SPEECH)
            return self.dialogue_renderer.render(frame_data, dlg)
        return frame_data
    
    def render_story(self, story: StoryState, output_file: str = "output.mp4") -> Path:
        """Render story using proper time-based animation."""
        output_dir = Path(self.config.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"Rendering: {story.title}")
        
        # Use proper animation engine
        engine = AnimationEngine(self.config.fps)
        
        # Generate frames from state (time-based, NOT independent)
        frames_data = engine.generate_frames(story)
        
        print(f"Generated {len(frames_data)} frames from state")
        
        # Save frames
        frames_dir = output_dir / "frames_state"
        frames_dir.mkdir(parents=True, exist_ok=True)
        
        from PIL import Image
        frame_paths = []
        
        for i, frame_data in enumerate(frames_data):
            # Create background
            bg = create_background(
                BackgroundType[frame_data.get("background", "plain").upper()]
            )
            bg.width = self.config.width
            bg.height = self.config.height
            frame = bg.create_frame()
            bg.draw(frame)
            
            # Draw characters from state
            from PIL import ImageDraw
            draw = ImageDraw.Draw(frame)
            
            for char_data in frame_data.get("characters", []):
                # Create character at state position
                char = CartoonCharacter(
                    name=char_data["id"],
                    x=int(char_data["x"]),
                    y=int(char_data["y"])
                )
                
                # Set animation state
                anim_state = char_data.get("state", "idle")
                if anim_state == "talking":
                    from src.characters.character import CharacterState
                    char.state = CharacterState.TALKING
                elif anim_state == "happy":
                    from src.characters.character import CharacterState
                    char.state = CharacterState.HAPPY
                
                char.draw(draw, i)
            
            # Draw dialogue from state
            if frame_data.get("dialogue"):
                from src.dialogue.dialogue import Dialogue, DialogueType
                dlg = Dialogue(
                    speaker="",
                    text=frame_data["dialogue"],
                    type=DialogueType.SPEECH
                )
                frame = self.dialogue_renderer.render(frame, dlg)
            
            # Draw narration from state
            if frame_data.get("narration"):
                from src.dialogue.dialogue import Dialogue, DialogueType
                dlg = Dialogue(
                    speaker="",
                    text=frame_data["narration"], 
                    type=DialogueType.NARRATION
                )
                frame = self.dialogue_renderer.render(frame, dlg)
            
            # Save frame
            path = frames_dir / f"frame_{i:05d}.png"
            frame.save(path, quality=90)
            frame_paths.append(path)
        
        # Encode video
        video_path = output_dir / output_file
        pattern = str(frames_dir / "frame_%05d.png")
        
        cmd = [
            "ffmpeg", "-y",
            "-framerate", str(self.config.fps),
            "-i", pattern,
            "-fps_mode", "cfr", 
            "-pix_fmt", "yuv420p",
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "23",
            str(video_path)
        ]
        
        print("Encoding video...")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)
        
        if result.returncode == 0:
            print(f"Done: {video_path}")
        else:
            print(f"Error: {result.stderr[:300]}")
            return None
        
        # Cleanup frames
        for p in frame_paths:
            p.unlink()
        frames_dir.rmdir()
        
        return video_path


def create_animated_story() -> StoryState:
    """Create a TEST story with PROPER animation.
    
    Key: Movement is defined as keyframes over TIME,
    NOT as positions per frame.
    """
    story = StoryState(title="Animated Walk Test", total_duration=0)
    
    # Scene 1: Character walks from left to right
    scene = SceneState(scene_id="walk_scene", duration=6.0)
    
    # Add character at start
    scene.add_character("Emma", 300, 600)
    
    # KEY: Define movement as TIME-BASED keyframes
    # Character walks from x=300 to x=1300 over 4 seconds
    scene.move_character("Emma", 0, 300, 600)  # Start at time 0
    scene.move_character("Emma", 2, 800, 600, EasingType.LINEAR)  # Middle
    scene.move_character("Emma", 4, 1300, 600, EasingType.EASE_OUT)  # End
    
    # Add state changes
    scene.change_state("Emma", 0, "idle")
    scene.change_state("Emma", 0.5, "walking")
    scene.change_state("Emma", 4, "happy")
    
    # Add dialogue over time
    scene.current_dialogue = "Emma: Watch me walk!"
    scene.dialogue_start = 0
    scene.dialogue_duration = 2.0
    
    scene.narration = "Smooth walk animation..."
    
    story.add_scene(scene)
    story.total_duration = scene.duration
    
    return story


def create_walking_story() -> StoryState:
    """Create a story with multiple walking animations."""
    
    story = StoryState(title="The New Friend", total_duration=0)
    
    # Scene 1: Emma enters the classroom
    scene1 = SceneState(scene_id="enter_classroom", duration=5.0)
    scene1.add_character("Emma", 200, 600)
    scene1.add_character("Max", 1300, 600)
    scene1.background_type = "classroom"
    
    # Emma walks in from left to center
    scene1.move_character("Emma", 0, 200, 600)
    scene1.move_character("Emma", 2, 700, 600, EasingType.EASE_OUT)
    
    # Emma's states over time
    scene1.change_state("Emma", 0, "walking")
    scene1.change_state("Emma", 2, "idle")
    scene1.change_state("Emma", 3, "happy")
    
    story.add_scene(scene1)
    
    # Scene 2: Dialogue
    scene2 = SceneState(scene_id="dialogue", duration=4.0)
    scene2.add_character("Emma", 700, 600)
    scene2.add_character("Max", 1200, 600)
    scene2.background_type = "classroom"
    
    scene2.current_dialogue = "Emma: Hi Max! Welcome!"
    scene2.dialogue_start = 0
    scene2.dialogue_duration = 2.5
    
    scene2.change_state("Emma", 0, "walking")
    scene2.change_state("Emma", 0.5, "talking")
    scene2.change_state("Emma", 2.5, "happy")
    
    story.add_scene(scene2)
    
    # Scene 3: They walk to park
    scene3 = SceneState(scene_id="walk_to_park", duration=5.0)
    scene3.add_character("Emma", 700, 600)
    scene3.add_character("Max", 1200, 600)
    scene3.background_type = "park"
    
    # Both walk together
    scene3.move_character("Emma", 0, 700, 600)
    scene3.move_character("Emma", 3, 800, 600, EasingType.EASE_IN_OUT)
    
    scene3.change_state("Emma", 0, "idle")
    scene3.change_state("Emma", 0.5, "walking")
    scene3.change_state("Emma", 3, "happy")
    
    story.add_scene(scene3)
    
    # Scene 4: Ending
    scene4 = SceneState(scene_id="ending", duration=3.0)
    scene4.add_character("Emma", 960, 600)
    scene4.background_type = "plain"
    scene4.narration = "The End! Thanks for watching!"
    
    story.add_scene(scene4)
    
    return story


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="State-Based Animation Renderer")
    parser.add_argument("--test", action="store_true", help="Render test animation")
    parser.add_argument("-o", "--output", default="animated_story.mp4")
    parser.add_argument("-d", "--dir", default="./output")
    
    args = parser.parse_args()
    
    config = RenderConfig(output_dir=args.dir)
    renderer = StateBasedRenderer(config)
    
    if args.test:
        print("Creating animated story with proper state-based movement...")
        story = create_walking_story()
        
        print(f"Story: {story.title}")
        print(f"Scenes: {len(story.scenes)}")
        for i, s in enumerate(story.scenes):
            print(f"  Scene {i+1}: {s.scene_id}, {s.duration}s, {len(s.characters)} chars")
        
        result = renderer.render_story(story, args.output)
        
        if result:
            print(f"SUCCESS: {result}")
            return 0
        return 1
    
    print("Use --test flag")
    return 0


if __name__ == "__main__":
    exit(main())