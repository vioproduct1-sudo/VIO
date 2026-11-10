export type MediaKind = "movie" | "series" | "video" | "audio" | "image";

export type MediaItem = {
  id: string;
  title: string;
  description: string;
  kind: MediaKind;
  year?: number;
  posterUrl?: string;
  mediaUrl?: string;
  tags?: string[];
};

export type CatalogQuery = {
  search?: string;
  limit: number;
};
