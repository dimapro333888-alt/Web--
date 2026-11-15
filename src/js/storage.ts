import type { Product } from './types.ts';

const KEY = 'shop-products-v1';

export const storage = {
  load: (): Product[] | null => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw === null) return null;
      
      // Вказуємо unknown замість any
      const data: unknown = JSON.parse(raw);
      
      if (!Array.isArray(data)) return null;
      
      // Перевіряємо структуру кожного елемента
      return data.filter((p: unknown): p is Product => {
        if (typeof p !== 'object' || p === null) return false;
        const obj = p as Record<string, unknown>;
        return typeof obj.id === 'string';
      });
    } catch {
      return null;
    }
  },
  
  save: (items: Product[]): void => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Помилка збереження:', e);
    }
  },

  getDefault: (): Product[] => [
    { id: crypto.randomUUID(), name: 'Смартфон Galaxy X', price: 12999, quantity: 5, available: true, category: 'phone', image: 'assets/phone.jpg' },
    { id: crypto.randomUUID(), name: 'Ноутбук Pro 15', price: 34999, quantity: 3, available: true, category: 'laptop', image: 'assets/laptop.jpg' },
    { id: crypto.randomUUID(), name: 'Навушники AirSound', price: 2499, quantity: 10, available: true, category: 'headphones', image: 'assets/headphones.jpg' },
    { id: crypto.randomUUID(), name: 'Планшет Tab Mini', price: 7999, quantity: 7, available: false, category: 'phone', image: 'assets/tablet.jpg' },
    { id: crypto.randomUUID(), name: 'Смарт-годинник Fit', price: 4999, quantity: 12, available: true, category: 'accessories', image: 'assets/watch.jpg' },
    { id: crypto.randomUUID(), name: 'Камера ActionCam', price: 9999, quantity: 4, available: true, category: 'accessories', image: 'assets/camera.jpg' },
    { id: crypto.randomUUID(), name: 'Клавіатура MechPro', price: 2999, quantity: 15, available: true, category: 'accessories', image: 'assets/keyboard.jpg' },
    { id: crypto.randomUUID(), name: 'Мишка Gaming X', price: 1499, quantity: 20, available: false, category: 'accessories', image: 'assets/mouse.jpg' }
  ]
};