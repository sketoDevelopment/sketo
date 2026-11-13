import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

function load(path, modules = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, require: (name) => { assert.ok(name in modules, name); return modules[name]; } });
  return exports;
}
const order = load('lib/whatsapp-order.ts');
const cartModel = load('app/cart/model.ts');
const cities = load('app/cart/cities.ts');
const pricing = load('lib/equipment-price.ts');
const cartOrder = load('app/cart/whatsapp.ts', {
  './cities': cities,
  '@/lib/equipment-price': pricing,
  '@/lib/whatsapp-order': order,
  './model': cartModel,
});
const Button = load('app/components/ProductOrderButton.tsx', {
  'react/jsx-runtime': jsx, '@/lib/whatsapp-order': order,
  './ProductOrderButton.module.css': { default: {} },
  '../cart/CartProvider': { useOpenCart: () => () => {} },
  '../cart/store': { useCartLines: () => [], addToCart: () => {} },
  '../cart/model': { MAX_LINES: 100, cartKey: item => item.slug },
  '../cart/copy': load('app/cart/copy.ts'),
  '../cart/cart.module.css': { default: {} },
}).default;
const greetings = { ru: 'Здравствуйте!', en: 'Hello!', kz: 'Сәлеметсіз бе!' };
const props = {
  name: 'Кофе «А & Б» / Қазақстан #1', slug: 'african-profile-1-0',
  productUrl: 'https://shop.example/catalog/african-profile-1-0',
  size: '250 г', price: 'KZT 5,700',
};

for (const kind of ['coffee', 'equipment']) for (const language of ['ru', 'en', 'kz']) {
  test(`${kind}/${language}: rendered button has the right recipient and localized message`, () => {
    const productUrl = kind === 'coffee' ? props.productUrl : 'https://shop.example/equipment/linea-mini';
    const input = { ...props, kind, language, productUrl };
    const html = renderToStaticMarkup(React.createElement(Button, input));
    assert.ok(html.includes(order.orderCopy[language].button));
    assert.ok(html.includes('target="_blank"'));
    const href = html.match(/href="([^"]+)"/)[1].replaceAll('&amp;', '&').replaceAll('&#x27;', "'");
    const url = new URL(href);
    assert.equal(url.origin + url.pathname, 'https://wa.me/77473835398');
    assert.equal([...url.searchParams.keys()].join(), 'text');
    const message = url.searchParams.get('text');
    assert.ok(message.startsWith(greetings[language]));
    assert.ok(message.includes(props.name), 'Special characters survive URL encoding');
    assert.ok(!/Артикул:|Item code:/.test(message));
    assert.ok(message.includes(productUrl));
    assert.equal(message.includes(props.size), kind === 'coffee');
    assert.equal(message.includes(props.price), true);
    assert.ok(message.includes('\n'));
  });
}

test('changing language or selected product regenerates the message', () => {
  const ru = order.buildWhatsAppOrderUrl({ ...props, kind: 'coffee', language: 'ru' });
  const en = order.buildWhatsAppOrderUrl({ ...props, kind: 'coffee', language: 'en', name: 'Other lot', slug: 'other-lot', productUrl: 'https://shop.example/catalog/other-lot' });
  assert.notEqual(ru, en);
  const message = new URL(en).searchParams.get('text');
  assert.ok(message.startsWith('Hello!'));
  assert.ok(message.includes('Other lot'));
  assert.ok(!message.includes(props.slug));
});

test('missing optional fields do not produce undefined text or blank price labels', () => {
  const message = new URL(order.buildWhatsAppOrderUrl({ ...props, kind: 'coffee', language: 'en', name: '', size: '', price: undefined })).searchParams.get('text');
  assert.ok(message.includes(props.slug));
  assert.ok(!/undefined|Website price:|Weight:/.test(message));
});

test('all three product cards add to cart without a second WhatsApp link', () => {
  for (const kind of ['coffee', 'accessory', 'equipment']) {
    const html = renderToStaticMarkup(React.createElement(Button, {
      ...props, kind, language: 'ru',
      cartItem: { kind, slug: props.slug, unitPrice: 100000, content: {} },
    }));
    assert.match(html, /<button[^>]*>.*В корзину/);
    assert.ok(!html.includes('wa.me/'));
    assert.ok(!html.includes(order.orderCopy.ru.button));
  }
});

test('one WhatsApp message includes every cart line, variant, quantity, from-price and unknown-price', () => {
  const content = (name, detail) => Object.fromEntries(['ru', 'en', 'kz'].map(locale => [locale, { name, detail }]));
  const lines = [
    { kind: 'coffee', slug: 'african', quantity: 2, unitPrice: 570000, content: content('African', '250 г') },
    { kind: 'accessory', slug: 'kettle', sku: 'BK2714-W', variantId: 'white', quantity: 1, unitPrice: 1200000, content: content('Чайник', 'Белый') },
    { kind: 'equipment', slug: 'micra', quantity: 1, unitPrice: 230000000, priceFrom: true, content: content('Linea Micra', 'Кофемашина') },
    { kind: 'equipment', slug: 'unknown', quantity: 1, unitPrice: null, content: content('No quote', '') },
  ];
  const url = new URL(cartOrder.buildWhatsAppCartUrl(lines, 'ru'));
  assert.equal(url.origin + url.pathname, 'https://wa.me/77473835398');
  const message = url.searchParams.get('text');
  for (const expected of ['1. African — 250 г', '2. Чайник — Белый', '3. Linea Micra', '4. No quote', 'Количество: 2', 'от 2 300 000 ₸', 'Цена по запросу', 'Товары с указанной ценой']) {
    assert.ok(message.includes(expected), expected);
  }
  assert.ok(!message.includes('NaN'));
  assert.ok(message.includes('Артикул: BK2714-W'));
  assert.equal((message.match(/Артикул:/g) ?? []).length, 1);
  for (const language of ['en', 'kz']) {
    const translated = new URL(cartOrder.buildWhatsAppCartUrl(lines, language)).searchParams.get('text');
    assert.ok(translated.includes(`${language === 'en' ? 'SKU' : 'Артикул'}: BK2714-W`));
  }
  const legacy = new URL(cartOrder.buildWhatsAppCartUrl([{ ...lines[1], sku: undefined }], 'ru')).searchParams.get('text');
  assert.ok(!legacy.includes('Артикул:'));
  for (const line of lines) assert.ok(!message.includes(line.slug));
  assert.throws(() => cartOrder.buildWhatsAppCartUrl([], 'ru'));
});

test('cart destination and message match the selected city in every language', () => {
  const content = Object.fromEntries(['ru', 'en', 'kz'].map(language => [language, { name: 'Coffee', detail: '' }]));
  const lines = [{ kind: 'coffee', slug: 'coffee', quantity: 1, unitPrice: 100000, content }];
  for (const city of ['astana', 'almaty']) for (const language of ['ru', 'en', 'kz']) {
    const url = new URL(cartOrder.buildWhatsAppCartUrl(lines, language, city));
    assert.equal(url.pathname, `/${cities.orderCities[city].phone}`);
    assert.ok(url.searchParams.get('text').includes(cities.orderCities[city].name[language]));
  }
});
