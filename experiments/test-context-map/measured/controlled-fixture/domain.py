"""Original controlled fixture: pure arithmetic, no external data or I/O."""
BASE = 10

def total(values):
    return sum(values)

def classify(value):
    if value < 0:
        return "negative"
    return "nonnegative"

def deliberately_unobserved(value):
    return value * 2

def deliberately_excluded(value):  # pragma: no cover
    return value - 1
