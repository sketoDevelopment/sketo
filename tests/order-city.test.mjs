import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(path, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, ...globals });
  return exports;
}
const cities = load('app/cart/cities.ts');

function setup(saved = null) {
  let cursor = 0;
  const slots = [];
  const storage = new Map(saved ? [['sketo-order-city-v1', saved]] : []);
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = value; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
  };
  const hook = load('app/cart/useOrderCity.ts', {
    require: name => { assert.ok(['react', './cities'].includes(name)); return name === 'react' ? react : cities; },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  }).default;
  return { render: () => { cursor = 0; return hook(); }, storage };
}

test('saved city is restored', () => {
  const state = setup('almaty');
  state.render().initialize();
  assert.equal(state.render().city, 'almaty');
});


test('manual selection is remembered when reopening the cart', () => {
  const state = setup();
  state.render().initialize();
  assert.equal(state.render().city, 'astana');
  state.render().select('almaty');
  state.render().initialize();
  assert.equal(state.render().city, 'almaty');
  assert.deepEqual([...state.storage], [['sketo-order-city-v1', 'almaty']]);
});

test('invalid saved city falls back to Astana', () => {
  const state = setup('invalid');
  state.render().initialize();
  assert.equal(state.render().city, 'astana');
});
