"""This module intentionally fails at collection, not during a test call."""
raise RuntimeError("DESIGNED collection failure in controlled fixture")
