import json, pathlib, sys
raw = pathlib.Path(sys.argv[1]).read_bytes()
parsed = json.loads(raw)
original = parsed["source"]
replacement = "source/priors-official-effective.just"
if not isinstance(original, str) or not original.startswith("/"):
    raise ValueError("Expected this captured dump's absolute source location")
needle = json.dumps(original, separators=(",", ":")).encode()
if raw.count(needle) != 1:
    raise ValueError("Source location must have one unambiguous encoded occurrence")
derived = raw.replace(needle, json.dumps(replacement).encode(), 1)
expected = dict(parsed)
expected["source"] = replacement
if json.loads(derived) != expected:
    raise ValueError("Only /source may change")
with pathlib.Path(sys.argv[2]).open("xb") as output:
    output.write(derived)
