# Manim-based animation templates
# Reusable scene patterns for YouTube automation

from manim import *

# Basic Text Animations


class IntroductionScene(Scene):
    """Simple text introduction scene."""
    
    def construct(self):
        text = self.get_text()
        self.play(Write(text), run_time=2)
        self.wait(2)
    
    def get_text(self):
        return Text("Welcome", font_size=48)


class TitleScene(Scene):
    """Title with subtitle."""
    
    def construct(self):
        title = Text("Animation Title", font_size=64)
        subtitle = Text("Subtitle goes here", font_size=36)
        subtitle.next_to(title, DOWN)
        
        self.play(Write(title), run_time=2)
        self.play(Write(subtitle), run_time=1.5)
        self.wait(2)


class ListScene(Scene):
    """Animated list with bullets."""
    
    def construct(self):
        items = ["Item 1", "Item 2", "Item 3"]
        
        for item in items:
            text = Text(f"• {item}")
            self.play(Write(text), run_time=0.8)
            self.wait(0.3)
        
        self.wait(2)


# Shape Animations


class CircleAnimation(Scene):
    """Growing circle animation."""
    
    def construct(self):
        circle = Circle()
        self.play(GrowFromCenter(circle), run_time=2)
        self.wait(1)


class SquareAnimation(Scene):
    """Rotating square animation."""
    
    def construct(self):
        square = Square()
        self.play(Rotate(square, TAU), run_time=3)
        self.wait(1)


class ShapeSequence(Scene):
    """Multiple shapes appearing in sequence."""
    
    def construct(self):
        shapes = [Circle(), Square(), Triangle()]
        
        for shape in shapes:
            self.play(GrowFromCenter(shape), run_time=1)
            self.wait(0.5)
            self.remove(shape)
        
        self.wait(1)


# Math Animations


class EquationScene(Scene):
    """Simple equation display."""
    
    def construct(self):
        eq = MathTex(r"E = mc^2")
        self.play(Write(eq), run_time=2)
        self.wait(3)


class LatexScene(Scene):
    """Complex LaTeX rendering."""
    
    def construct(self):
        formulas = [
            r"\frac{d}{dx}e^x = e^x",
            r"\int x^2 dx = \frac{x^3}{3}",
            r"\sum_{i=1}^{n} i = \frac{n(n+1)}{2}"
        ]
        
        for formula in formulas:
            eq = MathTex(formula)
            self.play(Write(eq), run_time=1.5)
            self.wait(1.5)
            self.remove(eq)
        
        self.wait(1)


class GraphScene(Scene):
    """Simple graph animation."""
    
    def construct(self):
        axes = Axes(
            x_range=[-3, 3],
            y_range=[-3, 3],
        )
        graph = axes.plot(lambda x: x**2)
        
        self.play(Create(axes), run_time=1)
        self.play(Create(graph), run_time=2)
        self.wait(2)


# Combined Scenes


class TitleWithShapes(Scene):
    """Title with decorative shapes."""
    
    def construct(self):
        title = Text("Title", font_size=56)
        
        circles = VGroup(*[Circle() for _ in range(3)])
        circles.arrange(RIGHT, buff=0.5)
        circles.next_to(title, DOWN)
        
        self.play(Write(title), run_time=1.5)
        self.play(LaggedStartFromCenter(circles), run_time=2)
        self.wait(2)


class FadeSequence(Scene):
    """Multiple elements fading in sequence."""
    
    def construct(self):
        elements = VGroup(
            Text("First"),
            Text("Second"),
            Text("Third")
        )
        elements.arrange(DOWN, buff=1)
        
        for elem in elements:
            self.play(FadeIn(elem, scale=0.8), run_time=0.8)
            self.wait(0.3)
        
        self.wait(2)


# Video Scene Templates


class VideoIntro(Scene):
    """YouTube video intro template."""
    
    def construct(self):
        title = Text("Video Title", font_size=60)
        subtitle = Text("Subtitle", font_size=36, color=GRAY)
        subtitle.next_to(title, DOWN)
        
        self.play(
            Write(title),
            Write(subtitle),
            run_time=2
        )
        self.wait(3)


class VideoOutro(Scene):
    """YouTube video outro template."""
    
    def construct(self):
        thanks = Text("Thanks for watching!", font_size=48)
        subscribe = Text("Subscribe!", font_size=36, color=RED)
        subscribe.next_to(thanks, DOWN)
        
        self.play(
            Write(thanks),
            Write(subscribe),
            run_time=2
        )
        self.wait(3)


class SectionMarker(Scene):
    """Section break marker."""
    
    def construct(self):
        section = Text("Section Name", font_size=48)
        self.play(Write(section), run_time=1.5)
        self.wait(2)