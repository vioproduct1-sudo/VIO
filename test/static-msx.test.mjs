import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { buildStaticFiles, DEFAULT_BASE } from '../scripts/export-msx.mjs';

test('MSX: все внутренние ссылки ведут в экспортированные страницы', () => {
  const files = buildStaticFiles();
  function visit(value) {
    if (typeof value === 'string') {
      assert(!value.includes('localhost'));
      for (const match of value.matchAll(/https:\/\/raw\.githubusercontent\.com\/vioproduct1-sudo\/VIO\/main\/(msx\/[^\s]+\.json)/g)) {
        assert(files.has(match[1]), 'Отсутствует ' + match[1]);
      }
      if (value.startsWith(DEFAULT_BASE + '/public/assets/')) assert(!/poster-(throne|synthesis)/.test(value));
    } else if (value && typeof value === 'object') Object.values(value).forEach(visit);
  }
  for (const file of files.values()) visit(file);
  assert.equal(files.size, 9);
  assert.equal(files.get('msx/start.json').parameter, 'content:' + DEFAULT_BASE + '/msx/content/home.json');
});

test('MSX: опубликованные JSON совпадают с генератором', async () => {
  for (const [path, value] of buildStaticFiles()) {
    assert.deepEqual(JSON.parse(await readFile(new URL('../' + path, import.meta.url))), value, path);
  }
});

test('MSX: можно экспортировать под другим HTTPS-адресом', () => {
  const files = buildStaticFiles('https://example.org/VIO/');
  assert.equal(files.get('msx/start.json').parameter, 'content:https://example.org/VIO/msx/content/home.json');
  assert.throws(() => buildStaticFiles('http://example.org'));
});
