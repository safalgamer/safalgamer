#!/usr/bin/env python
"""
Run script for animation pipeline.
Generates long-form YouTube animations using the advanced pipeline.
"""

import sys
import os
import json
import argparse
import logging
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent))

from src.core.frame_pipeline import VideoEncoder, set_random_seed
from src.core.advanced_pipeline import (
    AnimationPipeline,
    VideoConfig,
    SceneBuilder,
    set_random_seed as advanced_set_seed
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


DEFAULT_CONFIG = {
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "background": [15, 15, 15],
    "text": [255, 255, 255],
    "accent": [100, 150, 255],
}


def generate_video(
    config: dict,
    output_file: str = "output.mp4",
    output_dir: str = "./output"
) -> Path:
    """Generate video from configuration."""
    
    # Set seeds for reproducibility
    set_random_seed(42)
    advanced_set_seed(42)
    
    # Create config
    video_config = VideoConfig(
        width=config.get("width", 1920),
        height=config.get("height", 1080),
        fps=config.get("fps", 30),
        bg_color=tuple(config.get("background", [15, 15, 15])),
        text_color=tuple(config.get("text", [255, 255, 255])),
        accent_color=tuple(config.get("accent", [100, 150, 255])),
    )
    
    pipeline = AnimationPipeline(output_dir, video_config)
    
    logger.info("Building video sequence...")
    
    # Add intro
    if "intro" in config:
        intro = config["intro"]
        pipeline.add_title(
            intro.get("title", "Video Title"),
            intro.get("subtitle"),
            intro.get("duration", 5.0)
        )
    
    # Add sections
    for section in config.get("sections", []):
        section_type = section.get("type", "content")
        
        if section_type == "title":
            pipeline.add_title(
                section.get("title"),
                section.get("subtitle"),
                section.get("duration", 3.0)
            )
        elif section_type == "content":
            pipeline.add_content(
                section.get("text"),
                section.get("duration", 3.0),
                section.get("font_size", 56)
            )
        elif section_type == "list":
            pipeline.add_list(
                section.get("items", []),
                section.get("duration", 4.0)
            )
        elif section_type == "section":
            pipeline.add_section(
                section.get("name"),
                section.get("duration", 2.0)
            )
    
    # Add outro
    if "outro" in config:
        outro = config["outro"]
        pipeline.add_ending(
            outro.get("message", "Thanks for watching!"),
            outro.get("duration", 5.0)
        )
    
    # Render
    logger.info(f"Total duration: {pipeline.get_duration():.1f}s")
    logger.info(f"Total frames: {len(pipeline.frames)}")
    
    logger.info("Rendering video...")
    video_path = pipeline.render(output_file)
    
    if video_path:
        logger.info(f"Generated: {video_path}")
    else:
        logger.error("Video generation failed")
    
    return video_path


def generate_simple_video(
    output_dir: str = "./output",
    fps: int = 30
) -> Path:
    """Generate a simple example video."""
    
    config = {
        "width": 1920,
        "height": 1080,
        "fps": fps,
        "intro": {
            "title": "Animation Pipeline",
            "subtitle": "Long-form Video Automation System",
            "duration": 5.0
        },
        "sections": [
            {
                "type": "content",
                "text": "This system generates 2D animations",
                "duration": 3.0
            },
            {
                "type": "content",
                "text": "It works fully offline",
                "duration": 3.0
            },
            {
                "type": "content",
                "text": "No flickering or randomness",
                "duration": 3.0
            },
            {
                "type": "list",
                "items": [
                    "Frame-based rendering",
                    "FFmpeg encoding",
                    "CLI interface"
                ],
                "duration": 4.0
            }
        ],
        "outro": {
            "message": "Thanks for watching!",
            "duration": 5.0
        }
    }
    
    return generate_video(config, "simple_output.mp4", output_dir)


def generate_long_video(
    slides: int = 10,
    output_dir: str = "./output",
    fps: int = 30
) -> Path:
    """Generate a longer video with many slides."""
    
    config = {
        "width": 1920,
        "height": 1080,
        "fps": fps,
        "intro": {
            "title": "Long-form Video Demo",
            "subtitle": f"{slides} Content Slides",
            "duration": 5.0
        },
        "sections": [
            {
                "type": "content",
                "text": f"Slide {i + 1}: Content Here",
                "duration": 3.0,
                "font_size": 48
            }
            for i in range(slides)
        ],
        "outro": {
            "message": "Thanks for watching!",
            "duration": 5.0
        }
    }
    
    return generate_video(config, "long_output.mp4", output_dir)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Animation Pipeline Runner"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Simple video
    simple_parser = subparsers.add_parser("simple", help="Generate simple video")
    simple_parser.add_argument("-d", "--dir", default="./output")
    simple_parser.add_argument("--fps", type=int, default=30)
    
    # Long video
    long_parser = subparsers.add_parser("long", help="Generate long video")
    long_parser.add_argument("-n", "--slides", type=int, default=10)
    long_parser.add_argument("-d", "--dir", default="./output")
    long_parser.add_argument("--fps", type=int, default=30)
    
    # Custom (JSON config)
    custom_parser = subparsers.add_parser("custom", help="Generate from JSON config")
    custom_parser.add_argument("config_file")
    custom_parser.add_argument("-o", "--output", default="output.mp4")
    custom_parser.add_argument("-d", "--dir", default="./output")
    
    args = parser.parse_args()
    
    if args.command == "simple":
        video_path = generate_simple_video(args.dir, args.fps)
        if video_path:
            print(f"Success: {video_path}")
            return 0
        return 1
        
    elif args.command == "long":
        video_path = generate_long_video(args.slides, args.dir, args.fps)
        if video_path:
            print(f"Success: {video_path}")
            return 0
        return 1
        
    elif args.command == "custom":
        with open(args.config_file) as f:
            config = json.load(f)
        
        video_path = generate_video(config, args.output, args.dir)
        if video_path:
            print(f"Success: {video_path}")
            return 0
        return 1
    
    else:
        parser.print_help()
        
        print("\n=== Example Usage ===")
        print("python run.py simple --dir ./output")
        print("python run.py long -n 20 --dir ./output")
        
        print("\n=== JSON Config Example ===")
        example = {
            "intro": {
                "title": "My Video",
                "subtitle": "Subtitle",
                "duration": 5.0
            },
            "sections": [
                {"type": "content", "text": "Slide 1", "duration": 3.0},
                {"type": "content", "text": "Slide 2", "duration": 3.0},
            ],
            "outro": {"message": "Thanks!", "duration": 5.0}
        }
        print(json.dumps(example, indent=2))
        
        return 0


if __name__ == "__main__":
    sys.exit(main())