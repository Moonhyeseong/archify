import pathlib, re, sys
source = pathlib.Path(sys.argv[1]).read_bytes()
match = re.search(rb'fn priors\(\) \{\s*case\(\s*"([^\"]*)",\s*Module', source)
if match is None or b"\\" in match.group(1):
    raise ValueError("Expected the fixed priors Rust literal without escape sequences")
with pathlib.Path(sys.argv[2]).open("xb") as output:
    output.write(match.group(1))
