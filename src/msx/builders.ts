import type { MediaItem } from "../domain/media.js";

export function buildStartObject(baseUrl: string) {
  return {
    name: "VIO",
    version: "0.1.0",
    parameter: `menu:${baseUrl}/msx/menu.json`,
  };
}

export function buildMenuObject(baseUrl: string) {
  return {
    headline: "VIO",
    menu: [
      { id: "home", label: "Главная", data: `${baseUrl}/msx/content/home.json` },
      { id: "movies", label: "Фильмы", data: `${baseUrl}/msx/content/movies.json` },
      { id: "series", label: "Сериалы", data: `${baseUrl}/msx/content/series.json` },
      { id: "tv", label: "ТВ", data: `${baseUrl}/msx/content/tv.json` },
      { id: "settings", label: "Настройки", data: `${baseUrl}/msx/content/settings.json` },
    ],
  };
}

function poster(baseUrl: string, file: string, title: string, description: string, layout: string) {
  return {
    layout,
    label: title,
    title: description,
    image: `${baseUrl}/assets/${file}`,
    action: `info:${description}`,
  };
}

export function buildHomeContent(baseUrl: string) {
  return {
    headline: "VIO · Твоё кино. Твой выбор.",
    background: `${baseUrl}/assets/hero.png`,
    type: "pages",
    pages: [
      {
        items: [
          {
            layout: "0,0,7,6",
            label: "Добро пожаловать в VIO",
            title: "Современная медиатека для фильмов, сериалов и телевидения",
            image: `${baseUrl}/assets/hero.png`,
            action: "info:VIO объединяет ваши разрешённые источники в одном удобном интерфейсе.",
          },
          poster(baseUrl, "poster-orbit.png", "За пределами орбиты", "Фантастическое путешествие к неизведанному берегу.", "7,0,2,6"),
          poster(baseUrl, "poster-noir.png", "Город дождя", "Мрачный детектив в неоновом мегаполисе.", "9,0,3,6"),
        ],
      },
    ],
  };
}

export function buildMoviesContent(baseUrl: string) {
  return {
    headline: "Фильмы",
    background: `${baseUrl}/assets/hero.png`,
    type: "pages",
    pages: [{
      items: [
        poster(baseUrl, "poster-orbit.png", "За пределами орбиты", "Фантастика · 2026 · Демонстрационная карточка", "0,0,3,6"),
        poster(baseUrl, "poster-noir.png", "Город дождя", "Детектив · 2026 · Демонстрационная карточка", "3,0,3,6"),
        poster(baseUrl, "poster-north.png", "Северный свет", "Документальный · 2026 · Демонстрационная карточка", "6,0,3,6"),
        poster(baseUrl, "poster-robot.png", "Робот и волшебный лес", "Семейный · 2026 · Демонстрационная карточка", "9,0,3,6"),
      ],
    }],
  };
}

export function buildSeriesContent(baseUrl: string) {
  return {
    headline: "Сериалы",
    background: `${baseUrl}/assets/hero.png`,
    type: "pages",
    pages: [{
      items: [
        poster(baseUrl, "poster-noir.png", "Город дождя", "Сезон 1 · 8 серий · Детектив", "0,0,4,6"),
        poster(baseUrl, "poster-orbit.png", "Новая орбита", "Сезон 1 · 6 серий · Фантастика", "4,0,4,6"),
        poster(baseUrl, "poster-robot.png", "Лесные истории", "Сезон 1 · 10 серий · Для всей семьи", "8,0,4,6"),
      ],
    }],
  };
}

export function buildTvContent(baseUrl: string) {
  return {
    headline: "ТВ",
    background: `${baseUrl}/assets/poster-north.png`,
    type: "pages",
    pages: [{
      items: [
        poster(baseUrl, "poster-north.png", "VIO Природа", "Демонстрационный канал · эфир недоступен", "0,0,4,6"),
        poster(baseUrl, "poster-orbit.png", "VIO Космос", "Демонстрационный канал · эфир недоступен", "4,0,4,6"),
        poster(baseUrl, "poster-robot.png", "VIO Семья", "Демонстрационный канал · эфир недоступен", "8,0,4,6"),
      ],
    }],
  };
}

export function buildSettingsContent() {
  return {
    headline: "Настройки",
    type: "list",
    pages: [{
      items: [
        { layout: "0,0,12,2", label: "Источники", title: "Подключение личных и лицензированных медиатек", action: "info:Источники добавляются через адаптеры VIO на сервере." },
        { layout: "0,2,12,2", label: "Диагностика", title: "Проверка сервера и доступности каталогов", action: "info:Сервер VIO работает. Адрес проверки: /health" },
        { layout: "0,4,12,2", label: "О VIO", title: "Версия 0.1.0", action: "info:VIO — независимая русскоязычная оболочка для Media Station X." },
      ],
    }],
  };
}

export function buildCatalogContent(items: MediaItem[]) {
  return {
    headline: "Каталог",
    type: "pages",
    pages: [
      {
        items: items.map((item, index) => ({
          layout: `${(index % 3) * 4},0,4,6`,
          label: item.title,
          title: item.description,
          ...(item.posterUrl ? { image: item.posterUrl } : {}),
          action: item.mediaUrl
            ? `${item.kind === "audio" ? "audio" : "video"}:${item.mediaUrl}`
            : `info:${item.description}`,
        })),
      },
    ],
  };
}

export function buildAboutContent() {
  return {
    headline: "О проекте",
    type: "list",
    pages: [
      {
        items: [
          {
            layout: "0,0,12,2",
            label: "VIO 0.1.0",
            title: "Русскоязычная универсальная медиаоболочка",
            action: "info:VIO — независимый открытый проект для Media Station X.",
          },
          {
            layout: "0,2,12,2",
            label: "Правила источников",
            action: "info:Используйте только контент, на который у вас есть права или разрешение.",
          },
          {
            layout: "0,4,12,2",
            label: "API",
            action: "info:Список источников доступен по /api/v1/sources, каталог — по /api/v1/catalog.",
          },
        ],
      },
    ],
  };
}

