"""
Manim renderer wrapper for the animation pipeline.
"""

import subprocess
import os
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class RenderConfig:
    """Configuration for rendering."""
    quality: str = "low_quality"  # low_quality, medium_quality, high_quality
    fps: int = 30
    width: int = 1920
    height: int = 1080
    background_color: str = "#000000"
    output_format: str = "mp4"
    
    @property
    def resolution(self) -> str:
        return f"{self.width}x{self.height}"


class ManimRenderer:
    """Wrapper around Manim for rendering animations."""
    
    def __init__(self, config: Optional[RenderConfig] = None):
        self.config = config or RenderConfig()
        self._check_manim()
    
    def _check_manim(self) -> bool:
        """Check if Manim is installed."""
        try:
            result = subprocess.run(
                ["manim", "--version"],
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except FileNotFoundError:
            logger.error("Manim not found. Install with: pip install manim")
            return False
    
    def render_scene(
        self,
        scene_file: Path,
        scene_name: str,
        output_dir: Path,
        quality: Optional[str] = None
    ) -> Optional[Path]:
        """Render a single scene."""
        quality = quality or self.config.quality
        
        # Quality flags
        quality_flags = {
            "low_quality": ["-ql"],
            "medium_quality": ["-qm"],
            "high_quality": ["-qh"],
        }
        
        flags = quality_flags.get(quality, ["-ql"])
        
        # Build command
        cmd = [
            "manim",
            str(scene_file),
            scene_name,
            *flags,
            "--output_dir", str(output_dir),
            "-o", scene_name,  # Output filename
        ]
        
        logger.info(f"Rendering: {scene_name}")
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=600  # 10 minute max
            )
            
            if result.returncode == 0:
                # Find output file
                output_pattern = f"{scene_name}*.mp4"
                files = list(output_dir.glob(output_pattern))
                
                if files:
                    return files[0]
                    
            logger.error(f"Render failed: {result.stderr}")
            return None
            
        except subprocess.TimeoutExpired:
            logger.error(f"Timeout rendering {scene_name}")
            return None
    
    def render_batch(
        self,
        scene_configs: List[Dict[str, Any]],
        output_dir: Path,
    ) -> List[Path]:
        """Render multiple scenes."""
        outputs = []
        
        for config in scene_configs:
            scene_file = config.get("file")
            scene_name = config.get("name", "")
            
            if scene_file and scene_name:
                output = self.render_scene(
                    Path(scene_file),
                    scene_name,
                    output_dir
                )
                if output:
                    outputs.append(output)
        
        return outputs


def get_quality_settings(quality: str) -> Dict[str, Any]:
    """Get quality settings for rendering."""
    settings = {
        "low_quality": {
            "fps": 15,
            "width": 854,
            "height": 480,
        },
        "medium_quality": {
            "fps": 30,
            "width": 1280,
            "height": 720,
        },
        "high_quality": {
            "fps": 60,
            "width": 1920,
            "height": 1080,
        },
    }
    return settings.get(quality, settings["low_quality"])


def test_manim() -> bool:
    """Test Manim installation."""
    try:
        result = subprocess.run(
            ["manim", "--version"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            version = result.stdout.strip()
            logger.info(f"Manim version: {version}")
            return True
    except FileNotFoundError:
        pass
    
    logger.error("Manim not properly installed")
    return False