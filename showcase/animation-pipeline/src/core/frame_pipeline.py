"""
Frame-based animation generator using Pillow + FFmpeg.
This approach is more stable than Manim for production.
"""

import os
import subprocess
import random
import hashlib
import json
from pathlib import Path
from typing import List, Optional, Dict, Any, Tuple
from dataclasses import dataclass, field
from PIL import Image, ImageDraw, ImageFont
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Color palette for animations (minimal B&W style)
COLORS = {
    "white": (255, 255, 255),
    "black": (0, 0, 0),
    "gray": (128, 128, 128),
    "dark_gray": (64, 64, 64),
    "light_gray": (192, 192, 192),
    "red": (220, 50, 50),
    "blue": (50, 100, 220),
    "green": (50, 180, 80),
}


@dataclass
class FrameConfig:
    """Configuration for frame generation."""
    width: int = 1920
    height: int = 1080
    fps: int = 30
    bg_color: Tuple[int, int, int] = field(default_factory=lambda: (20, 20, 20))
    text_color: Tuple[int, int, int] = field(default_factory=lambda: (255, 255, 255))
    

class FrameGenerator:
    """Generates animation frames using Pillow."""
    
    def __init__(self, config: FrameConfig = None):
        self.config = config or FrameConfig()
        self._set_seed(42)  # Reproducibility
        
    def _set_seed(self, seed: int = 42):
        """Set random seed for reproducibility."""
        random.seed(seed)
        
    def create_frame(
        self,
        frame_num: int,
        elements: List[Dict[str, Any]]
    ) -> Image.Image:
        """Create a single frame with specified elements."""
        img = Image.new("RGB", (self.config.width, self.config.height), self.config.bg_color)
        draw = ImageDraw.Draw(img)
        
        for elem in elements:
            self._draw_element(draw, elem, frame_num)
        
        return img
    
    def _draw_element(self, draw: ImageDraw.Draw, elem: Dict, frame_num: int):
        """Draw a single element on the frame."""
        elem_type = elem.get("type", "text")
        
        if elem_type == "text":
            self._draw_text(draw, elem)
        elif elem_type == "circle":
            self._draw_circle(draw, elem)
        elif elem_type == "rect":
            self._draw_rect(draw, elem)
        elif elem_type == "line":
            self._draw_line(draw, elem)
        elif elem_type == "progress":
            self._draw_progress(draw, elem)
    
    def _draw_text(self, draw: ImageDraw.Draw, elem: Dict):
        """Draw text element."""
        text = elem.get("text", "")
        position = elem.get("position", (100, 100))
        font_size = elem.get("font_size", 48)
        color = elem.get("color", self.config.text_color)
        
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
        
        draw.text(position, text, fill=color, font=font)
    
    def _draw_circle(self, draw: ImageDraw.Draw, elem: Dict):
        """Draw circle element."""
        center = elem.get("center", (960, 540))
        radius = elem.get("radius", 100)
        color = elem.get("color", (255, 255, 255))
        outline = elem.get("outline", None)
        
        draw.ellipse(
            [center[0] - radius, center[1] - radius,
             center[0] + radius, center[1] + radius],
            outline=color,
            width=2
        )
    
    def _draw_rect(self, draw: ImageDraw.Draw, elem: Dict):
        """Draw rectangle element."""
        position = elem.get("position", (100, 100))
        size = elem.get("size", (200, 100))
        color = elem.get("color", (255, 255, 255))
        
        draw.rectangle(
            [position[0], position[1],
             position[0] + size[0], position[1] + size[1]],
            outline=color,
            width=2
        )
    
    def _draw_line(self, draw: ImageDraw.Draw, elem: Dict):
        """Draw line element."""
        start = elem.get("start", (100, 500))
        end = elem.get("end", (1820, 500))
        color = elem.get("color", (255, 255, 255))
        
        draw.line([start, end], fill=color, width=2)
    
    def _draw_progress(self, draw: ImageDraw.Draw, elem: Dict):
        """Draw progress bar."""
        position = elem.get("position", (200, 700))
        width = elem.get("width", 1520)
        height = elem.get("height", 20)
        progress = elem.get("progress", 0.5)  # 0.0 to 1.0
        color = elem.get("color", (100, 200, 255))
        
        # Background
        draw.rectangle(
            [position[0], position[1],
             position[0] + width, position[1] + height],
            outline=color,
            width=1
        )
        # Fill
        fill_width = int(width * progress)
        draw.rectangle(
            [position[0], position[1],
             position[0] + fill_width, position[1] + height],
            fill=color
        )


class AnimationSequence:
    """Manages a sequence of frames for animation."""
    
    def __init__(self, config: FrameConfig = None):
        self.config = config or FrameConfig()
        self.frames: List[Image.Image] = []
        self.frame_generator = FrameGenerator(self.config)
        
    def add_text_frame(
        self,
        text: str,
        duration_frames: int = 30,
        position: Tuple[int, int] = (960, 500),
        font_size: int = 64
    ):
        """Add a text frame sequence."""
        for frame_num in range(duration_frames):
            elements = [{
                "type": "text",
                "text": text,
                "position": position,
                "font_size": font_size,
            }]
            frame = self.frame_generator.create_frame(frame_num, elements)
            self.frames.append(frame)
        
    def add_circle_frame(
        self,
        center: Tuple[int, int],
        radius: int,
        duration_frames: int = 90,
        animate_grow: bool = True
    ):
        """Add a growing circle animation."""
        for frame_num in range(duration_frames):
            current_radius = radius
            if animate_grow:
                current_radius = int(radius * (frame_num / duration_frames))
            
            elements = [{
                "type": "circle",
                "center": center,
                "radius": current_radius,
            }]
            frame = self.frame_generator.create_frame(frame_num, elements)
            self.frames.append(frame)
    
    def add_title_sequence(
        self,
        title: str,
        subtitle: Optional[str] = None,
        duration: int = 150  # 5 seconds at 30fps
    ):
        """Add a title sequence with optional subtitle."""
        for frame_num in range(duration):
            elements = [
                {
                    "type": "text",
                    "text": title,
                    "position": (960, 480),
                    "font_size": 72,
                }
            ]
            
            if subtitle:
                elements.append({
                    "type": "text",
                    "text": subtitle,
                    "position": (960, 580),
                    "font_size": 36,
                    "color": (160, 160, 160),
                })
            
            frame = self.frame_generator.create_frame(frame_num, elements)
            self.frames.append(frame)
    
    def add_section_header(
        self,
        section_name: str,
        position: Tuple[int, int] = (960, 540),
        duration: int = 90
    ):
        """Add a section header."""
        for frame_num in range(duration):
            elements = [{
                "type": "text",
                "text": section_name,
                "position": position,
                "font_size": 56,
            }]
            frame = self.frame_generator.create_frame(frame_num, elements)
            self.frames.append(frame)
    
    def add_progress_indicator(
        self,
        current: int,
        total: int,
        duration: int = 60
    ):
        """Add progress indicator."""
        for frame_num in range(duration):
            progress = current / total
            
            elements = [
                {
                    "type": "text",
                    "text": f"Slide {current} of {total}",
                    "position": (960, 450),
                    "font_size": 36,
                },
                {
                    "type": "progress",
                    "position": (200, 500),
                    "width": 1520,
                    "height": 15,
                    "progress": progress,
                }
            ]
            
            frame = self.frame_generator.create_frame(frame_num, elements)
            self.frames.append(frame)
    
    def add_ending(self, text: str = "Thanks for watching!", duration: int = 150):
        """Add video ending."""
        for frame_num in range(duration):
            elements = [{
                "type": "text",
                "text": text,
                "position": (960, 540),
                "font_size": 64,
            }]
            frame = self.frame_generator.create_frame(frame_num, elements)
            self.frames.append(frame)
    
    def save_frames(self, output_dir: Path, prefix: str = "frame"):
        """Save frames as PNG sequence."""
        output_dir.mkdir(parents=True, exist_ok=True)
        
        frame_paths = []
        for i, frame in enumerate(self.frames):
            path = output_dir / f"{prefix}_{i:04d}.png"
            frame.save(path)
            frame_paths.append(path)
        
        logger.info(f"Saved {len(frame_paths)} frames to {output_dir}")
        return frame_paths
    
    def clear(self):
        """Clear all frames."""
        self.frames.clear()


class VideoEncoder:
    """Encodes frames to video using FFmpeg."""
    
    def __init__(self, output_dir: str = "./output"):
        self.output_dir = Path(output_dir)
        
    def frames_to_video(
        self,
        frame_paths: List[Path],
        output_file: str,
        fps: int = 30,
        codec: str = "libx264",
        preset: str = "medium",
        crf: int = 23
    ) -> Optional[Path]:
        """Convert frames to video using image2 demuxer."""
        if not frame_paths:
            logger.error("No frames provided")
            return None
        
        output_path = self.output_dir / output_file
        
        # Use first frame to get directory
        first_frame = frame_paths[0]
        pattern = str(first_frame.parent / "frame_%04d.png")
        
        # Use image2 demuxer for frame sequences
        cmd = [
            "ffmpeg",
            "-y",  # Overwrite
            "-framerate", str(fps),
            "-i", pattern,
            "-fps_mode", "cfr",
            "-pix_fmt", "yuv420p",
            "-c:v", codec,
            "-preset", preset,
            "-crf", str(crf),
            str(output_path)
        ]
        
        logger.info(f"Encoding video: {output_file}")
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=1200  # 20 min timeout
            )
            
            if result.returncode == 0:
                logger.info(f"Video created: {output_path}")
                return output_path
            else:
                logger.error(f"Encoding failed: {result.stderr}")
                return None
                
        except subprocess.TimeoutExpired:
            logger.error("Video encoding timeout")
            return None
    
    def concat_videos(
        self,
        video_paths: List[Path],
        output_file: str
    ) -> Optional[Path]:
        """Concatenate multiple videos."""
        if not video_paths:
            return None
        
        if len(video_paths) == 1:
            # Just copy
            import shutil
            output_path = self.output_dir / output_file
            shutil.copy(video_paths[0], output_path)
            return output_path
        
        # Create concat list
        concat_list = self.output_dir / "concat_list.txt"
        with open(concat_list, "w") as f:
            for path in video_paths:
                f.write(f"file '{path.as_posix()}'\n")
        
        output_path = self.output_dir / output_file
        
        cmd = [
            "ffmpeg",
            "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_list),
            "-c", "copy",
            str(output_path)
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                return output_path
        except:
            pass
        
        return None


class SimpleAnimationPipeline:
    """Complete pipeline for generating animations."""
    
    def __init__(
        self,
        output_dir: str = "./output",
        fps: int = 30,
        resolution: Tuple[int, int] = (1920, 1080)
    ):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.fps = fps
        self.resolution = resolution
        
        self.frame_config = FrameConfig(
            width=resolution[0],
            height=resolution[1],
            fps=fps
        )
        
        self.sequence = AnimationSequence(self.frame_config)
        self.encoder = VideoEncoder(self.output_dir)
        
    def create_intro(
        self,
        title: str,
        subtitle: str = None,
        duration_sec: float = 5.0
    ):
        """Create intro sequence."""
        frames = int(duration_sec * self.fps)
        self.sequence.add_title_sequence(title, subtitle, frames)
        
    def create_outro(
        self,
        text: str = "Thanks for watching!",
        duration_sec: float = 5.0
    ):
        """Create outro sequence."""
        frames = int(duration_sec * self.fps)
        self.sequence.add_ending(text, frames)
        
    def add_content(
        self,
        text: str,
        duration_sec: float = 3.0,
        font_size: int = 56
    ):
        """Add content text."""
        frames = int(duration_sec * self.fps)
        self.sequence.add_text_frame(
            text,
            frames,
            position=(960, 540),
            font_size=font_size
        )
        
    def render(self, output_file: str = "output.mp4") -> Optional[Path]:
        """Render the complete video."""
        # Save frames temporarily
        frame_paths = self.sequence.save_frames(self.output_dir / "frames_temp", "frame")
        
        # Encode to video
        video_path = self.encoder.frames_to_video(
            frame_paths,
            output_file,
            fps=self.fps
        )
        
        # Cleanup temp frames
        for p in frame_paths:
            p.unlink()
        
        # Remove temp directory if empty
        try:
            (self.output_dir / "frames_temp").rmdir()
        except:
            pass
        
        return video_path
    
    def reset(self):
        """Reset for next video."""
        self.sequence.clear()


def hash_config(config: Dict) -> str:
    """Generate deterministic hash."""
    config_str = json.dumps(config, sort_keys=True)
    return hashlib.md5(config_str.encode()).hexdigest()[:8]


def set_random_seed(seed: int = 42):
    """Set random seed for reproducibility."""
    random.seed(seed)