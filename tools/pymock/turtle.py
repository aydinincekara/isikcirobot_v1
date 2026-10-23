"""Test için sahte turtle modülü: ekran açmaz, çizilen çizgileri kaydeder ve turtle.done() anında JSON olarak yazar.
Gerçek turtle ile aynı koordinatlar: (0,0) orta, yön 0 = doğu, left saat yönünün tersi."""
import json, math, sys
_segs = []
_events = {"keys": {}, "timers": []}

class Screen:
    def title(self, *a): pass
    def setup(self, *a, **k): pass
    def bgcolor(self, *a): pass
    def tracer(self, *a): pass
    def update(self): pass
    def listen(self): pass
    def onkey(self, f, key): _events["keys"][key] = f
    onkeypress = onkey
    def ontimer(self, f, ms=0): _events["timers"].append(f)
    def mainloop(self): done()

class Turtle:
    def __init__(self, *a, **k):
        self.x = 0.0; self.y = 0.0; self.h = 0.0; self.pen = True; self.c = "black"; self.w = 2
    def shape(self, *a): pass
    def speed(self, *a): pass
    def hideturtle(self): pass
    def showturtle(self): pass
    def shapesize(self, *a, **k): pass
    def write(self, *a, **k): pass
    def clear(self): pass
    def setheading(self, h): self.h = h
    def _move(self, d):
        a = math.radians(self.h)
        nx, ny = self.x + math.cos(a) * d, self.y + math.sin(a) * d
        if self.pen and (abs(nx - self.x) > 1e-9 or abs(ny - self.y) > 1e-9):
            _segs.append([round(self.x, 2), round(self.y, 2), round(nx, 2), round(ny, 2), self.c, self.w])
        self.x, self.y = nx, ny
    def forward(self, d): self._move(float(d))
    fd = forward
    def backward(self, d): self._move(-float(d))
    bk = back = backward
    def left(self, a): self.h += float(a)
    lt = left
    def right(self, a): self.h -= float(a)
    rt = right
    def penup(self): self.pen = False
    pu = up = penup
    def pendown(self): self.pen = True
    pd = down = pendown
    def color(self, *c): self.c = str(c[0])
    pencolor = color
    def pensize(self, w): self.w = max(1, float(w))
    width = pensize
    def goto(self, x, y=None):
        if y is None: x, y = x
        if self.pen: _segs.append([round(self.x, 2), round(self.y, 2), round(float(x), 2), round(float(y), 2), self.c, self.w])
        self.x, self.y = float(x), float(y)
    setpos = setposition = goto
    def setx(self, x): self.goto(x, self.y)
    def sety(self, y): self.goto(self.x, y)
    def xcor(self): return self.x
    def ycor(self): return self.y
    def distance(self, o, y=None):
        if y is not None: return math.hypot(self.x - o, self.y - y)
        return math.hypot(self.x - o.x, self.y - o.y)
    def circle(self, r):
        r = float(r); n = 36; step = 2 * math.pi * abs(r) / n; ang = 360.0 / n * (1 if r >= 0 else -1)
        self.left(ang / 2)
        for i in range(n):
            self._move(step)
            if i < n - 1: self.left(ang)
        self.left(ang / 2)

def done():
    print("__SEGS__" + json.dumps(_segs))
    sys.exit(0)
mainloop = done
