"""
Advanced animation pipeline for long-form YouTube videos.
Includes transitions, effects, and template system.
"""

import random
import json
from pathlib import Path
from typing import List, Optional, Dict, Any, Tuple, Callable
from dataclasses import dataclass, field
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import logging

logger = logging.getLogger(__name__)


# ============================================================================
# Configuration
# ============================================================================

@dataclass
class VideoConfig:
    """Configuration for video generation."""
    width: int = 1920
    height: int = 1080
    fps: int = 30
    bg_color: Tuple[int, int, int] = (15, 15, 15)  # Dark background
    text_color: Tuple[int, int, int] = (255, 255, 255)
    accent_color: Tuple[int, int, int] = (100, 150, 255)
    font_path: str = "arial.ttf"  # Will fallback to default
    
    @property
    def center(self) -> Tuple[int, int]:
        return (self.width // 2, self.height // 2)


@dataclass 
class SceneConfig:
    """Configuration for a scene/segment."""
    duration: float = 5.0  # seconds
    transition: str = "none"  # none, fade, slide, wipe
    transition_duration: float = 0.5
    hold_frames: int = 15  # Frames to hold at end
    
    @property
    def frames(self) -> int:
        return int(self.duration * 30)  # 30 fps assumed


# ============================================================================
# Extended Frame Generator with Effects
# ============================================================================

class EffectFrameGenerator:
    """Enhanced frame generator with animation effects."""
    
    def __init__(self, config: VideoConfig = None):
        self.config = config or VideoConfig()
        self._set_seed(42)
    
    def _set_seed(self, seed: int = 42):
        random.seed(seed)
    
    def _get_font(self, size: int) -> ImageFont.FreeTypeFont:
        try:
            return ImageFont.truetype(self.config.font_path, size)
        except:
            return ImageFont.load_default()
    
    def create_base_frame(self) -> Image.Image:
        """Create a base frame with background."""
        return Image.new("RGB", (self.config.width, self.config.height), self.config.bg_color)
    
    # -------------------------------------------------------------------------
    # Text Rendering
    # -------------------------------------------------------------------------
    
    def render_text(
        self,
        frame: Image.Image,
        text: str,
        position: Tuple[int, int] = None,
        font_size: int = 48,
        color: Tuple[int, int, int] = None,
        anchor: str = "mm"  # middle-middle
    ) -> Image.Image:
        """Render text on frame."""
        if position is None:
            position = self.config.center
        
        color = color or self.config.text_color
        font = self._get_font(font_size)
        
        draw = ImageDraw.Draw(frame)
        
        # Get textbbox for centering
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Adjust position based on anchor
        if anchor == "mm":  # middle-middle
            x = position[0] - text_width // 2
            y = position[1] - text_height // 2
        else:
            x = position[0]
            y = position[1]
        
        draw.text((x, y), text, fill=color, font=font)
        return frame
    
    def render_centered_text(
        self,
        frame: Image.Image,
        text: str,
        font_size: int = 64,
        y_offset: int = 0,
        color: Tuple[int, int, int] = None
    ) -> Image.Image:
        """Render text centered on frame."""
        return self.render_text(
            frame, text,
            position=(self.config.center[0], self.config.center[1] + y_offset),
            font_size=font_size,
            color=color,
            anchor="mm"
        )
    
    def render_subtitle(
        self,
        frame: Image.Image,
        text: str,
        font_size: int = 36,
        y_offset: int = 60
    ) -> Image.Image:
        """Render subtitle with smaller font."""
        return self.render_centered_text(
            frame, text,
            font_size=font_size,
            y_offset=y_offset,
            color=(170, 170, 170)
        )
    
    # -------------------------------------------------------------------------
    # Shapes
    # -------------------------------------------------------------------------
    
    def render_circle(
        self,
        frame: Image.Image,
        center: Tuple[int, int],
        radius: int,
        color: Tuple[int, int, int] = None,
        fill: bool = False
    ) -> Image.Image:
        """Render circle."""
        color = color or self.config.text_color
        draw = ImageDraw.Draw(frame)
        
        bbox = [
            center[0] - radius, center[1] - radius,
            center[0] + radius, center[1] + radius
        ]
        
        if fill:
            draw.ellipse(bbox, fill=color)
        else:
            draw.ellipse(bbox, outline=color, width=3)
        
        return frame
    
    def render_rectangle(
        self,
        frame: Image.Image,
        position: Tuple[int, int],
        size: Tuple[int, int],
        color: Tuple[int, int, int] = None
    ) -> Image.Image:
        """Render rectangle."""
        color = color or self.config.text_color
        draw = ImageDraw.Draw(frame)
        
        draw.rectangle([
            position[0], position[1],
            position[0] + size[0], position[1] + size[1]
        ], outline=color, width=3)
        
        return frame
    
    def render_line(
        self,
        frame: Image.Image,
        start: Tuple[int, int],
        end: Tuple[int, int],
        color: Tuple[int, int, int] = None,
        width: int = 2
    ) -> Image.Image:
        """Render line."""
        color = color or self.config.text_color
        draw = ImageDraw.Draw(frame)
        draw.line([start, end], fill=color, width=width)
        return frame
    
    def render_progress_bar(
        self,
        frame: Image.Image,
        progress: float,  # 0.0 to 1.0
        width: int = 800,
        height: int = 8,
        position: Tuple[int, int] = None
    ) -> Image.Image:
        """Render progress bar."""
        if position is None:
            position = (self.config.width // 2 - width // 2, self.config.height - 100)
        
        draw = ImageDraw.Draw(frame)
        
        # Background
        draw.rectangle([
            position[0], position[1],
            position[0] + width, position[1] + height
        ], outline=self.config.text_color, width=1)
        
        # Fill
        fill_width = int(width * min(max(progress, 0), 1))
        if fill_width > 0:
            draw.rectangle([
                position[0], position[1],
                position[0] + fill_width, position[1] + height
            ], fill=self.config.accent_color)
        
        return frame
    
    # -------------------------------------------------------------------------
    # Animation Effects
    # -------------------------------------------------------------------------
    
    def apply_fade(
        self,
        frame: Image.Image,
        alpha: float  # 0.0 = transparent, 1.0 = opaque
    ) -> Image.Image:
        """Apply fade effect."""
        if alpha >= 1.0:
            return frame
        
        # Create overlay
        overlay = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        overlay.paste(frame, (0, 0))
        
        # Apply alpha
        if alpha < 1.0:
            # Use blend
            return Image.blend(
                Image.new("RGB", frame.size, self.config.bg_color),
                frame,
                alpha
            )
        return frame
    
    def apply_blur(
        self,
        frame: Image.Image,
        radius: float = 2.0
    ) -> Image.Image:
        """Apply blur effect."""
        return frame.filter(ImageFilter.GaussianBlur(radius))


# ============================================================================
# Scene Builders
# ============================================================================

class SceneBuilder:
    """Build individual animation scenes."""
    
    def __init__(self, config: VideoConfig = None):
        self.config = config or VideoConfig()
        self.generator = EffectFrameGenerator(self.config)
    
    def build_title_scene(
        self,
        title: str,
        subtitle: str = None,
        duration: float = 5.0
    ) -> List[Image.Image]:
        """Build title scene."""
        num_frames = int(duration * self.config.fps)
        frames = []
        
        for i in range(num_frames):
            frame = self.generator.create_base_frame()
            
            # Render title
            self.generator.render_centered_text(
                frame, title,
                font_size=72,
                y_offset=-20
            )
            
            if subtitle:
                self.generator.render_subtitle(frame, subtitle, y_offset=40)
            
            frames.append(frame)
        
        return frames
    
    def build_content_scene(
        self,
        content: str,
        duration: float = 3.0,
        font_size: int = 56
    ) -> List[Image.Image]:
        """Build content slide."""
        num_frames = int(duration * self.config.fps)
        frames = []
        
        for i in range(num_frames):
            frame = self.generator.create_base_frame()
            self.generator.render_centered_text(
                frame, content,
                font_size=font_size,
                y_offset=0
            )
            frames.append(frame)
        
        return frames
    
    def build_list_scene(
        self,
        items: List[str],
        highlight_index: int = -1,
        duration: float = 4.0
    ) -> List[Image.Image]:
        """Build list scene with highlighting."""
        num_frames = int(duration * self.config.fps)
        frames = []
        
        spacing = 50
        start_y = self.config.center[1] - (len(items) * spacing) // 2
        
        for frame_num in range(num_frames):
            frame = self.generator.create_base_frame()
            
            for i, item in enumerate(items):
                y_pos = start_y + i * spacing
                color = None
                
                # Highlight current item
                if highlight_index >= 0 and frame_num >= len(items) * 10:
                    current_idx = min(
                        (frame_num // 10) % len(items),
                        len(items) - 1
                    )
                    if i == current_idx:
                        color = self.config.accent_color
                
                self.generator.render_text(
                    frame, f"• {item}",
                    position=(self.config.center[0] - 300, y_pos),
                    font_size=36,
                    color=color,
                    anchor="lm"
                )
            
            frames.append(frame)
        
        return frames
    
    def build_ending_scene(
        self,
        message: str = "Thanks for watching!",
        duration: float = 5.0
    ) -> List[Image.Image]:
        """Build ending scene."""
        num_frames = int(duration * self.config.fps)
        frames = []
        
        for i in range(num_frames):
            frame = self.generator.create_base_frame()
            
            self.generator.render_centered_text(
                frame, message,
                font_size=64
            )
            
            frames.append(frame)
        
        return frames
    
    def build_progress_scene(
        self,
        current: int,
        total: int,
        title: str = None,
        duration: float = 2.0
    ) -> List[Image.Image]:
        """Build progress indicator scene."""
        num_frames = int(duration * self.config.fps)
        progress = current / total
        
        frames = []
        
        for i in range(num_frames):
            frame = self.generator.create_base_frame()
            
            if title:
                self.generator.render_centered_text(
                    frame, title,
                    font_size=36,
                    y_offset=-80
                )
            
            # Progress bar
            self.generator.render_progress_bar(
                frame, progress,
                width=600, height=12
            )
            
            # Counter text
            self.generator.render_centered_text(
                frame, f"{current}/{total}",
                font_size=48,
                y_offset=60
            )
            
            frames.append(frame)
        
        return frames


# ============================================================================
# Transitions
# ============================================================================

class TransitionBuilder:
    """Build transition effects between scenes."""
    
    def __init__(self, config: VideoConfig = None):
        self.config = config or VideoConfig()
        self.generator = EffectFrameGenerator(self.config)
    
    def build_crossfade(
        self,
        frames_out: List[Image.Image],
        frames_in: List[Image.Image],
        duration: float = 0.5
    ) -> List[Image.Image]:
        """Build crossfade transition."""
        num_frames = int(duration * self.config.fps)
        transition = []
        
        for i in range(num_frames):
            alpha = i / num_frames
            
            # Create blend frame
            base = frames_out[min(i, len(frames_out) - 1)]
            overlay = frames_in[0]
            
            blended = Image.blend(base, overlay, alpha)
            transition.append(blended)
        
        return transition
    
    def build_wipe(
        self,
        frames_in: List[Image.Image],
        direction: str = "left",
        duration: float = 0.5
    ) -> List[Image.Image]:
        """Build wipe transition."""
        num_frames = int(duration * self.config.fps)
        transition = []
        
        width = self.config.width
        height = self.config.height
        
        for i in range(num_frames):
            progress = i / num_frames
            frame = self.generator.create_base_frame()
            draw = ImageDraw.Draw(frame)
            
            if direction == "left":
                wipe_x = int(width * progress)
                frame.paste(frames_in[i], (0, 0))
            elif direction == "fade":
                frame = Image.blend(
                    self.generator.create_base_frame(),
                    frames_in[i],
                    progress
                )
            
            transition.append(frame)
        
        return transition


# ============================================================================
# Video Pipeline
# ============================================================================

class AnimationPipeline:
    """Complete animation pipeline for long-form videos."""
    
    def __init__(
        self,
        output_dir: str = "./output",
        config: VideoConfig = None
    ):
        self.config = config or VideoConfig()
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.scene_builder = SceneBuilder(self.config)
        self.transition_builder = TransitionBuilder(self.config)
        self.encoder = None  # Will be set when we import
        
        self.frames: List[Image.Image] = []
    
    def add_scene(self, scene_frames: List[Image.Image]):
        """Add scene frames to the sequence."""
        self.frames.extend(scene_frames)
    
    def add_title(
        self,
        title: str,
        subtitle: str = None,
        duration: float = 5.0
    ):
        """Add title scene."""
        frames = self.scene_builder.build_title_scene(title, subtitle, duration)
        self.frames.extend(frames)
    
    def add_content(
        self,
        content: str,
        duration: float = 3.0,
        font_size: int = 56
    ):
        """Add content scene."""
        frames = self.scene_builder.build_content_scene(content, duration, font_size)
        self.frames.extend(frames)
    
    def add_list(
        self,
        items: List[str],
        duration: float = 4.0
    ):
        """Add list scene."""
        frames = self.scene_builder.build_list_scene(items, duration=duration)
        self.frames.extend(frames)
    
    def add_section(
        self,
        section_name: str,
        duration: float = 3.0
    ):
        """Add section header."""
        self.add_content(section_name, duration, font_size=48)
    
    def add_ending(
        self,
        message: str = "Thanks for watching!",
        duration: float = 5.0
    ):
        """Add ending scene."""
        frames = self.scene_builder.build_ending_scene(message, duration)
        self.frames.extend(frames)
    
    def add_transition_fade(self, duration: float = 0.5):
        """Add crossfade transition at current position."""
        if len(self.frames) >= 2:
            # Will transition to next scene
            num_frames = int(duration * self.config.fps)
            # Simple fade implementation
            for i in range(num_frames):
                alpha = i / num_frames
                last_frame = self.frames[-1]
                faded = Image.blend(
                    last_frame,
                    self.config.bg_color,
                    alpha
                )
                self.frames.append(faded)
    
    def render(self, output_file: str = "video.mp4") -> Optional[Path]:
        """Render the complete video."""
        if not self.frames:
            logger.error("No frames to render")
            return None
        
        from .frame_pipeline import VideoEncoder
        
        # Save frames
        frames_dir = self.output_dir / "frames_render"
        frames_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Saving {len(self.frames)} frames...")
        
        frame_filenames = []
        for i, frame in enumerate(self.frames):
            filepath = frames_dir / f"frame_{i:05d}.png"
            frame.save(filepath)
            frame_filenames.append(filepath)
        
        # Encode using subprocess directly
        import subprocess
        
        first_frame = frame_filenames[0]
        pattern = str(frames_dir / "frame_%05d.png")
        output_path = self.output_dir / output_file
        
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
            str(output_path)
        ]
        
        logger.info("Encoding video...")
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=1200)
            
            if result.returncode == 0:
                logger.info(f"Video created: {output_path}")
            else:
                logger.error(f"Encoding failed: {result.stderr}")
                output_path = None
        except Exception as e:
            logger.error(f"Encoding error: {e}")
            output_path = None
        
        # Cleanup frames
        for p in frame_filenames:
            p.unlink()
        frames_dir.rmdir()
        
        return output_path
        
        # Cleanup frames
        for p in frame_paths:
            p.unlink()
        frames_dir.rmdir()
        
        return output_path
    
    def get_duration(self) -> float:
        """Get video duration in seconds."""
        return len(self.frames) / self.config.fps
    
    def clear(self):
        """Clear all frames."""
        self.frames.clear()


# ============================================================================
# Helper Functions
# ============================================================================

def set_random_seed(seed: int = 42):
    """Set random seed for reproducibility."""
    random.seed(seed)


def detect_issues(frames: List[Image.Image]) -> List[str]:
    """Detect potential issues in frame sequence."""
    issues = []
    
    if not frames:
        issues.append("No frames in sequence")
        return issues
    
    # Check for consistency
    first_frame = frames[0]
    if first_frame.size != (1920, 1080):
        issues.append(f"Unexpected resolution: {first_frame.size}")
    
    # Check for flickering (consecutive identical frames)
    identical_count = 0
    for i in range(1, len(frames)):
        if frames[i] == frames[i-1]:
            identical_count += 1
    
    if identical_count > len(frames) * 0.9:
        issues.append("High number of identical consecutive frames")
    
    return issues