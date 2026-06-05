"""
Dialogue System for Storytelling.
Speech bubbles and narration text.
"""

from enum import Enum
from dataclasses import dataclass
from typing import Tuple, Optional
from PIL import Image, ImageDraw, ImageFont


class DialogueType(Enum):
    """Types of dialogue display."""
    SPEECH = "speech"        # Character speech bubble
    THOUGHT = "thought"    # Thought bubble
    NARRATION = "narration"  # On-screen narration
    SIGN = "sign"         # Sign/text overlay


@dataclass
class Dialogue:
    """A line of dialogue."""
    speaker: str
    text: str
    type: DialogueType = DialogueType.SPEECH
    position: Optional[Tuple[int, int]] = None  # Custom position
    
    @property
    def duration_frames(self) -> int:
        """Estimated duration based on text length."""
        return max(90, len(self.text) * 8)  # ~3 seconds minimum


class SpeechBubbleRenderer:
    """Renders speech bubbles."""
    
    def __init__(
        self,
        text_color: Tuple[int, int, int] = (30, 30, 30),
        bg_color: Tuple[int, int, int] = (255, 255, 255),
        border_color: Tuple[int, int, int] = (50, 50, 50)
    ):
        self.text_color = text_color
        self.bg_color = bg_color
        self.border_color = border_color
        
        # Try to load font
        self.font = self._load_font(28)
        self.small_font = self._load_font(20)
    
    def _load_font(self, size: int) -> ImageFont.FreeTypeFont:
        """Load font, fallback to default."""
        try:
            return ImageFont.truetype("arial.ttf", size)
        except:
            return ImageFont.load_default()
    
    def render_speech_bubble(
        self,
        frame: Image.Image,
        text: str,
        position: Tuple[int, int] = (960, 800),
        speaker: str = None
    ) -> Image.Image:
        """Render a speech bubble."""
        draw = ImageDraw.Draw(frame)
        
        # Get text size
        bbox = draw.textbbox((0, 0), text, font=self.font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        
        # Bubble padding
        pad_x, pad_y = 30, 20
        
        # Bubble dimensions
        bubble_w = text_w + pad_x * 2
        bubble_h = text_h + pad_y * 2
        
        # Position (center on position point)
        bx = position[0] - bubble_w // 2
        by = position[1] - bubble_h
        
        # Balloon tail
        tail_w = 30
        
        # Draw bubble background
        draw.rectangle(
            [bx - 5, by - 5,
             bx + bubble_w + 5, by + bubble_h + 5],
            outline=self.border_color,
            width=3
        )
        draw.rectangle(
            [bx, by, bx + bubble_w, by + bubble_h],
            fill=self.bg_color
        )
        
        # Draw text
        text_x = bx + pad_x
        text_y = by + pad_y
        draw.text(
            (text_x, text_y),
            text,
            fill=self.text_color,
            font=self.font
        )
        
        # Speaker name (if provided)
        if speaker:
            name_y = by - 25
            draw.text(
                (bx, name_y),
                speaker,
                fill=self.text_color,
                font=self.small_font
            )
        
        return frame
    
    def render_thought_bubble(
        self,
        frame: Image.Image,
        text: str,
        position: Tuple[int, int] = (800, 750)
    ) -> Image.Image:
        """Render a thought bubble."""
        draw = ImageDraw.Draw(frame)
        
        bbox = draw.textbbox((0, 0), text, font=self.font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        
        pad_x, pad_y = 25, 15
        bubble_w = text_w + pad_x * 2
        bubble_h = text_h + pad_y * 2
        
        bx = position[0] - bubble_w // 2
        by = position[1] - bubble_h - 20
        
        # Draw cloudy bubbles leading to speaker
        for i, (cx, cy, cr) in enumerate([
            (position[0] + 50, position[1] + 30, 20),
            (position[0] + 80, position[1] + 60, 15),
            (position[0] + 100, position[1] + 90, 10),
        ]):
            draw.ellipse(
                [cx - cr, cy - cr, cx + cr, cy + cr],
                fill=self.bg_color,
                outline=self.border_color,
                width=2
            )
        
        # Main bubble (rounded)
        draw.rectangle(
            [bx - 3, by - 3,
             bx + bubble_w + 3, by + bubble_h + 3],
            outline=self.border_color,
            width=2
        )
        draw.rectangle(
            [bx, by, bx + bubble_w, by + bubble_h],
            fill=self.bg_color
        )
        
        # Draw text
        draw.text(
            (bx + pad_x, by + pad_y),
            text,
            fill=self.text_color,
            font=self.font
        )
        
        return frame
    
    def render_narration(
        self,
        frame: Image.Image,
        text: str,
        position: Tuple[int, int] = (960, 950),
        font_size: int = 36
    ) -> Image.Image:
        """Render narration text at bottom."""
        draw = ImageDraw.Draw(frame)
        
        font = self._load_font(font_size)
        
        # Get text size
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        
        # Center at position
        x = position[0] - text_w // 2
        
        # Background bar
        bar_pad = 20
        draw.rectangle(
            [x - bar_pad, position[1] - bar_pad,
             x + text_w + bar_pad, position[1] + bar_pad + 30],
            fill=(0, 0, 0),
            outline=(100, 100, 100),
            width=1
        )
        
        # Text
        draw.text(
            (x, position[1]),
            text,
            fill=(255, 255, 255),
            font=font
        )
        
        return frame
    
    def render_sign(
        self,
        frame: Image.Image,
        text: str,
        position: Tuple[int, int] = (960, 500),
        bg_color: Tuple[int, int, int] = (255, 248, 220)
    ) -> Image.Image:
        """Render a sign/placard."""
        draw = ImageDraw.Draw(frame)
        
        font = self._load_font(32)
        
        # Get text size
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        
        pad = 30
        sign_w = text_w + pad * 2
        sign_h = text_h + pad * 2
        
        x = position[0] - sign_w // 2
        y = position[1] - sign_h // 2
        
        # Sign background
        draw.rectangle(
            [x - 5, y - 5,
             x + sign_w + 5, y + sign_h + 5],
            outline=(100, 70, 30),
            width=3
        )
        draw.rectangle(
            [x, y, x + sign_w, y + sign_h],
            fill=bg_color
        )
        
        # Text
        draw.text(
            (x + pad, y + pad),
            text,
            fill=(30, 30, 30),
            font=font
        )
        
        return frame
    
    def render(
        self,
        frame: Image.Image,
        dialogue: Dialogue
    ) -> Image.Image:
        """Render dialogue based on type."""
        
        if dialogue.type == DialogueType.SPEECH:
            pos = dialogue.position or (960, 780)
            return self.render_speech_bubble(frame, dialogue.text, pos, dialogue.speaker)
        
        elif dialogue.type == DialogueType.THOUGHT:
            pos = dialogue.position or (760, 730)
            return self.render_thought_bubble(frame, dialogue.text, pos)
        
        elif dialogue.type == DialogueType.NARRATION:
            return self.render_narration(frame, dialogue.text)
        
        elif dialogue.type == DialogueType.SIGN:
            return self.render_sign(frame, dialogue.text)
        
        return frame


# Dialogue presets for common story patterns
def create_dialogue(
    speaker: str,
    text: str,
    dialogue_type: str = "speech"
) -> Dialogue:
    """Create dialogue with type mapping."""
    type_map = {
        "speech": DialogueType.SPEECH,
        "thought": DialogueType.THOUGHT,
        "narration": DialogueType.NARRATION,
        "sign": DialogueType.SIGN,
    }
    
    return Dialogue(
        speaker=speaker,
        text=text,
        type=type_map.get(dialogue_type, DialogueType.SPEECH)
    )