import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { createApp } from "./app.js";

const app = createApp({ port: 3000, publicBaseUrl: "https://vio.example" });

describe("VIO API", () => {
  it("возвращает состояние сервиса", async () => {
    const response = await request(app).get("/health");
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { status: "ok" });
  });

  it("формирует стартовый объект MSX", async () => {
    const response = await request(app).get("/msx/start.json");
    assert.equal(response.status, 200);
    assert.equal(response.headers["access-control-allow-origin"], "*");
    assert.deepEqual(response.body, {
      name: "VIO",
      version: "0.1.0",
      parameter: "menu:https://vio.example/msx/menu.json",
    });
  });

  it("публикует меню с абсолютными URL", async () => {
    const response = await request(app).get("/msx/menu.json");
    assert.equal(response.status, 200);
    assert.equal(response.body.menu.length, 3);
    assert.equal(response.body.menu[0].data, "https://vio.example/msx/content/home.json");
  });

  it("выдаёт список адаптеров и ищет в каталоге", async () => {
    const sources = await request(app).get("/api/v1/sources");
    assert.equal(sources.body.data[0].id, "demo");

    const catalog = await request(app).get("/api/v1/catalog?search=контракт");
    assert.equal(catalog.status, 200);
    assert.equal(catalog.body.data.length, 1);
    assert.equal(catalog.body.data[0].id, "adapter-guide");
  });

  it("возвращает понятную ошибку для неизвестного источника", async () => {
    const response = await request(app).get("/api/v1/catalog?source=unknown");
    assert.equal(response.status, 404);
    assert.equal(response.body.error, "Источник не найден");
  });
});

