#!/usr/bin/env python
"""
CLI entry point for animation pipeline.
"""

import sys
import os
import argparse
import logging
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from src.core.frame_pipeline import (
    SimpleAnimationPipeline,
    AnimationSequence,
    FrameConfig,
    VideoEncoder,
    set_random_seed
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def generate_simple_video(
    title: str,
    output_file: str = "output.mp4",
    output_dir: str = "./output",
    duration: int = 5,
    fps: int = 30
) -> Path:
    """Generate a simple title video."""
    set_random_seed(42)  # Reproducibility
    
    pipeline = SimpleAnimationPipeline(
        output_dir=output_dir,
        fps=fps,
        resolution=(1920, 1080)
    )
    
    # Create title sequence
    pipeline.create_intro(title, duration_sec=duration)
    
    # Render
    logger.info(f"Generating: {output_file}")
    video_path = pipeline.render(output_file)
    
    if video_path:
        logger.info(f"Generated: {video_path}")
    else:
        logger.error("Video generation failed")
    
    return video_path


def generate_demo_video(
    output_dir: str = "./output",
    fps: int = 30
) -> Path:
    """Generate a demo video with multiple elements."""
    set_random_seed(42)
    
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    config = FrameConfig(
        width=1920,
        height=1080,
        fps=fps,
        bg_color=(20, 20, 20),
        text_color=(255, 255, 255)
    )
    
    sequence = AnimationSequence(config)
    encoder = VideoEncoder(output_dir)
    
    logger.info("Generating demo video frames...")
    
    # Intro title
    sequence.add_title_sequence(
        "Animation Pipeline Demo",
        "Automated 2D Animation System",
        duration=150  # 5 seconds
    )
    
    # Content slides
    sequence.add_text_frame(
        "Slide 1: Introduction",
        duration_frames=90,
        position=(960, 540),
        font_size=56
    )
    
    sequence.add_text_frame(
        "Slide 2: Features",
        duration_frames=90,
        position=(960, 540),
        font_size=56
    )
    
    sequence.add_text_frame(
        "Slide 3: Benefits",
        duration_frames=90,
        position=(960, 540),
        font_size=56
    )
    
    # Outro
    sequence.add_ending("Thanks for watching!", duration=150)
    
    logger.info(f"Total frames: {len(sequence.frames)}")
    
    # Save and encode
    frame_paths = sequence.save_frames(output_path / "frames", "frame")
    video_path = encoder.frames_to_video(frame_paths, "demo_output.mp4", fps=fps)
    
    # Cleanup
    for p in frame_paths:
        p.unlink()
    try:
        (output_path / "frames").rmdir()
    except:
        pass
    
    return video_path


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Animation Pipeline CLI"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Generate command
    gen_parser = subparsers.add_parser("generate", help="Generate video")
    gen_parser.add_argument("title", nargs="?", default="Test Title")
    gen_parser.add_argument("-o", "--output", default="output.mp4")
    gen_parser.add_argument("-d", "--dir", default="./output")
    gen_parser.add_argument("--duration", type=int, default=5)
    gen_parser.add_argument("--fps", type=int, default=30)
    
    # Demo command
    demo_parser = subparsers.add_parser("demo", help="Generate demo video")
    demo_parser.add_argument("-d", "--dir", default="./output")
    demo_parser.add_argument("--fps", type=int, default=30)
    
    # List command
    list_parser = subparsers.add_parser("list", help="List templates")
    
    args = parser.parse_args()
    
    if args.command == "generate":
        video_path = generate_simple_video(
            args.title,
            args.output,
            args.dir,
            args.duration,
            args.fps
        )
        if video_path:
            print(f"Success: {video_path}")
            return 0
        return 1
        
    elif args.command == "demo":
        video_path = generate_demo_video(args.dir, args.fps)
        if video_path:
            print(f"Demo: {video_path}")
            return 0
        return 1
        
    elif args.command == "list":
        print("Available templates:")
        print("  - title: Simple title scene")
        print("  - intro: Video intro")
        print("  - outro: Video outro")
        print("  - content: Content slide")
        print("  - demo: Generate demo video")
        return 0
    
    else:
        parser.print_help()
        return 1


if __name__ == "__main__":
    sys.exit(main())