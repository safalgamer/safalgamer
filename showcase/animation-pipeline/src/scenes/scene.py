"""
Scene System for Storytelling.
Manages individual scenes within a story.
"""

import random
from enum import Enum
from dataclasses import dataclass, field
from typing import List, Optional, Callable, Dict
from PIL import Image

from src.characters.character import Character, CharacterState, Direction, create_character
from src.backgrounds.background import Background, BackgroundType, create_background
from src.dialogue.dialogue import Dialogue, DialogueType, SpeechBubbleRenderer


class SceneTransition(Enum):
    """Scene transition effects."""
    CUT = "cut"
    FADE = "fade"
    DISSOLVE = "dissolve"


@dataclass
class Animation:
    """An animation for a character."""
    target: str  # Character name
    animation_type: str = "move"  # move, fade, effect
    start_value: float = 0
    end_value: float = 0
    duration: float = 1.0  # seconds
    
    @property
    def frames(self) -> int:
        return int(self.duration * 30)


@dataclass
class Scene:
    """A single scene in a story."""
    scene_id: str
    duration: float = 5.0  # seconds
    background: Background = None
    characters: List[Character] = field(default_factory=list)
    dialogues: List[Dialogue] = field(default_factory=list)
    narration: str = ""
    transition: SceneTransition = SceneTransition.CUT
    
    def __post_init__(self):
        if self.background is None:
            self.background = create_background(BackgroundType.PLAIN)
    
    @property
    def frames(self) -> int:
        return int(self.duration * 30)
    
    def add_character(self, character: Character):
        """Add character to scene."""
        self.characters.append(character)
    
    def add_dialogue(self, dialogue: Dialogue):
        """Add dialogue to scene."""
        self.dialogues.append(dialogue)
    
    def set_narration(self, text: str):
        """Set scene narration."""
        self.narration = text


class SceneRenderer:
    """Renders scenes to frames."""
    
    def __init__(
        self,
        width: int = 1920,
        height: int = 1080,
        fps: int = 30
    ):
        self.width = width
        self.height = height
        self.fps = fps
        
        self.dialogue_renderer = SpeechBubbleRenderer()
        
        # Set random seed for reproducibility
        random.seed(42)
    
    def render_scene(self, scene: Scene) -> List[Image.Image]:
        """Render a complete scene to frames."""
        frames = []
        num_frames = scene.frames
        
        # Get dialogue for current frame range
        current_dialogue = None
        dialogue_start_frame = 0
        
        for frame_num in range(num_frames):
            # Check if we should show dialogue
            if scene.dialogues and current_dialogue is None:
                current_dialogue = scene.dialogues[0]
                dialogue_start_frame = frame_num
            
            # Check if dialogue should end
            if current_dialogue and frame_num >= dialogue_start_frame + current_dialogue.duration_frames:
                scene.dialogues.pop(0)
                current_dialogue = None if not scene.dialogues else scene.dialogues[0]
                if current_dialogue:
                    dialogue_start_frame = frame_num
            
            # Create frame
            frame = self._create_frame(scene, frame_num, current_dialogue)
            frames.append(frame)
        
        return frames
    
    def _create_frame(
        self,
        scene: Scene,
        frame_num: int,
        dialogue: Optional[Dialogue] = None
    ) -> Image.Image:
        """Create a single frame."""
        
        # Background
        frame = scene.background.create_frame()
        scene.background.draw(frame)
        
        # Characters
        for char in scene.characters:
            if hasattr(char, 'draw'):
                # Convert PIL ImageDraw for drawing
                from PIL import ImageDraw
                draw = ImageDraw.Draw(frame)
                char.draw(draw, frame_num)
        
        # Dialogue
        if dialogue:
            self.dialogue_renderer.render(frame, dialogue)
        
        # Narration (always visible at bottom)
        if scene.narration:
            self.dialogue_renderer.render_narration(frame, scene.narration)
        
        return frame
    
    def render_to_frames(
        self,
        scenes: List[Scene],
        include_transitions: bool = False
    ) -> List[Image.Image]:
        """Render multiple scenes to frames."""
        all_frames = []
        
        for scene in scenes:
            frames = self.render_scene(scene)
            all_frames.extend(frames)
        
        return all_frames


# Scene builders for common patterns
def create_scene(
    scene_id: str,
    duration: float,
    background: BackgroundType = BackgroundType.PLAIN,
    characters: List[Dict] = None,
    dialogues: List[str] = None,
    narration: str = ""
) -> Scene:
    """Create a scene from config."""
    
    # Create background
    bg = create_background(background)
    
    scene = Scene(
        scene_id=scene_id,
        duration=duration,
        background=bg
    )
    
    # Add characters
    if characters:
        for char_config in characters:
            char = create_character(
                char_config.get("name", "Character"),
                style=char_config.get("style", "cartoon"),
                x=char_config.get("x", 960),
                y=char_config.get("y", 600)
            )
            scene.add_character(char)
    
    # Add dialogues
    if dialogues:
        for dlg in dialogues:
            if isinstance(dlg, str):
                # Format: "Speaker: Text"
                if ":" in dlg:
                    speaker, text = dlg.split(":", 1)
                    scene.add_dialogue(Dialogue(speaker.strip(), text.strip()))
                else:
                    scene.add_dialogue(Dialogue("", dlg))
            elif isinstance(dlg, Dialogue):
                scene.add_dialogue(dlg)
    
    # Set narration
    if narration:
        scene.set_narration(narration)
    
    return scene