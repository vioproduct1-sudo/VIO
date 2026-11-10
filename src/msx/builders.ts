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
      { id: "catalog", label: "Каталог", data: `${baseUrl}/msx/content/catalog.json` },
      { id: "about", label: "О проекте", data: `${baseUrl}/msx/content/about.json` },
    ],
  };
}

export function buildHomeContent() {
  return {
    headline: "VIO",
    type: "pages",
    pages: [
      {
        items: [
          {
            layout: "0,0,8,6",
            label: "VIO — ваша медиатека",
            title: "Универсальная оболочка для Media Station X",
            action: "info:Подключайте только собственные или лицензированные источники через адаптеры VIO.",
          },
          {
            layout: "8,0,4,3",
            label: "Открытая архитектура",
            action: "info:Источники изолированы общим контрактом адаптера.",
          },
          {
            layout: "8,3,4,3",
            label: "Безопасный старт",
            action: "info:В проекте нет нелегальных источников, токенов или секретов.",
          },
        ],
      },
    ],
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
