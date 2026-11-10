import express, { type Request } from "express";
import { z } from "zod";
import { AdapterRegistry } from "./adapters/adapter-registry.js";
import { DemoAdapter } from "./adapters/demo-adapter.js";
import type { AppConfig } from "./config.js";
import {
  buildAboutContent,
  buildCatalogContent,
  buildHomeContent,
  buildMenuObject,
  buildStartObject,
} from "./msx/builders.js";

const catalogQuerySchema = z.object({
  source: z.string().trim().min(1).default("demo"),
  search: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

function requestBaseUrl(request: Request, config: AppConfig): string {
  return (config.publicBaseUrl ?? `${request.protocol}://${request.get("host")}`).replace(/\/$/, "");
}

export function createApp(config: AppConfig, registry = new AdapterRegistry().register(new DemoAdapter())) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", true);
  app.use(express.json({ limit: "100kb" }));
  app.use((_request, response, next) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (_request.method === "OPTIONS") return response.sendStatus(204);
    next();
  });

  app.get("/", (_request, response) => {
    response.json({ name: "VIO", version: "0.1.0", msx: "/msx/start.json", api: "/api/v1" });
  });

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.get("/api/v1/sources", (_request, response) => {
    response.json({ data: registry.list() });
  });

  app.get("/api/v1/catalog", async (request, response) => {
    const parsed = catalogQuerySchema.safeParse(request.query);
    if (!parsed.success) return response.status(400).json({ error: "Некорректные параметры", details: parsed.error.issues });

    const adapter = registry.get(parsed.data.source);
    if (!adapter) return response.status(404).json({ error: "Источник не найден" });

    const data = await adapter.list({ search: parsed.data.search, limit: parsed.data.limit });
    return response.json({ data, source: adapter.descriptor });
  });

  app.get("/api/v1/catalog/:source/:id", async (request, response) => {
    const adapter = registry.get(request.params.source);
    if (!adapter) return response.status(404).json({ error: "Источник не найден" });
    const item = await adapter.getById(request.params.id);
    if (!item) return response.status(404).json({ error: "Материал не найден" });
    return response.json({ data: item });
  });

  app.get("/msx/start.json", (request, response) => {
    response.json(buildStartObject(requestBaseUrl(request, config)));
  });

  app.get("/msx/menu.json", (request, response) => {
    response.json(buildMenuObject(requestBaseUrl(request, config)));
  });

  app.get("/msx/content/home.json", (_request, response) => {
    response.json(buildHomeContent());
  });

  app.get("/msx/content/catalog.json", async (_request, response) => {
    const adapter = registry.get("demo");
    const items = adapter ? await adapter.list({ limit: 30 }) : [];
    response.json(buildCatalogContent(items));
  });

  app.get("/msx/content/about.json", (_request, response) => {
    response.json(buildAboutContent());
  });

  app.use((_request, response) => {
    response.status(404).json({ error: "Маршрут не найден" });
  });

  return app;
}
