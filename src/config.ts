import { z } from "zod";

const environmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  PUBLIC_BASE_URL: z.string().url().optional().or(z.literal("")),
});

export type AppConfig = {
  port: number;
  publicBaseUrl?: string;
};

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = environmentSchema.parse(environment);

  return {
    port: parsed.PORT,
    publicBaseUrl: parsed.PUBLIC_BASE_URL || undefined,
  };
}
