import type { CatalogQuery, MediaItem } from "../domain/media.js";

export type SourceDescriptor = {
  id: string;
  name: string;
  description: string;
  capabilities: Array<"catalog" | "search" | "playback">;
};

export interface SourceAdapter {
  readonly descriptor: SourceDescriptor;
  list(query: CatalogQuery): Promise<MediaItem[]>;
  getById(id: string): Promise<MediaItem | null>;
}
