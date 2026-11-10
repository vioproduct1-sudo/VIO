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
      version: "0.2.0",
      parameter: "content:https://vio.example/msx/content/home.json",
    });
  });

  it("показывает компактный каталог без бокового меню", async () => {
    const response = await request(app).get("/msx/content/series.json");
    assert.equal(response.status, 200);
    assert.equal(response.body.compress, true);
    assert.equal(response.body.pages[0].items[0].label, "VIO");
    assert.match(response.body.pages[0].items[10].image, /poster-noir\.png$/);
  });

  it("оставляет подключение iEdem внутри вкладки ТВ", async () => {
    const response = await request(app).get("/msx/content/tv.json");
    assert.equal(response.status, 200);
    const iedem = response.body.pages[0].items.find((item: { label?: string }) => item.label === "iEdem TV");
    assert.equal(iedem.action, "link:https://ott-play.com/edem/");
  });

  it("публикует меню с абсолютными URL", async () => {
    const response = await request(app).get("/msx/menu.json");
    assert.equal(response.status, 200);
    assert.equal(response.body.menu.length, 5);
    assert.equal(response.body.menu[0].data, "https://vio.example/msx/content/home.json");
    assert.equal(response.body.menu[1].label, "Фильмы");
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

