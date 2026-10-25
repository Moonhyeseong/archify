import pathlib, sys, functools
source = pathlib.Path(sys.argv[1]).read_bytes()
text = source.decode("utf-8")
lines = text.splitlines(keepends=True)
blank = lambda line: all(c in " \t\r\n" for c in line)
def indentation(line):
    return line[:len(line) - len(line.lstrip(" \t"))]
def common(a, b):
    i = 0
    while i < min(len(a), len(b)) and a[i] == b[i]:
        i += 1
    return a[:i]
indents = [indentation(line) for line in lines if not blank(line)]
prefix = functools.reduce(common, indents) if indents else ""
out = []
for i, line in enumerate(lines):
    if blank(line):
        out.append("" if i == 0 or i == len(lines) - 1 else ("\r\n" if line.endswith("\r\n") else "\n"))
    else:
        out.append(line[len(prefix):])
with pathlib.Path(sys.argv[2]).open("xb") as output:
    output.write("".join(out).encode("utf-8"))
