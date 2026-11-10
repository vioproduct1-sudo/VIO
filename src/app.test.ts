import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

const app = createApp({ port: 3000, publicBaseUrl: "https://vio.example" });

describe("VIO API", () => {
  it("возвращает состояние сервиса", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("формирует стартовый объект MSX", async () => {
    const response = await request(app).get("/msx/start.json");
    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("*");
    expect(response.body).toEqual({
      name: "VIO",
      version: "0.1.0",
      parameter: "menu:https://vio.example/msx/menu.json",
    });
  });

  it("публикует меню с абсолютными URL", async () => {
    const response = await request(app).get("/msx/menu.json");
    expect(response.status).toBe(200);
    expect(response.body.menu).toHaveLength(3);
    expect(response.body.menu[0].data).toBe("https://vio.example/msx/content/home.json");
  });

  it("выдаёт список адаптеров и ищет в каталоге", async () => {
    const sources = await request(app).get("/api/v1/sources");
    expect(sources.body.data[0].id).toBe("demo");

    const catalog = await request(app).get("/api/v1/catalog?search=контракт");
    expect(catalog.status).toBe(200);
    expect(catalog.body.data).toHaveLength(1);
    expect(catalog.body.data[0].id).toBe("adapter-guide");
  });

  it("возвращает понятную ошибку для неизвестного источника", async () => {
    const response = await request(app).get("/api/v1/catalog?source=unknown");
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Источник не найден");
  });
});
