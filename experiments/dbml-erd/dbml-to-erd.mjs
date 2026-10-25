#!/usr/bin/env node
// Independent, deliberately bounded DBML reader. No upstream parser code or dependencies.
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export class DbmlError extends Error {
  constructor(code, message, token) {
    super(`${code} at ${token.line}:${token.column}: ${message}`);
    this.code = code;
    this.line = token.line;
    this.column = token.column;
  }
}

function tokenize(source) {
  const tokens = [];
  let index = 0, line = 1, column = 1;
  const add = (kind, value, startLine = line, startColumn = column) => tokens.push({ kind, value, line: startLine, column: startColumn });
  while (index < source.length) {
    const c = source[index];
    if (c === '\r' || c === '\n') {
      add('newline', '\n');
      if (c === '\r' && source[index + 1] === '\n') index++;
      index++; line++; column = 1; continue;
    }
    if (c === ' ' || c === '\t') { index++; column++; continue; }
    if (source.slice(index, index + 2) === '//') {
      while (index < source.length && !/[\r\n]/.test(source[index])) { index++; column++; }
      continue;
    }
    const match = source.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*|^[0-9]+/);
    if (match) {
      add(/^[0-9]/.test(match[0]) ? 'number' : 'word', match[0]);
      index += match[0].length; column += match[0].length; continue;
    }
    if ('{}[](),:.<>-'.includes(c)) { add(c, c); index++; column++; continue; }
    throw new DbmlError('dbml/unsupported-token', `Unsupported character ${JSON.stringify(c)}; quoted names, strings, expressions and optionality operators are outside this subset.`, { line, column });
  }
  add('eof', '');
  return tokens;
}

export function convertDbml(source, { title = 'DBML schema — experimental import' } = {}) {
  const tokens = tokenize(source);
  let cursor = 0;
  const tables = new Map(), refs = [];
  const peek = () => tokens[cursor];
  const take = kind => {
    const token = peek();
    if (token.kind !== kind) throw new DbmlError('dbml/syntax', `Expected ${kind}, found ${token.value || token.kind}.`, token);
    cursor++; return token;
  };
  const fail = (code, message, token = peek()) => { throw new DbmlError(code, message, token); };
  const newlines = () => { while (peek().kind === 'newline') cursor++; };
  const endLine = () => {
    if (!['newline', 'eof', '}'].includes(peek().kind)) fail('dbml/unsupported-syntax', 'One column or Ref per line; trailing settings, aliases, expressions and extra declarations are unsupported.');
    newlines();
  };
  const endpoint = () => {
    const table = take('word'); take('.'); const column = take('word');
    return { table: table.value, column: column.value, token: table };
  };
  newlines();
  while (peek().kind !== 'eof') {
    const declaration = take('word');
    if (declaration.value === 'Table') {
      const name = take('word');
      if (!/^[A-Za-z]/.test(name.value)) fail('dbml/native-id', 'Table identifiers must start with a letter for native ERD IDs.', name);
      if (tables.has(name.value)) fail('dbml/duplicate-table', `Duplicate table ${name.value}.`, name);
      take('{'); newlines();
      const table = { name: name.value, columns: new Map(), token: name };
      tables.set(name.value, table);
      while (peek().kind !== '}') {
        if (peek().kind === 'eof') fail('dbml/syntax', `Unclosed Table ${name.value}.`);
        const column = take('word');
        if (table.columns.has(column.value)) fail('dbml/duplicate-column', `Duplicate column ${name.value}.${column.value}.`, column);
        const type = take('word');
        const simple = new Set(['bigint', 'int', 'integer', 'smallint', 'uuid', 'boolean', 'text', 'date', 'timestamp', 'timestamptz']);
        let typeName = type.value;
        if (['varchar', 'char', 'numeric', 'decimal'].includes(typeName)) {
          take('('); const first = take('number');
          if (Number(first.value) < 1 || !Number.isSafeInteger(Number(first.value))) fail('dbml/type-parameter', 'Type length/precision must be a positive safe integer.', first);
          typeName += `(${first.value}`;
          if (['numeric', 'decimal'].includes(type.value)) {
            take(','); const scale = take('number');
            if (!Number.isSafeInteger(Number(scale.value)) || Number(scale.value) > Number(first.value)) fail('dbml/type-parameter', 'Scale must be between zero and precision.', scale);
            typeName += `,${scale.value}`;
          }
          take(')'); typeName += ')';
        } else if (!simple.has(typeName)) fail('dbml/unsupported-type', `Unsupported type ${typeName}; custom/enum and multiword types are not accepted.`, type);
        const settings = new Set();
        if (peek().kind === '[') {
          take('[');
          do {
            const setting = take('word');
            let value = setting.value;
            if (value === 'not') { const next = take('word'); if (next.value !== 'null') fail('dbml/unsupported-setting', 'Expected not null.', next); value = 'not null'; }
            if (!['pk', 'unique', 'null', 'not null'].includes(value)) fail('dbml/unsupported-setting', `Unsupported column setting ${value}.`, setting);
            if (settings.has(value)) fail('dbml/duplicate-setting', `Repeated setting ${value}.`, setting);
            settings.add(value);
            if (peek().kind !== ',') break;
            take(',');
          } while (true);
          take(']');
        }
        if (settings.has('null') && (settings.has('not null') || settings.has('pk'))) fail('dbml/conflicting-nullability', 'null conflicts with not null or primary key.', column);
        table.columns.set(column.value, { name: column.value, type: typeName, settings, token: column });
        endLine();
      }
      take('}');
      if (table.columns.size === 0) fail('dbml/empty-table', 'Each table needs at least one column.', name);
      if ([...table.columns.values()].filter(c => c.settings.has('pk')).length > 1) fail('dbml/composite-key', 'Multiple primary-key columns are unsupported; composite identity must not be flattened.', name);
      endLine();
    } else if (declaration.value === 'Ref') {
      let name;
      if (peek().kind === 'word') {
        const identifier = take('word');
        name = identifier.value;
        if (!/^[A-Za-z]/.test(name)) fail('dbml/native-id', 'Ref names must start with a letter for native ERD IDs.', identifier);
      }
      take(':'); const left = endpoint();
      const operator = peek();
      if (!['>', '<', '-'].includes(operator.kind)) fail('dbml/unsupported-ref', 'Only single-column >, < and - references are supported.');
      cursor++;
      const right = endpoint();
      refs.push({ name, left, right, operator: operator.value, token: declaration });
      endLine();
    } else fail('dbml/unsupported-declaration', `Unsupported declaration ${declaration.value}; only Table and short-form Ref are accepted.`, declaration);
    newlines();
  }
  if (!tables.size) fail('dbml/empty-model', 'At least one Table is required.');
  if (tables.size > 26) fail('dbml/model-limit', 'This experiment supports at most 26 tables (two grid columns).');
  const lookup = ep => {
    const table = tables.get(ep.table), column = table?.columns.get(ep.column);
    if (!column) fail('dbml/unresolved-reference', `Unknown reference endpoint ${ep.table}.${ep.column}.`, ep.token);
    return column;
  };
  const relationships = [], relationshipIds = new Set(), foreignKeys = new Map();
  for (const ref of refs) {
    lookup(ref.left); lookup(ref.right);
    if (ref.left.table === ref.right.table) fail('dbml/self-reference', 'Native ERD does not support self relationships in this experiment.', ref.token);
    const foreign = ref.operator === '>' ? ref.left : ref.right;
    const parent = ref.operator === '>' ? ref.right : ref.left;
    const fk = lookup(foreign), target = lookup(parent);
    const fkName = `${foreign.table}.${foreign.column}`;
    if (foreignKeys.has(fkName)) fail('dbml/multiple-reference', `Column ${fkName} has more than one Ref.`, ref.token);
    if (!target.settings.has('pk') && !target.settings.has('unique')) fail('dbml/nonunique-target', 'Referenced column must declare pk or unique in this subset.', parent.token);
    if (fk.type !== target.type) fail('dbml/type-mismatch', 'Foreign key and referenced column types must match exactly in this subset.', ref.token);
    if (ref.operator !== '-' && (fk.settings.has('pk') || fk.settings.has('unique'))) fail('dbml/cardinality-conflict', 'A unique FK cannot use a many-side operator in this subset; use one-to-one (-).', foreign.token);
    if (ref.operator === '-' && !fk.settings.has('pk') && !fk.settings.has('unique')) fail('dbml/one-to-one-key', 'One-to-one short Ref uses the RIGHT column as FK; declare unique or pk there.', foreign.token);
    if (fk.settings.has('pk') && !fk.settings.has('not null')) fail('dbml/pk-fk-nullability', 'A primary-key FK must explicitly declare not null in this subset.', foreign.token);
    const nullable = !fk.settings.has('not null');
    const id = ref.name ?? `ref_${relationships.length + 1}`;
    if (relationshipIds.has(id)) fail('dbml/duplicate-ref', `Duplicate relationship ID ${id}.`, ref.token);
    relationshipIds.add(id);
    foreignKeys.set(fkName, `${parent.table}.${parent.column}`);
    relationships.push({
      id, from: ref.left.table, to: ref.right.table,
      label: foreign.column,
      fromCardinality: ref.operator === '>' ? 'many' : 'one',
      toCardinality: ref.operator === '<' ? 'many' : 'one',
      // A parent can have zero dependents; only the FK's nullability constrains its parent endpoint.
      fromOptional: ref.operator === '>' ? true : nullable,
      toOptional: ref.operator === '>' ? nullable : true,
    });
  }
  const entities = [...tables.values()].map((table, index) => ({
    id: table.name, label: table.name, row: Math.floor(index / 2), col: index % 2,
    attributes: [...table.columns.values()].map(column => {
      const references = foreignKeys.get(`${table.name}.${column.name}`);
      if (column.settings.has('not null') && !column.settings.has('pk') && !references) fail('dbml/unrepresentable-nullability', 'NOT NULL on a non-key/non-FK attribute has no native ERD attribute field; not silently discarded.', column.token);
      const keys = [];
      if (column.settings.has('pk')) keys.push('pk');
      if (references) keys.push('fk');
      if (column.settings.has('unique')) keys.push('uk');
      return { name: column.name, type: column.type, ...(keys.length ? { key: keys.length === 1 ? keys[0] : keys } : {}), ...(references ? { references } : {}) };
    }),
  }));
  return {
    schema_version: 1, diagram_type: 'erd',
    meta: { title, output: 'dbml-erd.html', subtitle: 'Experimental DBML subset · schema projection, not executable DDL', locale: 'en', visual_preset: 'blueprint' },
    layout: { mode: 'grid', gapX: 100, gapY: 70 }, entities, relationships,
    cards: [{ dot: 'amber', title: 'Read the relationship ends', items: [
      'A circle marks zero allowed rows at that endpoint. A parent may have zero dependents.',
      'FK columns without not null are nullable by DBML default. Nullable FKs make the parent endpoint optional.',
      'This is a bounded structure projection. It does not execute migrations or infer delete/update actions.',
    ] }],
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [input, output, ...extra] = process.argv.slice(2);
  if (!input || !output || extra.length) {
    console.error('Usage: node experiments/dbml-erd/dbml-to-erd.mjs <input.dbml> <output.erd.json>');
    process.exitCode = 2;
  } else {
    try {
      if (resolve(input) === resolve(output)) throw new Error('Input and output must be different paths.');
      const converted = convertDbml(readFileSync(input, 'utf8'));
      // Conversion completes before opening the destination: rejected input preserves existing output.
      writeFileSync(output, `${JSON.stringify(converted, null, 2)}\n`, { flag: 'wx' });
      console.log(JSON.stringify({ ok: true, tables: converted.entities.length, relationships: converted.relationships.length, output }));
    } catch (error) {
      console.error(JSON.stringify({ ok: false, diagnostics: [{ code: error.code === 'EEXIST' ? 'dbml/output-exists' : (error.code ?? 'dbml/io'), severity: 'error', message: error.message, subject: { path: input }, evidence: error instanceof DbmlError ? { line: error.line, column: error.column } : {}, supportedFixes: [error.code === 'EEXIST' ? 'Choose a fresh output path; existing files, directories and symlinks are never replaced.' : 'Use only the documented Table/column/short Ref subset; see experiments/dbml-erd/README.md.'] }] }));
      process.exitCode = 1;
    }
  }
}
