"""
Character System for Storytelling Animation.
Simple 2D cartoon characters with animations.
"""

from enum import Enum
from dataclasses import dataclass, field
from typing import Optional, Tuple
from PIL import Image, ImageDraw


class CharacterState(Enum):
    """Character emotional states."""
    IDLE = "idle"
    HAPPY = "happy"
    SAD = "sad"
    TALKING = "talking"
    THINKING = "thinking"
    WALKING = "walking"
    SURPRISED = "surprised"


class Direction(Enum):
    """Character facing direction."""
    LEFT = -1
    RIGHT = 1
    CENTER = 0


@dataclass
class CharacterPose:
    """A single character pose/keyframe."""
    body_parts: list = field(default_factory=list)
    mouth_open: bool = False
    eye_state: str = "normal"  # normal, happy, closed, surprised
    arm_angle: int = 0
    tilt: int = 0


@dataclass
class Character:
    """A 2D character for storytelling."""
    name: str
    x: int = 960
    y: int = 600
    width: int = 120
    height: int = 200
    direction: Direction = Direction.RIGHT
    state: CharacterState = CharacterState.IDLE
    scale: float = 1.0
    color: Tuple[int, int, int] = (255, 220, 177)  # Skin tone
    
    # Color scheme per character type
    shirt_color: Tuple[int, int, int] = (100, 150, 255)
    pants_color: Tuple[int, int, int] = (50, 50, 150)
    hair_color: Tuple[int, int, int] = (50, 30, 20)
    

class StickmanCharacter(Character):
    """Stickman style character."""
    
    def __init__(self, name: str, **kwargs):
        super().__init__(name, **kwargs)
        self.line_width = 4
    
    def draw(self, draw: ImageDraw.Draw, frame_num: int = 0):
        """Draw stickman character."""
        x, y = self.x, self.y
        w, h = int(self.width * self.scale), int(self.height * self.scale)
        
        # Body line
        body_color = (30, 30, 30)
        
        # Head
        head_x = x
        head_y = y - h // 2 + 30
        head_radius = 25
        
        draw.ellipse(
            [head_x - head_radius, head_y - head_radius,
             head_x + head_radius, head_y + head_radius],
            outline=body_color,
            width=self.line_width
        )
        
        # Eyes based on state
        if self.state == CharacterState.HAPPY:
            # Happy eyes (arcs)
            eye_offset = 8
            draw.arc(
                [head_x - 15, head_y - 5,
                 head_x - 5, head_y + 5],
                start=0, end=180,
                fill=body_color, width=2
            )
            draw.arc(
                [head_x + 5, head_y - 5,
                 head_x + 15, head_y + 5],
                start=0, end=180,
                fill=body_color, width=2
            )
        elif self.state == CharacterState.SAD:
            # Sad eyes
            draw.line(
                [head_x - 12, head_y - 3, head_x - 5, head_y],
                fill=body_color, width=2
            )
            draw.line(
                [head_x + 5, head_y, head_x + 12, head_y - 3],
                fill=body_color, width=2
            )
        else:
            # Normal eyes
            eye_y = head_y - 2
            draw.ellipse(
                [head_x - 12, eye_y - 3, head_x - 5, eye_y + 3],
                fill=body_color
            )
            draw.ellipse(
                [head_x + 5, eye_y - 3, head_x + 12, eye_y + 3],
                fill=body_color
            )
        
        # Mouth based on state
        mouth_y = head_y + 12
        
        if self.state == CharacterState.HAPPY:
            draw.arc(
                [head_x - 12, mouth_y,
                 head_x + 12, mouth_y + 15],
                start=0, end=180,
                fill=body_color, width=2
            )
        elif self.state == CharacterState.SAD:
            draw.arc(
                [head_x - 10, mouth_y + 5,
                 head_x + 10, mouth_y + 15],
                start=180, end=360,
                fill=body_color, width=2
            )
        elif self.state == CharacterState.TALKING:
            # Open mouth
            draw.ellipse(
                [head_x - 8, mouth_y,
                 head_x + 8, mouth_y + 10],
                fill=body_color
            )
        else:
            draw.line(
                [head_x - 8, mouth_y + 5,
                 head_x + 8, mouth_y + 5],
                fill=body_color, width=2
            )
        
        # Body
        neck_y = head_y + head_radius
        body_top = neck_y + 5
        body_bottom = y + h // 2 - 20
        
        draw.line(
            [x, body_top, x, body_bottom],
            fill=body_color, width=self.line_width
        )
        
        # Arms
        arm_start = body_top + 30
        arm_length = 40
        
        if self.state == CharacterState.TALKING:
            # Arms gesturing
            draw.line(
                [x, arm_start, x - arm_length, arm_start - 20],
                fill=body_color, width=self.line_width
            )
            draw.line(
                [x, arm_start, x + arm_length, arm_start - 20],
                fill=body_color, width=self.line_width
            )
        elif self.state == CharacterState.THINKING:
            # Hand on chin
            draw.line(
                [x, arm_start, x + 20, arm_start + 10],
                fill=body_color, width=self.line_width
            )
        else:
            # Normal arms
            draw.line(
                [x, arm_start, x - 30, arm_start + 30],
                fill=body_color, width=self.line_width
            )
            draw.line(
                [x, arm_start, x + 30, arm_start + 30],
                fill=body_color, width=self.line_width
            )
        
        # Legs
        leg_bottom = y + h // 2
        draw.line(
            [x, body_bottom, x - 25, leg_bottom],
            fill=body_color, width=self.line_width
        )
        draw.line(
            [x, body_bottom, x + 25, leg_bottom],
            fill=body_color, width=self.line_width
        )
        
        # Name label
        if self.name:
            label_color = (200, 200, 200)
            draw.text(
                (x - 30, leg_bottom + 10),
                self.name,
                fill=label_color
            )


class CartoonCharacter(Character):
    """More detailed cartoon character."""
    
    def __init__(self, name: str, **kwargs):
        super().__init__(name, **kwargs)
        self.shirt_color = kwargs.get("shirt_color", (100, 150, 255))
        self.hair_color = kwargs.get("hair_color", (50, 30, 20))
    
    def draw(self, draw: ImageDraw.Draw, frame_num: int = 0):
        """Draw cartoon character."""
        x, y = self.x, self.y
        w, h = int(self.width * self.scale), int(self.height * self.scale)
        dir_factor = self.direction.value
        
        # Position offsets
        head_y = y - h // 2 + 30
        
        # Hair
        hair_color = self.hair_color
        draw.ellipse(
            [x - 30 * dir_factor, head_y - 35,
             x + 30 * dir_factor, head_y - 5],
            fill=hair_color
        )
        
        # Head/Face
        face_color = self.color
        draw.ellipse(
            [x - 25, head_y - 25,
             x + 25, head_y + 20],
            fill=face_color,
            outline=(200, 180, 150),
            width=2
        )
        
        # Eyes
        eye_y = head_y - 5
        
        if self.state == CharacterState.HAPPY:
            # Happy closed eyes
            draw.arc(
                [x - 18, eye_y - 3,
                 x - 8, eye_y + 5],
                start=0, end=180,
                fill=(30, 30, 30), width=2
            )
            draw.arc(
                [x + 8, eye_y - 3,
                 x + 18, eye_y + 5],
                start=0, end=180,
                fill=(30, 30, 30), width=2
            )
        elif self.state == CharacterState.SURPRISED:
            # Big surprised eyes
            draw.ellipse(
                [x - 18, eye_y - 8,
                 x - 8, eye_y + 8],
                fill=(30, 30, 30)
            )
            draw.ellipse(
                [x + 8, eye_y - 8,
                 x + 18, eye_y + 8],
                fill=(30, 30, 30)
            )
        else:
            # Normal eyes
            draw.ellipse(
                [x - 18, eye_y - 4,
                 x - 8, eye_y + 4],
                fill=(30, 30, 30)
            )
            draw.ellipse(
                [x + 8, eye_y - 4,
                 x + 18, eye_y + 4],
                fill=(30, 30, 30)
            )
        
        # Blush (happy)
        if self.state == CharacterState.HAPPY:
            draw.ellipse(
                [x - 22, head_y + 2,
                 x - 14, head_y + 8],
                fill=(255, 180, 180)
            )
            draw.ellipse(
                [x + 14, head_y + 2,
                 x + 22, head_y + 8],
                fill=(255, 180, 180)
            )
        
        # Mouth
        mouth_y = head_y + 12
        
        if self.state == CharacterState.HAPPY:
            draw.arc(
                [x - 12, mouth_y,
                 x + 12, mouth_y + 12],
                start=0, end=180,
                fill=(200, 50, 50), width=3
            )
        elif self.state == CharacterState.SAD:
            draw.arc(
                [x - 10, mouth_y + 6,
                 x + 10, mouth_y + 14],
                start=180, end=360,
                fill=(200, 50, 50), width=3
            )
        elif self.state == CharacterState.TALKING:
            draw.ellipse(
                [x - 10, mouth_y,
                 x + 10, mouth_y + 12],
                fill=(200, 50, 50)
            )
        else:
            draw.line(
                [x - 8, mouth_y + 6,
                 x + 8, mouth_y + 6],
                fill=(200, 50, 50), width=3
            )
        
        # Body/Shirt
        shirt_top = head_y + 25
        shirt_bottom = y + h // 2 - 30
        
        draw.rectangle(
            [x - 25, shirt_top,
             x + 25, shirt_bottom],
            fill=self.shirt_color
        )
        
        # Arms
        arm_y = shirt_top + 20
        
        if self.state == CharacterState.TALKING:
            # Pointing arms
            draw.line(
                [x - 25, arm_y, x - 50, arm_y - 15],
                fill=self.shirt_color, width=12
            )
            draw.line(
                [x + 25, arm_y, x + 50, arm_y - 15],
                fill=self.shirt_color, width=12
            )
        else:
            # Down arms
            draw.line(
                [x - 25, arm_y, x - 35, arm_y + 35],
                fill=self.shirt_color, width=12
            )
            draw.line(
                [x + 25, arm_y, x + 35, arm_y + 35],
                fill=self.shirt_color, width=12
            )
        
        # Hands
        hand_color = self.color
        
        if self.state == CharacterState.TALKING:
            draw.ellipse(
                [x - 55, arm_y - 20,
                 x - 45, arm_y - 10],
                fill=hand_color
            )
            draw.ellipse(
                [x + 45, arm_y - 20,
                 x + 55, arm_y - 10],
                fill=hand_color
            )
        
        # Pants/Legs
        leg_top = shirt_bottom
        leg_bottom = y + h // 2
        
        draw.rectangle(
            [x - 25, leg_top,
             x - 5, leg_bottom],
            fill=self.pants_color
        )
        draw.rectangle(
            [x + 5, leg_top,
             x + 25, leg_bottom],
            fill=self.pants_color
        )
        
        # Shoes
        draw.ellipse(
            [x - 30, leg_bottom - 5,
             x - 5, leg_bottom + 5],
            fill=(50, 50, 50)
        )
        draw.ellipse(
            [x + 5, leg_bottom - 5,
             x + 30, leg_bottom + 5],
            fill=(50, 50, 50)
        )
        
        # Name label
        if self.name:
            draw.text(
                (x - 30, leg_bottom + 10),
                self.name,
                fill=(200, 200, 200)
            )


def create_character(
    name: str,
    style: str = "cartoon",
    **kwargs
) -> Character:
    """Factory function to create characters."""
    if style == "stickman":
        return StickmanCharacter(name, **kwargs)
    else:
        return CartoonCharacter(name, **kwargs)