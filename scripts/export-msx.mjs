import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import * as builders from '../src/msx/builders.ts';

export const DEFAULT_BASE = 'https://raw.githubusercontent.com/vioproduct1-sudo/VIO/main';
export function buildStaticFiles(base = DEFAULT_BASE) {
  base = base.replace(/\/$/, '');
  if (new URL(base).protocol !== 'https:') throw new Error('Нужен публичный HTTPS URL');
  const files = new Map([
    ['msx/start.json', builders.buildStartObject(base)],
    ['msx/menu.json', builders.buildMenuObject(base)],
    ['msx/content/home.json', builders.buildHomeContent(base)],
    ['msx/content/movies.json', builders.buildMoviesContent(base)],
    ['msx/content/series.json', builders.buildSeriesContent(base)],
    ['msx/content/tv.json', builders.buildTvContent(base)],
    ['msx/content/settings.json', builders.buildSettingsContent(base)],
    ['msx/content/catalog.json', builders.buildMoviesContent(base)],
    ['msx/content/about.json', builders.buildAboutContent()],
  ]);
  function rewrite(value) {
    if (Array.isArray(value)) return value.map(rewrite);
    if (value && typeof value === 'object') {
      const result = Object.fromEntries(Object.entries(value).map(([key, v]) => [key, rewrite(v)]));
      if (result.label === 'Диагностика') {
        result.title = 'VIO загружается прямо с GitHub';
        result.action = 'info:Статическая версия VIO. Отдельный сервер не требуется. API и защищённая админка в этом режиме не работают.';
      }
      return result;
    }
    if (typeof value === 'string' && value.startsWith(base + '/assets/')) {
      // Эти два демонстрационных постера отсутствуют в исходном репозитории.
      value = value.replace('poster-throne.png', 'poster-north.png').replace('poster-synthesis.png', 'poster-orbit.png');
      return value.replace(base + '/assets/', base + '/public/assets/');
    }
    return value;
  }
  return new Map([...files].map(([path, value]) => [path, rewrite(value)]));
}

export async function exportMsx(output = '.', base = DEFAULT_BASE) {
  const files = buildStaticFiles(base);
  for (const [path, data] of files) {
    const target = resolve(output, path);
    await mkdir(resolve(target, '..'), { recursive: true });
    await writeFile(target, JSON.stringify(data, null, 2) + '\n');
  }
  return files;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = await exportMsx(process.argv[2] || '.', process.env.MSX_BASE_URL || DEFAULT_BASE);
  console.log(`VIO: экспортировано ${files.size} JSON-файлов MSX`);
}
