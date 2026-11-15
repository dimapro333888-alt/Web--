export class Repository<T extends { id: string | number }> {
  private items = new Map<string | number, T>();

  constructor(initialItems: T[] = []) {
    initialItems.forEach((item) => this.items.set(item.id, item));
  }

  add(item: T): void {
    this.items.set(item.id, item);
  }

  get(id: string | number): T | undefined {
    return this.items.get(id);
  }

  update(id: string | number, patch: Partial<Omit<T, 'id'>>): T | undefined {
    const current = this.items.get(id);
    if (!current) return undefined;
    
    // TypeScript 6 сам розуміє, що тут утворюється тип T
    const next = { ...current, ...patch }; 
    this.items.set(id, next);
    return next;
  }

  remove(id: string | number): boolean {
    return this.items.delete(id);
  }

  list(): T[] {
    return Array.from(this.items.values());
  }
}