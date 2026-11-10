import type { MediaItem } from "../domain/media.js";

type Section = "home" | "movies" | "series" | "tv" | "settings";

const POSTERS = [
  { file: "poster-noir.png", title: "Город дождя", meta: "Детектив · 8 серий" },
  { file: "poster-orbit.png", title: "Новая орбита", meta: "Фантастика · 6 серий" },
  { file: "poster-north.png", title: "Северный свет", meta: "Документальный · 5 серий" },
  { file: "poster-robot.png", title: "Лесные истории", meta: "Семейный · 10 серий" },
  { file: "poster-throne.png", title: "Северный трон", meta: "Фэнтези · 9 серий" },
  { file: "poster-synthesis.png", title: "Синтез", meta: "Фантастика · 7 серий" },
] as const;

function navItem(baseUrl: string, section: Section, current: Section, label: string, x: number, width = 2) {
  return {
    type: "button",
    layout: `${x},0,${width},1`,
    label,
    color: section === current ? "msx-blue" : "msx-glass",
    action: `content:${baseUrl}/msx/content/${section}.json`,
  };
}

function navigation(baseUrl: string, current: Section) {
  return [
    navItem(baseUrl, "home", current, "VIO", 0),
    navItem(baseUrl, "home", current, "Главная", 2),
    navItem(baseUrl, "movies", current, "Фильмы", 4),
    navItem(baseUrl, "series", current, "Сериалы", 6),
    navItem(baseUrl, "tv", current, "ТВ", 8),
    navItem(baseUrl, "settings", current, "Настройки", 10, 3),
    { type: "button", layout: "13,0,3,1", label: "Поиск", icon: "search", color: "msx-glass", action: "info:Поиск появится после подключения первого каталога." },
  ];
}

function filters() {
  return [
    { type: "button", layout: "0,1,2,1", label: "Популярное", color: "msx-blue", action: "info:Популярные материалы" },
    { type: "button", layout: "2,1,2,1", label: "Новинки", color: "msx-glass", action: "info:Новые поступления" },
    { type: "button", layout: "4,1,2,1", label: "Жанры", color: "msx-glass", action: "info:Фильтр по жанрам" },
  ];
}

function poster(baseUrl: string, index: number, x: number) {
  const item = POSTERS[index]!;
  return { layout: `${x},2,2,6`, label: item.title, title: item.meta, image: `${baseUrl}/assets/${item.file}`, action: `info:${item.title}{br}${item.meta}{br}{br}Демонстрационная карточка VIO.` };
}

function catalogPage(baseUrl: string, current: Section, headline: string, order: number[]) {
  const selected = POSTERS[order[0]!]!;
  return {
    headline,
    type: "pages",
    compress: true,
    pages: [{ items: [
      ...navigation(baseUrl, current),
      ...filters(),
      ...order.map((index, position) => poster(baseUrl, index, position * 2)),
      {
        type: "button",
        layout: "12,2,4,6",
        label: selected.title,
        title: `${selected.meta}{br}{br}История, которая начинается с одного неверного решения.{br}{br}{ico:play-arrow} Подробнее`,
        image: `${baseUrl}/assets/${selected.file}`,
        color: "msx-glass",
        action: `info:${selected.title}{br}${selected.meta}{br}{br}Это демонстрационная карточка без видеопотока.`,
      },
    ] }],
  };
}

export function buildStartObject(baseUrl: string) {
  return { name: "VIO", version: "0.2.0", parameter: `content:${baseUrl}/msx/content/home.json` };
}

export function buildMenuObject(baseUrl: string) {
  return { headline: "VIO", menu: [
    { id: "home", label: "Главная", data: `${baseUrl}/msx/content/home.json` },
    { id: "movies", label: "Фильмы", data: `${baseUrl}/msx/content/movies.json` },
    { id: "series", label: "Сериалы", data: `${baseUrl}/msx/content/series.json` },
    { id: "tv", label: "ТВ", data: `${baseUrl}/msx/content/tv.json` },
    { id: "settings", label: "Настройки", data: `${baseUrl}/msx/content/settings.json` },
  ] };
}

export function buildHomeContent(baseUrl: string) { return catalogPage(baseUrl, "home", "Смотреть сейчас", [0, 1, 4, 5, 2, 3]); }
export function buildMoviesContent(baseUrl: string) { return catalogPage(baseUrl, "movies", "Фильмы", [1, 4, 0, 5, 3, 2]); }
export function buildSeriesContent(baseUrl: string) { return catalogPage(baseUrl, "series", "Сериалы", [0, 1, 5, 4, 3, 2]); }

export function buildTvContent(baseUrl: string) {
  return {
    headline: "ТВ",
    type: "pages",
    compress: true,
    pages: [{ items: [
      ...navigation(baseUrl, "tv"),
      {
        type: "button", layout: "0,2,7,5", label: "iEdem TV",
        title: "Подключение по личному ключу доступа{br}{br}Нажмите, затем введите ключ из раздела «Доступ» вашего кабинета iEdem.",
        icon: "live-tv", color: "msx-blue", action: "link:https://ott-play.com/edem/",
      },
      {
        type: "button", layout: "7,2,5,5", label: "Как подключить",
        title: "1. Откройте кабинет iEdem{br}2. Скопируйте ключ доступа{br}3. Нажмите iEdem TV и вставьте ключ{br}{br}Ключ хранится в плеере и не попадает в VIO или GitHub.",
        icon: "vpn-key", color: "msx-glass", action: "info:Используйте только собственную активную подписку iEdem. Никому не сообщайте ключ доступа.",
      },
      {
        type: "button", layout: "12,2,4,5", label: "Открыть кабинет",
        title: "Подписка, ключ доступа и выбор сервера", icon: "account-circle", color: "msx-glass", action: "link:https://iedem.tv/playlist",
      },
    ] }],
  };
}

export function buildSettingsContent(baseUrl = "") {
  return {
    headline: "Настройки", type: "pages", compress: true,
    pages: [{ items: [
      ...(baseUrl ? navigation(baseUrl, "settings") : []),
      { type: "button", layout: "0,2,5,4", label: "Источники", title: "Личные и лицензированные каталоги", icon: "source", color: "msx-glass", action: "info:Источники добавляются через адаптеры VIO." },
      { type: "button", layout: "5,2,5,4", label: "Диагностика", title: "Сервер VIO работает", icon: "monitor-heart", color: "msx-glass", action: "info:Адрес проверки сервера: /health" },
      { type: "button", layout: "10,2,6,4", label: "О VIO", title: "Версия 0.2.0{br}Независимая оболочка для Media Station X", icon: "info", color: "msx-blue", action: "info:VIO — открытый независимый проект." },
    ] }],
  };
}

export function buildCatalogContent(items: MediaItem[]) {
  return {
    headline: "Каталог", type: "pages",
    pages: [{ items: items.map((item, index) => ({
      layout: `${(index % 3) * 4},0,4,6`, label: item.title, title: item.description,
      ...(item.posterUrl ? { image: item.posterUrl } : {}),
      action: item.mediaUrl ? `${item.kind === "audio" ? "audio" : "video"}:${item.mediaUrl}` : `info:${item.description}`,
    })) }],
  };
}

export function buildAboutContent() {
  return {
    headline: "О проекте", type: "list",
    pages: [{ items: [
      { layout: "0,0,12,2", label: "VIO 0.2.0", title: "Русскоязычная универсальная медиаоболочка", action: "info:VIO — независимый открытый проект для Media Station X." },
      { layout: "0,2,12,2", label: "Правила источников", action: "info:Используйте только контент, на который у вас есть права или разрешение." },
    ] }],
  };
}

