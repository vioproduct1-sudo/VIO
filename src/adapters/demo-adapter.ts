import type { CatalogQuery, MediaItem } from "../domain/media.js";
import type { SourceAdapter } from "./source-adapter.js";

const items: MediaItem[] = [
  {
    id: "welcome",
    title: "Добро пожаловать в VIO",
    description: "Демонстрационная карточка. Подключите собственный легальный источник через адаптер.",
    kind: "video",
    tags: ["демо", "VIO"],
  },
  {
    id: "adapter-guide",
    title: "Система адаптеров",
    description: "Каждый источник изолирован и реализует единый контракт каталога.",
    kind: "video",
    tags: ["разработка", "адаптеры"],
  },
];

export class DemoAdapter implements SourceAdapter {
  readonly descriptor = {
    id: "demo",
    name: "Демонстрационный каталог",
    description: "Безопасные локальные метаданные без внешних видеопотоков.",
    capabilities: ["catalog", "search"] as Array<"catalog" | "search">,
  };

  async list(query: CatalogQuery): Promise<MediaItem[]> {
    const search = query.search?.trim().toLocaleLowerCase("ru");
    const filtered = search
      ? items.filter((item) =>
          `${item.title} ${item.description} ${(item.tags ?? []).join(" ")}`
            .toLocaleLowerCase("ru")
            .includes(search),
        )
      : items;

    return filtered.slice(0, query.limit);
  }

  async getById(id: string): Promise<MediaItem | null> {
    return items.find((item) => item.id === id) ?? null;
  }
}
