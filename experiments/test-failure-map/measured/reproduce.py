"""Replay only the bundled original fixture in a new temporary isolated venv.

No user project is collected. Nothing is installed into a global environment.
Raw reports and all installation/runtime logs remain in the new temporary folder.
"""
from pathlib import Path
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time

if sys.version_info[:3] != (3, 14, 8):
    raise SystemExit('This evidence used Python 3.14.8. Use that interpreter explicitly; no runtime is installed automatically.')
base = Path(__file__).resolve().parent
capture = Path(tempfile.mkdtemp(prefix='archify-upstream-replay-', dir='/tmp')).resolve()
for name in ['logs', 'raw', 'tmp']:
    (capture / name).mkdir()
source_root = base / 'controlled-fixture'
manifest_bytes = (base / 'fixture-source-manifest.json').read_bytes()
if hashlib.sha256(manifest_bytes).hexdigest() != json.loads((base / 'toolchain-provenance.json').read_text())['fixtureManifestSha256']:
    raise SystemExit('Original fixture manifest changed; no fixture is executed.')
source_manifest = json.loads(manifest_bytes)
entries = source_manifest['files']
expected_files = {entry['path'] for entry in entries}
for entry in entries:
    part = Path(entry['path'])
    if part.is_absolute() or '..' in part.parts:
        raise SystemExit('Unsafe fixture manifest path; no fixture is executed.')
actual_paths = list(source_root.rglob('*'))
if any(p.is_symlink() for p in actual_paths) or {str(p.relative_to(source_root)) for p in actual_paths if p.is_file()} != expected_files:
    raise SystemExit('Fixture must contain exactly the original allowlisted files, with no symlinks.')
for entry in entries:
    if hashlib.sha256((source_root / entry['path']).read_bytes()).hexdigest() != entry['sha256']:
        raise SystemExit('Original fixture content changed; no fixture is executed.')
shutil.copytree(source_root, capture / 'fixture')
for entry in entries:
    if hashlib.sha256((capture / 'fixture' / entry['path']).read_bytes()).hexdigest() != entry['sha256']:
        raise SystemExit('Copied fixture content changed; no fixture is executed.')
fixture = capture / 'fixture'
records = []
env = {key: value for key, value in os.environ.items() if key in ['PATH', 'LANG', 'LC_ALL', 'LC_CTYPE', 'SYSTEMROOT']}
env.update(TMPDIR=str(capture / 'tmp'), PYTHONNOUSERSITE='1', PYTEST_DISABLE_PLUGIN_AUTOLOAD='1')

def run(name, argv, cwd, expected, extra_env=None):
    started = time.monotonic()
    with (capture / 'logs' / (name + '.stdout')).open('w') as stdout, (capture / 'logs' / (name + '.stderr')).open('w') as stderr:
        result = subprocess.run(argv, cwd=cwd, env={**env, **(extra_env or {})}, stdout=stdout, stderr=stderr)
    records.append({'name': name, 'argv': argv, 'cwd': str(cwd), 'exitCode': result.returncode, 'expectedExitCode': expected, 'expectedExitObserved': result.returncode == expected, 'durationSeconds': round(time.monotonic() - started, 3)})
    (capture / 'command-results.json').write_text(json.dumps(records, indent=2) + '\n')
    if result.returncode != expected:
        raise SystemExit(f'{name}: exit {result.returncode}, expected {expected}; original logs at {capture}')

run('venv-create', [sys.executable, '-m', 'venv', str(capture / 'venv')], capture, 0)
python = str(capture / 'venv' / 'bin' / 'python')
packages = [
    'pytest==8.4.2', 'iniconfig==2.3.1', 'packaging==26.3', 'pluggy==1.7.0', 'Pygments==2.21.0', 'pytest-metadata==3.1.1',
    'https://github.com/coveragepy/coveragepy/archive/0e4f752b455bbf26fdad32ac29948d067c87dd62.tar.gz',
    'https://github.com/numirias/pytest-json-report/archive/c6f0bc93a174770e04b965e459d339a880005e78.tar.gz',
    'https://github.com/pytest-dev/pytest-cov/archive/a8cb1260170754f2aff9022cfd252c488098e813.tar.gz',
]
run('install-fixed-toolchain', [python, '-m', 'pip', '--isolated', '--disable-pip-version-check', 'install', '--no-input', *packages], capture, 0)
run('installed-versions', [python, '-m', 'pip', '--isolated', '--disable-pip-version-check', 'list', '--format=json'], capture, 0)

# Check installed critical code bytes against the immutable source files recorded with this evidence.
expected = {entry['distribution']: entry['sourceSha256'] for entry in json.loads((base / 'toolchain-provenance.json').read_text())['installedSourceFileChecks']}
check_code = '''import hashlib, importlib.metadata as m, json, pathlib, sys
expected=json.loads(sys.argv[1])
files={'coverage':'coverage/jsonreport.py','pytest-cov':'pytest_cov/plugin.py','pytest-json-report':'pytest_jsonreport/plugin.py','pytest':'_pytest/main.py'}
checks={name:hashlib.sha256(pathlib.Path(m.distribution(name).locate_file(file)).read_bytes()).hexdigest() for name,file in files.items()}
print(json.dumps(checks,indent=2))
assert checks==expected, 'Installed critical source differs from pinned evidence'
'''
run('installed-source-hashes', [python, '-c', check_code, json.dumps(expected)], capture, 0)

common = [python, '-m', 'pytest', '-p', 'pytest_jsonreport.plugin', '-p', 'pytest_cov.plugin', '-p', 'pytest_metadata.plugin', '--rootdir', str(fixture), '-c', str(fixture / 'pytest.ini'), '-q']
scenarios = [
    ('canonical-context', ['tests/test_cases.py', '-k', 'parameterized', '--cov=domain', '--cov-context=test', '--cov-config=' + str(fixture / '.coveragerc'), '--cov-report=json:' + str(capture / 'raw' / 'canonical-context.coverage.json')], 0),
    ('canonical-phase-failures', ['tests/test_cases.py', '-k', 'failure'], 1),
    ('canonical-collection-failure', ['tests/test_collection_failure.py'], 2),
]
for name, args, expected in scenarios:
    run(name, common + ['--json-report', '--json-report-file=' + str(capture / 'raw' / (name + '.pytest.json'))] + args, fixture, expected, {'COVERAGE_FILE': str(capture / 'raw' / (name + '.coverage'))})
manifest = [{'file': p.name, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size} for p in sorted((capture / 'raw').glob('*.json'))]
(capture / 'raw-report-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({'captureDirectory': str(capture), 'intentionalFailures': 'exit 1 phase failures and exit 2 collection failure are expected, not successful tests', 'scope': 'Only the bundled original controlled fixture was collected; not a user project.'}, indent=2))
