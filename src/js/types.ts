export interface Product {
  readonly id: string;
  name: string;
  price: number;
  quantity: number;
  available: boolean;
  category: string;
  image: string | null;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

// --- Утилітарні типи (Пункт 6) ---
export type ProductDraft = Omit<Product, 'id'>;       // 1. Omit (створення без id)
export type ProductPatch = Partial<Product>;          // 2. Partial (часткове оновлення)
export type ProductSummary = Pick<Product, 'id' | 'name' | 'price'>; // 3. Pick (скорочене подання для списку)
export type ReadonlyCategory = Readonly<Category>;    // 4. Readonly (захист від змін)

// Дискриміноване об'єднання для стану
export type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
  | { status: 'empty' };