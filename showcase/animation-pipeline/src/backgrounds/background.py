"""
Background System for Storytelling.
Multiple scene backgrounds for stories.
"""

import random
from enum import Enum
from dataclasses import dataclass
from typing import Tuple, List, Callable
from PIL import Image, ImageDraw


class BackgroundType(Enum):
    """Types of backgrounds."""
    CLASSROOM = "classroom"
    HOME = "home"
    STREET = "street"
    PARK = "park"
    FOREST = "forest"
    BEDROOM = "bedroom"
    KITCHEN = "kitchen"
    OFFICE = "office"
    PLAIN = "plain"


@dataclass
class Background:
    """A scene background."""
    name: str
    width: int = 1920
    height: int = 1080
    primary_color: Tuple[int, int, int] = (200, 230, 255)
    sky_color: Tuple[int, int, int] = (135, 206, 235)
    ground_color: Tuple[int, int, int] = (139, 90, 43)
    
    def create_frame(self) -> Image.Image:
        """Create a base frame with background."""
        return Image.new("RGB", (self.width, self.height), self.primary_color)


class PlainBackground(Background):
    """Simple solid color background."""
    
    def __init__(self, color: Tuple[int, int, int] = (240, 240, 245)):
        super().__init__("Plain", primary_color=color)
    
    def draw(self, frame: Image.Image) -> Image.Image:
        """Plain is already drawn by create_frame"""
        return frame


class ClassroomBackground(Background):
    """Classroom interior."""
    
    def __init__(self):
        super().__init__(
            "Classroom",
            primary_color=(245, 235, 220),  # Wall color
            ground_color=(160, 120, 80)
        )
    
    def draw(self, frame: Image.Image) -> Image.Image:
        """Draw classroom."""
        draw = ImageDraw.Draw(frame)
        w, h = self.width, self.height
        
        # Wall (already set as primary_color)
        
        # Floor
        floor_y = h - 200
        draw.rectangle(
            [0, floor_y, w, h],
            fill=self.ground_color
        )
        
        # Floor pattern
        for x in range(0, w, 80):
            draw.rectangle(
                [x, floor_y, x + 40, h],
                fill=(180, 140, 100)
            )
        
        # Chalkboard
        board_x, board_y = 400, 200
        board_w, board_h = 800, 250
        
        draw.rectangle(
            [board_x, board_y, board_x + board_w, board_y + board_h],
            fill=(30, 80, 30)
        )
        
        # Chalkboard frame
        draw.rectangle(
            [board_x - 10, board_y - 10,
             board_x + board_w + 10, board_y + board_h + 10],
            outline=(100, 70, 40),
            width=5
        )
        
        # Chalk tray
        draw.rectangle(
            [board_x, board_y + board_h,
             board_x + board_w, board_y + board_h + 15],
            fill=(150, 130, 100)
        )
        
        # Windows
        for win_x in [550, 1050, 1450]:
            draw.rectangle(
                [win_x, 150, win_x + 120, 350],
                fill=(180, 210, 240),
                outline=(100, 100, 120),
                width=3
            )
            # Window cross
            draw.line(
                [win_x + 60, 150, win_x + 60, 350],
                fill=(100, 100, 120),
                width=2
            )
            draw.line(
                [win_x, 250, win_x + 120, 250],
                fill=(100, 100, 120),
                width=2
            )
        
        # Clock
        clock_x, clock_y = 1700, 200
        draw.ellipse(
            [clock_x - 40, clock_y - 40,
             clock_x + 40, clock_y + 40],
            fill=(255, 255, 255),
            outline=(50, 50, 50),
            width=3
        )
        draw.line(
            [clock_x, clock_y, clock_x, clock_y - 30],
            fill=(50, 50, 50),
            width=2
        )
        draw.line(
            [clock_x, clock_y, clock_x + 20, clock_y + 10],
            fill=(50, 50, 50),
            width=2
        )
        
        # Door
        draw.rectangle(
            [100, 150, 180, 500],
            fill=(120, 80, 50)
        )
        draw.ellipse(
            [165, 320, 175, 330],
            fill=(200, 200, 100)
        )
        
        # Poster
        draw.rectangle(
            [300, 450, 450, 550],
            fill=(255, 240, 200)
        )
        draw.text(
            (320, 480),
            "ABC",
            fill=(50, 50, 150)
        )
        
        return frame


class HomeBackground(Background):
    """Home interior."""
    
    def __init__(self):
        super().__init__(
            "Home",
            primary_color=(255, 250, 240),
            ground_color=(180, 150, 120)
        )
    
    def draw(self, frame: Image.Image) -> Image.Image:
        """Draw home interior."""
        draw = ImageDraw.Draw(frame)
        w, h = self.width, self.height
        
        # Wall
        
        # Floor
        floor_y = h - 180
        draw.rectangle(
            [0, floor_y, w, h],
            fill=self.ground_color
        )
        
        # Baseboard
        draw.rectangle(
            [0, floor_y - 10, w, floor_y],
            fill=(200, 180, 150)
        )
        
        # Couch
        couch_y = h - 280
        draw.rectangle(
            [200, couch_y, 800, couch_y + 80],
            fill=(100, 150, 200)
        )
        draw.rectangle(
            [200, couch_y, 250, couch_y + 80],
            fill=(80, 130, 180)
        )
        
        # Coffee table
        draw.rectangle(
            [400, h - 120, 600, h - 80],
            fill=(100, 70, 40)
        )
        
        # TV
        draw.rectangle(
            [850, h - 300, 1050, h - 120],
            fill=(40, 40, 40)
        )
        draw.rectangle(
            [860, h - 290, 1040, h - 110],
            fill=(20, 30, 60)
        )
        
        # Window with curtain
        win_x = 1200
        draw.rectangle(
            [win_x, 150, win_x + 200, 400],
            fill=(180, 210, 240),
            outline=(150, 130, 100),
            width=5
        )
        draw.rectangle(
            [win_x - 10, 140, win_x + 10, 410],
            fill=(200, 180, 150)
        )
        draw.rectangle(
            [win_x + 200, 140, win_x + 220, 410],
            fill=(200, 180, 150)
        )
        
        # Picture frame
        draw.rectangle(
            [1500, 250, 1750, 400],
            fill=(250, 250, 240),
            outline=(100, 80, 50),
            width=3
        )
        draw.line(
            [1500, 250, 1750, 400],
            fill=(150, 100, 50),
            width=2
        )
        
        return frame


class ParkBackground(Background):
    """Park/outdoor scene."""
    
    def __init__(self):
        super().__init__(
            "Park",
            primary_color=(135, 206, 235),  # Sky
            ground_color=(100, 180, 80)
        )
    
    def draw(self, frame: Image.Image) -> Image.Image:
        """Draw park scene."""
        draw = ImageDraw.Draw(frame)
        w, h = self.width, self.height
        
        # Sky is primary_color
        
        # Sun
        draw.ellipse(
            [1600, 50, 1700, 150],
            fill=(255, 240, 100)
        )
        
        # Clouds
        for cx, cy in [(300, 100), (700, 80), (1200, 120)]:
            draw.ellipse(
                [cx - 50, cy - 25, cx + 50, cy + 25],
                fill=(255, 255, 255)
            )
            draw.ellipse(
                [cx - 30, cy - 35, cx + 30, cy + 15],
                fill=(255, 255, 255)
            )
        
        # Distant trees
        for tx in range(100, w, 150):
            # Tree trunk
            draw.rectangle(
                [tx, h - 350, tx + 20, h - 180],
                fill=(100, 70, 40)
            )
            # Tree top (circle)
            draw.ellipse(
                [tx - 50, h - 400,
                 tx + 70, h - 280],
                fill=(50, 120, 50)
            )
        
        # Ground/grass
        grass_y = h - 200
        draw.rectangle(
            [0, grass_y, w, h],
            fill=self.ground_color
        )
        
        # Path
        draw.polygon(
            [(w//2, grass_y), (w//2 - 80, h), (w//2 + 80, h)],
            fill=(200, 180, 140)
        )
        
        # Bench
        bench_x = 400
        bench_y = h - 250
        draw.rectangle(
            [bench_x, bench_y, bench_x + 150, bench_y + 10],
            fill=(100, 70, 40)
        )
        draw.rectangle(
            [bench_x, bench_y + 30, bench_x + 150, bench_y + 40],
            fill=(100, 70, 40)
        )
        # Legs
        draw.rectangle(
            [bench_x + 10, bench_y + 40,
             bench_x + 20, bench_y + 60],
            fill=(80, 60, 40)
        )
        draw.rectangle(
            [bench_x + 130, bench_y + 40,
             bench_x + 140, bench_y + 60],
            fill=(80, 60, 40)
        )
        
        # Flowers
        for fx, fy in [(700, h - 180), (900, h - 160), (1300, h - 190)]:
            draw.ellipse(
                [fx - 10, fy - 10, fx + 10, fy + 10],
                fill=(random.randint(200, 255), random.randint(100, 200), random.randint(100, 200))
            )
        
        return frame


class StreetBackground(Background):
    """Street/outdoor scene."""
    
    def __init__(self):
        super().__init__(
            "Street",
            primary_color=(135, 206, 235),
            ground_color=(80, 80, 90)
        )
    
    def draw(self, frame: Image.Image) -> Image.Image:
        """Draw street scene."""
        draw = ImageDraw.Draw(frame)
        w, h = self.width, self.height
        
        # Sky
        
        # Buildings (silhouettes in background)
        building_colors = [(150, 120, 100), (130, 130, 150), (160, 140, 120)]
        
        for i, bx in enumerate([200, 450, 700, 1000, 1300, 1600]):
            bh = random.randint(250, 450)
            bc = building_colors[i % len(building_colors)]
            
            draw.rectangle(
                [bx, h - 200 - bh, bx + 150, h - 200],
                fill=bc
            )
            # Windows
            for wy in range(h - 200 - bh + 20, h - 240, 40):
                for wx in range(bx + 15, bx + 135, 30):
                    draw.rectangle(
                        [wx, wy, wx + 15, wy + 20],
                        fill=(255, 240, 150)
                    )
        
        # Sidewalk
        side_y = h - 250
        draw.rectangle(
            [0, side_y, w, h],
            fill=(180, 180, 180)
        )
        
        # Road
        road_y = h - 120
        draw.rectangle(
            [0, road_y, w, h],
            fill=self.ground_color
        )
        
        # Road lines
        for x in range(0, w, 100):
            draw.rectangle(
                [x, road_y + 40, x + 50, road_y + 50],
                fill=(255, 255, 255)
            )
        
        return frame


# Background factory
def create_background(
    bg_type: BackgroundType,
    width: int = 1920,
    height: int = 1080
) -> Background:
    """Create a background by type."""
    backgrounds = {
        BackgroundType.CLASSROOM: ClassroomBackground,
        BackgroundType.HOME: HomeBackground,
        BackgroundType.PARK: ParkBackground,
        BackgroundType.STREET: StreetBackground,
        BackgroundType.PLAIN: PlainBackground,
    }
    
    bg_class = backgrounds.get(bg_type, PlainBackground)
    bg = bg_class()
    bg.width = width
    bg.height = height
    return bg