import type { SourceAdapter, SourceDescriptor } from "./source-adapter.js";

export class AdapterRegistry {
  private readonly adapters = new Map<string, SourceAdapter>();

  register(adapter: SourceAdapter): this {
    const { id } = adapter.descriptor;
    if (this.adapters.has(id)) {
      throw new Error(`Адаптер с идентификатором "${id}" уже зарегистрирован`);
    }
    this.adapters.set(id, adapter);
    return this;
  }

  get(id: string): SourceAdapter | undefined {
    return this.adapters.get(id);
  }

  list(): SourceDescriptor[] {
    return [...this.adapters.values()].map(({ descriptor }) => descriptor);
  }
}
