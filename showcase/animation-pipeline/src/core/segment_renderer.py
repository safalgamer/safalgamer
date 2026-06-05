"""
Segment-based rendering for long videos.
Renders videos in chunks then concatenates, preventing timeouts.
"""

import subprocess
from pathlib import Path
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class SegmentRenderer:
    """Render videos in segments to avoid memory/timeout issues."""
    
    def __init__(
        self,
        output_dir: str = "./output",
        segment_length: int = 300  # 10 seconds at 30fps
    ):
        self.output_dir = Path(output_dir)
        self.segment_length = segment_length  # Max frames per segment
        self.segments_dir = self.output_dir / "segments"
        self.segments_dir.mkdir(parents=True, exist_ok=True)
    
    def render_frames(
        self,
        frames: List,
        segment_index: int,
        fps: int = 30
    ) -> Optional[Path]:
        """Render a segment of frames."""
        import subprocess
        from PIL import Image
        
        segment_dir = self.segments_dir / f"segment_{segment_index:03d}"
        segment_dir.mkdir(parents=True, exist_ok=True)
        
        # Save frames
        frame_paths = []
        for i, frame in enumerate(frames):
            path = segment_dir / f"frame_{i:05d}.png"
            frame.save(path)
            frame_paths.append(path)
        
        # Encode segment
        output_file = self.segments_dir / f"segment_{segment_index:03d}.mp4"
        
        pattern = str(segment_dir / "frame_%05d.png")
        
        cmd = [
            "ffmpeg",
            "-y",
            "-framerate", str(fps),
            "-i", pattern,
            "-fps_mode", "cfr",
            "-pix_fmt", "yuv420p",
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "23",
            str(output_file)
        ]
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=600
            )
            
            if result.returncode == 0:
                # Cleanup frames
                for p in frame_paths:
                    p.unlink()
                segment_dir.rmdir()
                return output_file
            
        except Exception as e:
            logger.error(f"Segment render error: {e}")
        
        return None
    
    def concatenate_segments(
        self,
        segment_files: List[Path],
        output_file: str = "final.mp4"
    ) -> Optional[Path]:
        """Concatenate all segments."""
        if len(segment_files) == 1:
            import shutil
            output_path = self.output_dir / output_file
            shutil.copy(segment_files[0], output_path)
            return output_path
        
        # Create concat list
        concat_list = self.segments_dir / "concat.txt"
        with open(concat_list, "w") as f:
            for seg in segment_files:
                f.write(f"file '{seg.as_posix()}'\n")
        
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
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode == 0:
                return output_path
                
        except Exception as e:
            logger.error(f"Concat error: {e}")
        
        return None
    
    def render_long_video(
        self,
        frames: List,
        output_file: str,
        fps: int = 30
    ) -> Optional[Path]:
        """Render video in segments."""
        num_segments = (len(frames) + self.segment_length - 1) // self.segment_length
        
        logger.info(f"Rendering {num_segments} segments...")
        
        segment_files = []
        
        for i in range(num_segments):
            start = i * self.segment_length
            end = min(start + self.segment_length, len(frames))
            segment_frames = frames[start:end]
            
            logger.info(f"Segment {i+1}/{num_segments} ({len(segment_frames)} frames)")
            
            output = self.render_frames(segment_frames, i, fps)
            if output:
                segment_files.append(output)
        
        if not segment_files:
            return None
        
        logger.info("Concatenating segments...")
        return self.concatenate_segments(segment_files, output_file)


def render_with_segments(
    frames: List,
    output_file: str,
    output_dir: str = "./output",
    segment_length: int = 300,
    fps: int = 30
) -> Optional[Path]:
    """Convenience function for segment-based rendering."""
    renderer = SegmentRenderer(output_dir, segment_length)
    return renderer.render_long_video(frames, output_file, fps)