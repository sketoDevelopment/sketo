import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { sql } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';

function load(path, modules = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  }).outputText, { exports, require: (name) => {
    assert.ok(name in modules, name);
    return modules[name];
  } });
  return exports;
}

const { filterAccessories, accessoryCategories, staffAccessorySkus } = load('app/staff/accessories/types.ts');
test('staff list shows actual colour and volume SKUs without internal placeholders or duplicates', () => {
  const product = { variants: [{ id: 'white', sku: ' BK2714 ' }, { id: 'black', sku: 'BK2715' }] };
  assert.equal(staffAccessorySkus(product).join(' / '), 'BK2714 / BK2715');
  assert.equal(staffAccessorySkus({ ...product, volumes: [{ skuByVariant: { white: 'SMALL-W', black: 'SMALL-B' } }, { skuByVariant: { white: 'SMALL-W' } }] }).join(' / '), 'SMALL-W / SMALL-B');
  assert.equal(staffAccessorySkus({ variants: [{ id: 'new', sku: 'ACC-12345678-1234-1234-1234-123456789abc' }] }).length, 0);
});
test('search includes English and Kazakh translation text', () => {
  const items = [{ name: 'Чайник', brand: 'muvna', description: '', category: 'kettles', variants: [], searchText: 'Pour-over kettle Кофеге арналған шәйнек' }];
  assert.equal(filterAccessories(items, 'pour-over kettle', '', '').length, 1);
  assert.equal(filterAccessories(items, 'шәйнек', '', '').length, 1);
  assert.equal(filterAccessories(items, 'unknown', '', '').length, 0);
});
const catalog = JSON.parse(readFileSync('supabase/imports/20261012_muvna_catalog.json', 'utf8')).map((p) => ({
  ...p, state: 'draft', variants: p.variants.map((v) => ({ ...v, color: v.color_label })),
}));

test('all imported categories have readable labels; empty search retains every card', () => {
  assert.equal(filterAccessories(catalog, '', '', '').length, catalog.length);
  for (const product of catalog) assert.ok(accessoryCategories[product.category], product.category);
});

test('SKU search is case insensitive and finds a colour inside a grouped card', () => {
  const result = filterAccessories(catalog, ' sp2679 ', '', '');
  assert.equal(result.length, 1);
  assert.equal(result[0].slug, 'muvna-powder-shaker');
  assert.equal(filterAccessories(catalog, 'muvna sp2679', '', '').length, 1);
});

test('category and publication filters combine with query; no match is empty', () => {
  assert.equal(filterAccessories(catalog, 'SP2679', 'scales', '').length, 0);
  assert.equal(filterAccessories(catalog, '', '', 'published').length, 0);
  assert.equal(filterAccessories(catalog, 'SP2679', 'milk-tools', 'draft').length, 1);
  assert.equal(filterAccessories(catalog, 'no-such-accessory', '', '').length, 0);
});

function dataModule(requireStaff, execute) {
  return load('app/staff/accessories/data.ts', {
    'server-only': {}, 'drizzle-orm': { sql }, '@/lib/db/bounded': { withBoundedDatabase: (_lane, run) => run({ execute }) },
    '@/lib/staff-auth': { requireStaff },
  });
}

test('unauthorised caller cannot trigger a database read', async () => {
  let reads = 0;
  const data = dataModule(async () => { throw new Error('Unauthorised'); }, async () => { reads++; });
  await assert.rejects(data.getStaffAccessories(), /Unauthorised/);
  assert.equal(reads, 0);
});

test('authorised list uses one read-only query against the separate catalog', async () => {
  let authorised = false;
  let reads = 0;
  const data = dataModule(async () => { authorised = true; }, async (query) => {
    assert.ok(authorised);
    reads++;
    const text = new PgDialect().sqlToQuery(query).sql;
    assert.match(text, /FROM public\.accessory_products/);
    assert.match(text, /public\.accessory_variants/);
    assert.doesNotMatch(text, /\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE)\b/i);
    assert.doesNotMatch(text, /FROM (?:public\.)?products\b/);
    return catalog;
  });
  assert.equal((await data.getStaffAccessories()).length, catalog.length);
  assert.equal(reads, 1);
});

test('missing migration is distinguished from connection or permission failures', () => {
  const { isMissingAccessorySchema } = dataModule(async () => {}, async () => []);
  assert.equal(isMissingAccessorySchema({ cause: { code: '42P01' } }), true);
  assert.equal(isMissingAccessorySchema({ code: '42501' }), false);
  assert.equal(isMissingAccessorySchema(new Error('Connection failed')), false);
});
