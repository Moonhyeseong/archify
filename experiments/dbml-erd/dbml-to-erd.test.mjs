import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, symlinkSync, linkSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { convertDbml, DbmlError } from './dbml-to-erd.mjs';

const tables = fk => `Table accounts {\n id bigint [pk]\n}\nTable purchases {\n id bigint [pk]\n account_id bigint ${fk}\n}\n`;
const relation = input => convertDbml(input).relationships[0];
const rejected = (input, code) => assert.throws(() => convertDbml(input), error => error instanceof DbmlError && error.code === code && error.line >= 1 && error.column >= 1);

test('many-to-one: an unspecified FK is nullable, parent may have no children', () => {
  const model = convertDbml(tables('') + 'Ref: purchases.account_id > accounts.id');
  assert.deepEqual(model.relationships[0], {
    id: 'ref_1', from: 'purchases', to: 'accounts', label: 'account_id',
    fromCardinality: 'many', toCardinality: 'one', fromOptional: true, toOptional: true,
  });
  assert.deepEqual(model.entities[1].attributes[1], { name: 'account_id', type: 'bigint', key: 'fk', references: 'accounts.id' });
});

test('not null FK requires its parent, without requiring any children for that parent', () => {
  const result = relation(tables('[not null]') + 'Ref: purchases.account_id > accounts.id');
  assert.equal(result.fromOptional, true);
  assert.equal(result.toOptional, false);
});

test('reversing short Ref notation preserves declared direction and swaps endpoint meaning', () => {
  const result = relation(tables('[not null]') + 'Ref: accounts.id < purchases.account_id');
  assert.deepEqual([result.from, result.to, result.fromCardinality, result.toCardinality, result.fromOptional, result.toOptional],
    ['accounts', 'purchases', 'one', 'many', false, true]);
  const nullable = relation(tables('[null]') + 'Ref: accounts.id < purchases.account_id');
  assert.equal(nullable.fromOptional, true);
});

test('short one-to-one uses RIGHT column as FK and preserves unique role', () => {
  const model = convertDbml(tables('[unique, not null]') + 'Ref identity: accounts.id - purchases.account_id');
  assert.deepEqual(model.entities[1].attributes[1], { name: 'account_id', type: 'bigint', key: ['fk', 'uk'], references: 'accounts.id' });
  const result = model.relationships[0];
  assert.deepEqual([result.fromCardinality, result.toCardinality, result.fromOptional, result.toOptional], ['one', 'one', false, true]);
  const nullable = relation(tables('[unique]') + 'Ref: accounts.id - purchases.account_id');
  assert.equal(nullable.fromOptional, true);
  assert.equal(nullable.toOptional, true);
});

test('a shared primary key retains BOTH pk and fk badges', () => {
  const model = convertDbml('Table accounts {\n id bigint [pk]\n}\nTable profiles {\n account_id bigint [pk, not null]\n}\nRef: accounts.id - profiles.account_id');
  assert.deepEqual(model.entities[1].attributes[0].key, ['pk', 'fk']);
  assert.equal(model.relationships[0].fromOptional, false);
});

test('primary key is the same setting as pk for referenced and shared primary keys', () => {
  const input = spelling => `Table accounts {\n id bigint [${spelling}]\n}\nTable profiles {\n account_id bigint [${spelling}, not null]\n}\nRef: accounts.id - profiles.account_id`;
  const short = convertDbml(input('pk')), long = convertDbml(input('primary key'));
  assert.deepEqual(long.entities, short.entities);
  assert.deepEqual(long.relationships, short.relationships);
  assert.deepEqual(long.entities[1].attributes[0].key, ['pk', 'fk']);
  assert.equal(long.relationships[0].fromOptional, false);
});

test('CLI accepts the complete official primary-key fixture while simple-table remains rejected', () => {
  const directory = mkdtempSync(join(tmpdir(), 'dbml-erd-official-'));
  const primary = new URL('./upstream-compatibility/primary_key.in.dbml', import.meta.url);
  const simple = new URL('./upstream-compatibility/simple-table.dbml', import.meta.url);
  const original = readFileSync(primary);
  const run = (input, output) => spawnSync(process.execPath, [new URL('./dbml-to-erd.mjs', import.meta.url).pathname, input.pathname, output], { encoding: 'utf8' });
  try {
    const output = join(directory, 'primary.json');
    const accepted = run(primary, output);
    assert.equal(accepted.status, 0, accepted.stderr);
    const model = JSON.parse(readFileSync(output, 'utf8'));
    assert.deepEqual(model.entities.map(e => ({ id: e.id, attributes: e.attributes })), [{ id: 'A', attributes: [{ name: 'id', type: 'int', key: 'pk' }] }]);
    assert.deepEqual(model.relationships, []);
    assert.deepEqual(readFileSync(primary), original, 'The upstream input is consumed without rewriting it');
    const rejectedOutput = join(directory, 'simple.json');
    const refused = run(simple, rejectedOutput);
    assert.equal(refused.status, 1);
    assert.equal(JSON.parse(refused.stderr).diagnostics[0].code, 'dbml/unsupported-token');
    assert.equal(existsSync(rejectedOutput), false);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('rejects unsupported DBML constructs instead of losing their constraints', async t => {
  const cases = [
    ['indexes', 'Table t {\n id bigint [pk]\n indexes { id [unique] }\n}', 'dbml/syntax'],
    ['composite pk', 'Table t {\n a int [pk]\n b int [pk]\n}', 'dbml/composite-key'],
    ['composite ref', tables('') + 'Ref: purchases.(id, account_id) > accounts.(id, id)', 'dbml/syntax'],
    ['many-to-many', tables('') + 'Ref: purchases.account_id <> accounts.id', 'dbml/syntax'],
    ['delete action', tables('') + 'Ref: purchases.account_id > accounts.id [delete: cascade]', 'dbml/unsupported-syntax'],
    ['expression', 'Table t {\n id bigint [default: `now()`]\n}', 'dbml/unsupported-token'],
    ['default', 'Table t {\n id bigint [default: 4]\n}', 'dbml/unsupported-setting'],
    ['inline ref', 'Table t {\n id bigint [ref: > accounts.id]\n}', 'dbml/unsupported-setting'],
    ['Note', "Table t {\n id bigint [pk]\n Note: 'description'\n}", 'dbml/unsupported-token'],
    ['schema', 'Table public.t {\n id bigint\n}', 'dbml/syntax'],
    ['alias', 'Table t as x {\n id bigint\n}', 'dbml/syntax'],
    ['quoted name', 'Table "t" {\n id bigint\n}', 'dbml/unsupported-token'],
    ['Enum', 'Enum state { pending }', 'dbml/unsupported-declaration'],
    ['non-FK not null', 'Table t {\n id bigint [pk]\n name text [not null]\n}', 'dbml/unrepresentable-nullability'],
    ['optional operator', tables('') + 'Ref: purchases.account_id >? accounts.id', 'dbml/unsupported-token'],
  ];
  for (const [name, input, code] of cases) await t.test(name, () => rejected(input, code));
});

test('rejects ambiguity, invalid references and contradictory cardinality', async t => {
  const cases = [
    [tables('') + 'Ref: purchases.missing > accounts.id', 'dbml/unresolved-reference'],
    [tables('') + 'Ref: purchases.account_id > missing.id', 'dbml/unresolved-reference'],
    ['Table a {\n id int [pk]\n}\nTable a {\n id int\n}', 'dbml/duplicate-table'],
    ['Table a {\n id int\n id int\n}', 'dbml/duplicate-column'],
    [tables('[unique]') + 'Ref: purchases.account_id > accounts.id', 'dbml/cardinality-conflict'],
    [tables('') + 'Ref: accounts.id - purchases.account_id', 'dbml/one-to-one-key'],
    [tables('[null, not null]'), 'dbml/conflicting-nullability'],
    ['Table t {\n id int [pk, primary key]\n}', 'dbml/duplicate-setting'],
    ['Table t {\n id int [primary key, pk]\n}', 'dbml/duplicate-setting'],
    ['Table t {\n id int [primary key, primary key]\n}', 'dbml/duplicate-setting'],
    ['Table t {\n id int [primary]\n}', 'dbml/syntax'],
    ['Table t {\n id int [primary index]\n}', 'dbml/unsupported-setting'],
    ['Table t {\n id int [primary key, null]\n}', 'dbml/conflicting-nullability'],
    ['Table t {\n a int [pk]\n b int [primary key]\n}', 'dbml/composite-key'],
    ['Table a {\n id int [primary key]\n}\nTable b {\n id int [primary key]\n}\nRef: a.id - b.id', 'dbml/pk-fk-nullability'],
    [tables('[unique]') + 'Ref a: accounts.id - purchases.account_id\nRef b: accounts.id - purchases.account_id', 'dbml/multiple-reference'],
    ['Table t {\n id int [pk]\n parent int\n}\nRef: t.parent > t.id', 'dbml/self-reference'],
  ];
  for (const [i, [input, code]] of cases.entries()) await t.test(String(i), () => rejected(input, code));
});

test('synthetic payment fixture preserves table/column order and the three distinct relationship meanings', () => {
  const model = convertDbml(readFileSync(new URL('./fixtures/order-payments.dbml', import.meta.url), 'utf8'));
  assert.deepEqual(model.entities.map(e => e.id), ['orders', 'payment_attempts', 'unmatched_payments', 'payment_receipts']);
  assert.equal(model.entities.reduce((count, e) => count + e.attributes.length, 0), 15);
  assert.deepEqual(model.relationships.map(r => [r.id, r.fromCardinality, r.toCardinality, r.fromOptional, r.toOptional]), [
    ['order_attempts', 'one', 'many', false, true],
    ['matching_order', 'many', 'one', true, true],
    ['issued_receipt', 'one', 'one', false, true],
  ]);
});

test('CLI reports positioned diagnostic, exits nonzero, and preserves previous output on rejection', () => {
  const directory = mkdtempSync(join(tmpdir(), 'dbml-erd-test-'));
  try {
    const input = join(directory, 'bad.dbml'), output = join(directory, 'model.json');
    writeFileSync(input, 'Table t {\n value int [default: 1]\n}');
    writeFileSync(output, 'previous artifact');
    const result = spawnSync(process.execPath, [new URL('./dbml-to-erd.mjs', import.meta.url).pathname, input, output], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    const diagnostic = JSON.parse(result.stderr).diagnostics[0];
    assert.equal(diagnostic.code, 'dbml/unsupported-setting');
    assert.equal(diagnostic.evidence.line, 2);
    assert.equal(readFileSync(output, 'utf8'), 'previous artifact');
  } finally { rmSync(directory, { recursive: true, force: true }); }
});


test('CLI exclusive output preserves existing files, symlink victims, hardlink input aliases and directories', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'dbml-erd-exclusive-'));
  const input = join(directory, 'source.dbml');
  const source = 'Table accounts {\n id bigint [pk]\n}';
  writeFileSync(input, source);
  const run = output => spawnSync(process.execPath, [new URL('./dbml-to-erd.mjs', import.meta.url).pathname, input, output], { encoding: 'utf8' });
  try {
    await t.test('fresh path succeeds with parseable native JSON', () => {
      const output = join(directory, 'fresh.json');
      assert.equal(run(output).status, 0);
      assert.equal(JSON.parse(readFileSync(output, 'utf8')).entities[0].id, 'accounts');
    });
    await t.test('regular target preserved', () => {
      const output = join(directory, 'existing.json');
      writeFileSync(output, 'previous artifact');
      const result = run(output);
      assert.equal(result.status, 1);
      assert.equal(JSON.parse(result.stderr).diagnostics[0].code, 'dbml/output-exists');
      assert.equal(readFileSync(output, 'utf8'), 'previous artifact');
    });
    await t.test('symlink victim is not overwritten', () => {
      const victim = join(directory, 'victim.txt'), output = join(directory, 'symlink.json');
      writeFileSync(victim, 'unrelated user work'); symlinkSync(victim, output);
      assert.equal(run(output).status, 1);
      assert.equal(readFileSync(victim, 'utf8'), 'unrelated user work');
    });
    await t.test('hardlink alias of source preserved', () => {
      const output = join(directory, 'hardlink.json'); linkSync(input, output);
      assert.equal(run(output).status, 1);
      assert.equal(readFileSync(input, 'utf8'), source);
    });
    await t.test('existing directory preserved', () => {
      const output = join(directory, 'directory'); mkdirSync(output);
      assert.equal(run(output).status, 1);
      assert.equal(statSync(output).isDirectory(), true);
    });
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
