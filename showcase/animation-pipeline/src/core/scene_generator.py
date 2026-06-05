"""
Core scene generator for animation pipeline.
Handles scene creation, segment building, and video concatenation.
"""

import os
import subprocess
import json
import hashlib
import random
from pathlib import Path
from typing import List, Optional, Dict, Any
from dataclasses import dataclass, field
import logging

logger = logging.getLogger(__name__)


@dataclass
class AnimationSegment:
    """Represents a single animation segment (5-10 seconds)."""
    scene_name: str
    duration: float = 5.0  # seconds
    output_path: Optional[str] = None
    scene_config: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if self.output_path is None:
            self.output_path = f"segment_{self.scene_name}.mp4"


@dataclass
class AnimationProject:
    """Complete animation project with multiple segments."""
    name: str
    segments: List[AnimationSegment] = field(default_factory=list)
    output_dir: str = "./output"
    final_video: Optional[str] = None
    fps: int = 30
    resolution: tuple = (1920, 1080)
    
    def __post_init__(self):
        if self.final_video is None:
            self.final_video = f"{self.name}_final.mp4"
    
    def add_segment(self, segment: AnimationSegment):
        """Add a segment to the project."""
        self.segments.append(segment)
    
    def get_segment_files(self) -> List[str]:
        """Get list of segment output paths."""
        return [seg.output_path for seg in self.segments if seg.output_path]


class SceneGenerator:
    """Generates animation scenes using Manim."""
    
    def __init__(self, project_dir: str = "."):
        self.project_dir = Path(project_dir)
        self.output_dir = self.project_dir / "output"
        self.output_dir.mkdir(exist_ok=True)
        
        # Set random seed for reproducibility
        random.seed(42)
        
    def generate_scene_code(self, scene_config: Dict[str, Any]) -> str:
        """Generate Manim Python code from scene configuration."""
        scene_type = scene_config.get("type", "simple")
        
        code_lines = [
            "from manim import *",
            "",
            f"class {scene_config['name']}(Scene):",
            "    def construct(self):",
        ]
        
        # Add scene elements based on type
        if scene_type == "text":
            text = scene_config.get("text", "Hello World")
            code_lines.append(f'        text = Text("{text}")')
            code_lines.append("        self.play(Write(text))")
            
        elif scene_type == "shapes":
            shapes = scene_config.get("shapes", ["circle", "square"])
            for i, shape in enumerate(shapes):
                if shape == "circle":
                    code_lines.append(f"        circle_{i} = Circle()")
                    code_lines.append(f"        self.play(Create(circle_{i}))")
                elif shape == "square":
                    code_lines.append(f"        square_{i} = Square()")
                    code_lines.append(f"        self.play(Create(square_{i}))")
                    
        elif scene_type == "equation":
            equation = scene_config.get("equation", "x^2")
            code_lines.append(f'        eq = MathTex("{equation}")')
            code_lines.append("        self.play(Write(eq))")
            
        elif scene_type == "combined":
            elements = scene_config.get("elements", [])
            for i, elem in enumerate(elements):
                if elem["type"] == "text":
                    code_lines.append(f'        obj{i} = Text("{elem["content"]}")')
                elif elem["type"] == "shape":
                    code_lines.append(f"        obj{i} = {elem['shape'].capitalize()}()")
                code_lines.append(f"        self.play(FadeIn(obj{i}))")
        
        # Add wait for duration
        duration = scene_config.get("duration", 2)
        code_lines.append(f"        self.wait({duration})")
        
        return "\n".join(code_lines)
    
    def render_segment(self, segment: AnimationSegment, quality: str = "low_quality") -> bool:
        """Render a single animation segment."""
        output_file = self.output_dir / segment.output_path
        
        # Generate scene code
        scene_code = self.generate_scene_code({
            "name": segment.scene_name,
            "type": segment.scene_config.get("type", "text"),
            "text": segment.scene_config.get("text", ""),
            "shapes": segment.scene_config.get("shapes", []),
            "equation": segment.scene_config.get("equation", ""),
            "elements": segment.scene_config.get("elements", []),
            "duration": segment.duration - 0.5,  # Account for wait time
        })
        
        # Write scene file
        scene_file = self.project_dir / f"{segment.scene_name}.py"
        scene_file.write_text(scene_code)
        
        # Run Manim
        cmd = [
            "manim",
            str(scene_file),
            segment.scene_name,
            "-ql",  # Low quality for speed
            "--output_file", str(output_file.with_suffix("")),
            "--output_dir", str(self.output_dir),
        ]
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if result.returncode == 0:
                logger.info(f"Rendered: {segment.output_path}")
                return True
            else:
                logger.error(f"Render failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error(f"Timeout rendering {segment.scene_name}")
            return False
        except FileNotFoundError:
            logger.error("Manim not installed")
            return False


class VideoConcatenator:
    """Concatenates video segments using FFmpeg."""
    
    def __init__(self, output_dir: str = "./output"):
        self.output_dir = Path(output_dir)
    
    def concat_segments(
        self, 
        segment_files: List[str], 
        output_file: str,
        fade_transitions: bool = True
    ) -> bool:
        """Concatenate multiple video segments."""
        if not segment_files:
            logger.error("No segments to concatenate")
            return False
            
        # Create concat list file
        concat_list = self.output_dir / "concat_list.txt"
        
        with open(concat_list, "w") as f:
            for seg in segment_files:
                f.write(f"file '{seg}'\n")
        
        # Run FFmpeg concat
        output_path = self.output_dir / output_file
        cmd = [
            "ffmpeg",
            "-y",  # Overwrite
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_list),
            "-c", "copy",
            str(output_path)
        ]
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=600  # 10 minute timeout
            )
            
            if result.returncode == 0:
                logger.info(f"Concatenated: {output_file}")
                return True
            else:
                logger.error(f"Concat failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("Timeout during concatenation")
            return False
    
    def concat_with_fades(
        self,
        segment_files: List[str],
        output_file: str,
        fade_duration: float = 0.5
    ) -> bool:
        """Concatenate with fade transitions between segments."""
        if len(segment_files) < 2:
            return self.concat_segments(segment_files, output_file, fade_transitions=False)
        
        # Build filter complex for fade transitions
        filter_parts = []
        
        for i, seg in enumerate(segment_files):
            filter_parts.append(f"[{i}:v]")
        
        # Use FFmpeg's concat with fade
        concat_list = self.output_dir / "concat_list.txt"
        
        with open(concat_list, "w") as f:
            for seg in segment_files:
                f.write(f"file '{seg}'\n")
        
        output_path = self.output_dir / output_file
        cmd = [
            "ffmpeg",
            "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_list),
            "-vf", f"fade=t=out:st=0:d={fade_duration}",
            "-c", "copy",
            str(output_path)
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            return result.returncode == 0
        except:
            # Fallback to simple concat
            return self.concat_segments(segment_files, output_file, False)


def hash_config(config: Dict) -> str:
    """Generate deterministic hash for configuration."""
    config_str = json.dumps(config, sort_keys=True)
    return hashlib.md5(config_str.encode()).hexdigest()[:8]


def set_random_seed(seed: int = 42):
    """Set all random seeds for reproducibility."""
    random.seed(seed)
    try:
        import numpy as np
        np.random.seed(seed)
    except ImportError:
        pass


def validate_project(project: AnimationProject) -> List[str]:
    """Validate project configuration."""
    errors = []
    
    if not project.name:
        errors.append("Project name is required")
    
    if not project.segments:
        errors.append("At least one segment is required")
    
    for i, seg in enumerate(project.segments):
        if seg.duration < 1 or seg.duration > 30:
            errors.append(f"Segment {i} duration must be 1-30 seconds")
    
    return errors