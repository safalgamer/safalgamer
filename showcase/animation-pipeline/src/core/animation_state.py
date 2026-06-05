"""
Animation State Engine - Core fix.
Proper time-based state system with interpolation.
"""

import math
import random
from enum import Enum
from dataclasses import dataclass, field
from typing import Callable, Optional, Tuple, List


# =============================================================================
# Interpolation Functions (The Ancient Animation Trick)
# =============================================================================

def lerp(a: float, b: float, t: float) -> float:
    """Linear interpolation: a + (b-a) * t"""
    return a + (b - a) * t


def ease_in_out(t: float) -> float:
    """Smooth easing: 3 * t^2 - 2 * t^3"""
    return t * t * (3 - 2 * t)


def ease_out(t: float) -> float:
    """Ease out: 1 - (1-t)^2"""
    return 1 - (1 - t) ** 2


def ease_in(t: float) -> float:
    """Ease in: t^2"""
    return t ** 2


def bounce(t: float) -> float:
    """Bounce easing"""
    if t < 0.5:
        return 4 * t * t * t
    else:
        t = 1 - t
        return 1 - 4 * t * t * t


# =============================================================================
# Animation Curve Types
# =============================================================================

class EasingType(Enum):
    LINEAR = "linear"
    EASE_IN = "ease_in"
    EASE_OUT = "ease_out"
    EASE_IN_OUT = "ease_in_out"
    BOUNCE = "bounce"


def get_easing(easing: EasingType) -> Callable[[float], float]:
    """Get easing function by type."""
    map = {
        EasingType.LINEAR: lambda t: t,
        EasingType.EASE_IN: ease_in,
        EasingType.EASE_OUT: ease_out,
        EasingType.EASE_IN_OUT: ease_in_out,
        EasingType.BOUNCE: bounce,
    }
    return map.get(easing, lerp)


# =============================================================================
# Animation Controllers
# =============================================================================

@dataclass
class PositionKeyframe:
    """A keyframe for position animation."""
    time: float      # When this keyframe happens (seconds)
    x: float         # Target X position
    y: float         # Target Y position
    easing: EasingType = EasingType.EASE_IN_OUT


@dataclass
class MoveController:
    """Controls character movement via keyframes."""
    character_id: str
    keyframes: List[PositionKeyframe] = field(default_factory=list)
    
    def add_keyframe(self, time: float, x: float, y: float, easing: EasingType = EasingType.EASE_IN_OUT):
        self.keyframes.append(PositionKeyframe(time, x, y, easing))
        self.keyframes.sort(key=lambda k: k.time)
    
    def get_position(self, current_time: float) -> Tuple[float, float]:
        """Get interpolated position at current time."""
        if not self.keyframes:
            return (0, 0)
        
        # Before first keyframe - stay at start
        if current_time <= self.keyframes[0].time:
            return (self.keyframes[0].x, self.keyframes[0].y)
        
        # After last keyframe - stay at end
        if current_time >= self.keyframes[-1].time:
            return (self.keyframes[-1].x, self.keyframes[-1].y)
        
        # Find surrounding keyframes
        for i in range(len(self.keyframes) - 1):
            k1 = self.keyframes[i]
            k2 = self.keyframes[i + 1]
            
            if k1.time <= current_time <= k2.time:
                # Interpolate between keyframes
                duration = k2.time - k1.time
                if duration <= 0:
                    return (k2.x, k2.y)
                
                # Normalize time to 0-1
                t = (current_time - k1.time) / duration
                easing_fn = get_easing(k2.easing)
                eased_t = easing_fn(t)
                
                return (lerp(k1.x, k2.x, eased_t), lerp(k1.y, k2.y, eased_t))
        
        return (0, 0)  # Fallback


@dataclass
class StateKeyframe:
    """A keyframe for state change."""
    time: float
    state: str


@dataclass
class StateController:
    """Controls state transitions."""
    character_id: str
    keyframes: List[StateKeyframe] = field(default_factory=list)
    
    def add_keyframe(self, time: float, state: str):
        self.keyframes.append(StateKeyframe(time, state))
        self.keyframes.sort(key=lambda k: k.time)
    
    def get_state(self, current_time: float) -> str:
        """Get state at current time."""
        if not self.keyframes:
            return "idle"
        
        current_state = "idle"
        for kf in self.keyframes:
            if current_time >= kf.time:
                current_state = kf.state
            else:
                break
        
        return current_state


# =============================================================================
# Global Scene State (Persists across frames)
# =============================================================================

@dataclass
class CharacterState:
    """Persistent state for a character across frames."""
    id: str
    x: float = 960
    y: float = 600
    vx: float = 0
    vy: float = 0
    state: str = "idle"
    scale: float = 1.0
    
    # Rendering properties (derived from state)
    flip_x: bool = False


@dataclass
class SceneState:
    """Global scene state - persists across all frames."""
    scene_id: str
    duration: float = 5.0
    
    # Characters and their controllers
    characters: List[CharacterState] = field(default_factory=list)
    move_controllers: List[MoveController] = field(default_factory=list)
    state_controllers: List[StateController] = field(default_factory=list)
    
    # Background state
    background_type: str = "plain"
    
    # Current dialogue
    current_dialogue: str = ""
    dialogue_start: float = 0
    dialogue_duration: float = 3.0
    
    # Narration
    narration: str = ""
    
    # Time tracking
    _current_time: float = 0.0
    
    def get_character(self, char_id: str) -> Optional[CharacterState]:
        for char in self.characters:
            if char.id == char_id:
                return char
        return None
    
    def add_character(self, char_id: str, start_x: float, start_y: float):
        state = CharacterState(id=char_id, x=start_x, y=start_y)
        self.characters.append(state)
        
        # Also create move controller
        move_ctrl = MoveController(char_id)
        move_ctrl.add_keyframe(0, start_x, start_y)
        self.move_controllers.append(move_ctrl)
        
        # State controller
        state_ctrl = StateController(char_id)
        state_ctrl.add_keyframe(0, "idle")
        self.state_controllers.append(state_ctrl)
    
    def move_character(self, char_id: str, time: float, x: float, y: float, easing: EasingType = EasingType.EASE_IN_OUT):
        """Add movement keyframe for character."""
        for mc in self.move_controllers:
            if mc.character_id == char_id:
                mc.add_keyframe(time, x, y, easing)
                return
    
    def change_state(self, char_id: str, time: float, state: str):
        """Add state change keyframe."""
        for sc in self.state_controllers:
            if sc.character_id == char_id:
                sc.add_keyframe(time, state)
                return
    
    def update(self, delta_time: float):
        """Update all controllers for current frame."""
        self._current_time += delta_time
        
        # Update character positions
        for mc in self.move_controllers:
            for char in self.characters:
                if char.id == mc.character_id:
                    x, y = mc.get_position(self._current_time)
                    char.x, char.y = x, y
        
        # Update character states  
        for sc in self.state_controllers:
            for char in self.characters:
                if char.id == sc.character_id:
                    char.state = sc.get_state(self._current_time)
        
        # Update dialogue timing
        if self.current_dialogue:
            elapsed = self._current_time - self.dialogue_start
            if elapsed > self.dialogue_duration:
                self.current_dialogue = ""


# =============================================================================
# Story State (Chains multiple scenes)
# =============================================================================

@dataclass
class StoryState:
    """Global story state."""
    title: str
    total_duration: float
    
    # Scene states
    scenes: List[SceneState] = field(default_factory=list)
    
    # Time
    _current_time: float = 0.0
    _current_scene_index: int = 0
    
    @property
    def current_scene(self) -> Optional[SceneState]:
        if 0 <= self._current_scene_index < len(self.scenes):
            return self.scenes[self._current_scene_index]
        return None
    
    def add_scene(self, scene: SceneState):
        scene.duration = self.calculate_scene_duration(scene)
        self.scenes.append(scene)
        self.total_duration += scene.duration
    
    def calculate_scene_duration(self, scene: SceneState) -> float:
        """Calculate actual duration from keyframes."""
        max_time = scene.duration
        for mc in scene.move_controllers:
            if mc.keyframes:
                last_kf = mc.keyframes[-1]
                max_time = max(max_time, last_kf.time)
        return max_time
    
    def update(self, delta_time: float):
        """Update story state."""
        self._current_time += delta_time
        
        # Check scene transitions
        if self.current_scene:
            if self._current_time >= self.current_scene.duration:
                self._current_time = 0
                self._current_scene_index += 1
                
                if self._current_scene_index < len(self.scenes):
                    self.current_scene._current_time = 0
        # Update current scene
        if self.current_scene:
            self.current_scene.update(delta_time)


# =============================================================================
# Animation Loop (Time-based, NOT frame-based)
# =============================================================================

class AnimationEngine:
    """Main animation engine with proper time-based loop."""
    
    def __init__(self, fps: int = 30):
        self.fps = fps
        self.delta_time = 1.0 / fps
    
    def generate_frame(self, story_state: StoryState) -> dict:
        """Generate a SINGLE frame by reading state.
        
        THIS IS THE KEY FIX:
        - NO movement logic here
        - Pure state visualization
        - Interpolation handled by controllers
        """
        # Get current state
        scene = story_state.current_scene
        
        if not scene:
            return {"end": True}
        
        # Return state snapshot for rendering
        frame_data = {
            "time": story_state._current_time,
            "background": scene.background_type,
            "narration": scene.narration,
            "dialogue": scene.current_dialogue if scene.current_dialogue else None,
            "characters": []
        }
        
        # Snapshot all characters at current state
        for char in scene.characters:
            frame_data["characters"].append({
                "id": char.id,
                "x": char.x,
                "y": char.y,
                "state": char.state,
                "scale": char.scale
            })
        
        return frame_data
    
    def generate_frames(self, story_state: StoryState) -> List[dict]:
        """Generate all frames using proper time loop."""
        frames = []
        
        total_time = 0
        while story_state._current_scene_index < len(story_state.scenes):
            frame = self.generate_frame(story_state)
            
            if "end" in frame:
                break
                
            frames.append(frame)
            
            # TIME-BASED UPDATE (not frame counting!)
            total_time += self.delta_time
            story_state.update(self.delta_time)
            
            # Safety
            if total_time > story_state.total_duration + 10:
                break
        
        return frames


# =============================================================================
# Helper Functions
# =============================================================================

def create_walk_animation(
    story: StoryState,
    scene_index: int,
    char_id: str,
    from_x: float,
    to_x: float,
    start_time: float,
    duration: float,
    easing: EasingType = EasingType.EASE_IN_OUT
):
    """Helper to create walking animation."""
    scene = story.scenes[scene_index]
    
    # Add start position at time 0 if not exists
    scene.move_character(char_id, start_time, from_x, 600)
    
    # Add target position at end time
    scene.move_character(char_id, start_time + duration, to_x, 600, easing)


def create_talk_animation(
    story: StoryState,
    scene_index: int,
    char_id: str,
    text: str,
    start_time: float,
    duration: float
):
    """Helper to create talking dialogue."""
    scene = story.scenes[scene_index]
    scene.current_dialogue = text
    scene.dialogue_start = start_time
    scene.dialogue_duration = duration