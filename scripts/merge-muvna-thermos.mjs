// Preview by default. --apply merges the two existing drafts; --publish is explicit.
import env from '@next/env';
import postgres from 'postgres';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

env.loadEnvConfig(process.cwd());
const apply = process.argv.includes('--apply');
const publish = process.argv.includes('--publish');
const targetId = 'c0d0b9df-aa10-4ff7-83c2-4658b2219122';
const sourceId = 'ae9f9874-9f45-48bd-875e-2f90fbb08fb0';
const db = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 8 });
try {
  await db.begin(apply ? 'read write' : 'read only', async tx => {
    await tx.unsafe("SET LOCAL statement_timeout='15s'");
    await tx.unsafe("SET LOCAL lock_timeout='3s'");
    const products = apply
      ? await tx`SELECT * FROM accessory_products WHERE id IN (${targetId}::uuid, ${sourceId}::uuid) ORDER BY id FOR UPDATE`
      : await tx`SELECT * FROM accessory_products WHERE id IN (${targetId}::uuid, ${sourceId}::uuid) ORDER BY id`;
    assert.equal(products.length, 2);
    const target = products.find(p => p.id === targetId);
    const source = products.find(p => p.id === sourceId);
    const variants = await tx`SELECT * FROM accessory_variants WHERE product_id IN (${targetId}::uuid, ${sourceId}::uuid) ORDER BY sku`;
    const images = await tx`SELECT * FROM accessory_images WHERE product_id IN (${targetId}::uuid, ${sourceId}::uuid)`;
    const translations = await tx`SELECT * FROM accessory_translations WHERE product_id IN (${targetId}::uuid, ${sourceId}::uuid)`;
    const bySku = Object.fromEntries(variants.map(v => [v.sku, v]));
    assert.deepEqual(Object.keys(bySku).sort(), ['BZ2618', 'BZ2619', 'BZ2621', 'BZ2622', 'BZ2623']);
    const black = bySku.BZ2622, mirror = bySku.BZ2618, gray = bySku.BZ2621;
    const volumes = [
      { id: 'a9f589da-2940-4b22-9f17-b96d94fe6150', value: '615', unit: 'мл', price: '21390', currency: 'KZT', skuByVariant: { [black.id]: 'BZ2622', [mirror.id]: 'BZ2618' } },
      { id: '4f70de34-fcc9-493c-8c6a-9e6682ec6850', value: '685', unit: 'мл', price: '22310', currency: 'KZT', skuByVariant: { [black.id]: 'BZ2623', [mirror.id]: 'BZ2619', [gray.id]: 'BZ2621' } },
    ];
    // A rerun must not archive or reset subsequent staff edits.
    if (target.slug === 'muvna-thermos') {
      assert.deepEqual(target.volume_options, volumes);
      assert.equal(source.editorial_state, 'archived');
      assert.equal(variants.filter(v => v.product_id === targetId).length, 3);
      console.log(JSON.stringify({ alreadyMerged: true, id: targetId, state: target.editorial_state }));
      return;
    }
    assert.equal(target.slug, 'muvna-thermos-615');
    assert.equal(source.slug, 'muvna-thermos-685');
    assert.equal(target.editorial_state, 'draft');
    assert.equal(source.editorial_state, 'draft');
    assert.equal(target.volume_options.length + source.volume_options.length, 0);
    assert.equal(images.length, 0, 'Photos were added: review their variant and volume assignments before merging');
    assert.equal(black.product_id, targetId);
    assert.equal(mirror.product_id, targetId);
    assert.equal(gray.product_id, sourceId);
    for (const v of variants) {
      assert.equal(v.currency, 'KZT');
      assert.equal(Number(v.retail_price), ['BZ2618', 'BZ2622'].includes(v.sku) ? 21390 : 22310);
    }
    const occupied = await tx`SELECT id FROM accessory_products WHERE slug='muvna-thermos'`;
    assert.equal(occupied.length, 0);
    const state = publish ? 'published' : 'draft';
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'preview', id: targetId, slug: 'muvna-thermos', state, volumes, archived: sourceId }, null, 2));
    if (!apply) return;
    mkdirSync('.local-backups', { recursive: true, mode: 0o700 });
    const backup = `.local-backups/thermos-merge-${Date.now()}.json`;
    writeFileSync(backup, JSON.stringify({ products, variants, images, translations }, null, 2), { mode: 0o600, flag: 'wx' });
    const attributes = { ...target.attributes };
    delete attributes.volume_ml;
    await tx`UPDATE accessory_products SET slug='muvna-thermos',name='Термос',attributes=${tx.json(attributes)},volume_options=${tx.json(volumes)},editorial_state=${state}::editorial_state WHERE id=${targetId}::uuid`;
    // Keep the two redundant colour rows in the archived original for import provenance.
    // The live product uses three colours and the five exact SKUs in its volume map.
    await tx`UPDATE accessory_variants SET product_id=${targetId}::uuid WHERE id=${gray.id}::uuid`;
    for (const [variant, hex, order] of [[black, '#242424', 0], [mirror, '#d1d1d1', 1], [gray, '#888888', 2]]) {
      await tx`UPDATE accessory_variants SET color_hex=${hex},sort_order=${order} WHERE id=${variant.id}::uuid`;
    }
    for (const [locale, name, description] of [
      ['ru', 'Термос', 'Термос для напитков с выбором объёма и цвета. Объём 615 мл доступен в чёрном и зеркальном цветах, 685 мл — в чёрном, сером и зеркальном.'],
      ['en', 'Insulated tumbler', 'A drinks tumbler with a choice of capacity and colour. The 615 ml version comes in black and mirror finishes; the 685 ml version comes in black, grey and mirror finishes.'],
      ['kz', 'Термос', 'Көлемі мен түсін таңдауға болатын сусын термосы. 615 мл нұсқасы қара және айна түстерінде, 685 мл нұсқасы қара, сұр және айна түстерінде ұсынылады.'],
    ]) {
      await tx`UPDATE accessory_translations SET name=${name},description=${description} WHERE product_id=${targetId}::uuid AND locale=${locale}::locale`;
    }
    await tx`UPDATE accessory_products SET editorial_state='archived' WHERE id=${sourceId}::uuid`;
    const result = await tx`SELECT id,slug,editorial_state,volume_options FROM accessory_products WHERE id=${targetId}::uuid`;
    assert.deepEqual(result[0].volume_options, volumes);
    const colours = await tx`SELECT id FROM accessory_variants WHERE product_id=${targetId}::uuid`;
    assert.equal(colours.length, 3);
    console.log(JSON.stringify({ backup, verified: true, editUrl: `/staff/accessories/edit/${targetId}` }));
  });
  console.log(apply ? 'Committed' : 'Preview complete');
} catch (error) {
  console.error(error.code ?? error.message);
  process.exitCode = 1;
} finally { await db.end({ timeout: 1 }); }
