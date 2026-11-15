import { debounce } from './utils.ts';
import { storage } from './storage.ts';
import { render } from './render.ts';
import { Repository } from './repository.ts';
import type { Product, ProductDraft, ProductPatch } from './types.ts';

const getElement = <T extends HTMLElement>(selector: string): T => {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`Елемент не знайдено: ${selector}`);
  return el as T;
};

export const events = {
  bind: (initialProducts: Product[]) => {
    const repo = new Repository<Product>(initialProducts);
    
    const state = {
      query: '',
      sortBy: 'name-asc',
      categories: new Set(['phone', 'laptop', 'headphones', 'accessories']),
      priceRange: 'all',
      onlyAvailable: false,
      editingId: null as string | null,
    };

    const form = getElement<HTMLFormElement>('[data-role="product-form"]');
    const searchInput = getElement<HTMLInputElement>('[data-role="search"]');
    const sortSelect = getElement<HTMLSelectElement>('[data-role="sort"]');
    const listEl = getElement<HTMLElement>('[data-role="list"]');
    const onlyAvailableEl = getElement<HTMLInputElement>('[data-role="only-available"]');
    const categoryInputs = document.querySelectorAll<HTMLInputElement>('[data-role="category-filters"] input');
    const priceInputs = document.querySelectorAll<HTMLInputElement>('[data-role="price-filters"] input');

    const getFiltered = (): Product[] => {
      const q = state.query.trim().toLowerCase();
      const result = repo.list().filter((p) => {
        if (state.onlyAvailable && !p.available) return false;
        if (!state.categories.has(p.category)) return false;
        if (state.priceRange === 'low' && p.price >= 5000) return false;
        if (state.priceRange === 'mid' && (p.price < 5000 || p.price > 15000)) return false;
        if (state.priceRange === 'high' && p.price <= 15000) return false;
        if (q && !p.name.toLowerCase().includes(q)) return false;
        return true;
      });
      const [field, dir] = state.sortBy.split('-');
      const mult = dir === 'desc' ? -1 : 1;
      return [...result].sort((a, b) => {
        if (field === 'name') return mult * a.name.localeCompare(b.name, 'uk');
        return mult * (a.price - b.price);
      });
    };

    const rerender = (): void => {
      const filtered = getFiltered();
      render.renderList(filtered, state.editingId);
      render.updateStats(repo.list().length, filtered);
    };

    const commit = (): void => {
      storage.save(repo.list());
      rerender();
    };

    const handleSubmit = (e: SubmitEvent): void => {
      e.preventDefault();
      const data = new FormData(form);
      
      const draft: ProductDraft = {
        // Використовуємо as string для уникнення помилки no-base-to-string
        name: (data.get('name') as string).trim(),
        price: Math.round(Number(data.get('price'))),
        quantity: Math.round(Number(data.get('quantity'))),
        available: true,
        category: data.get('category') as string, 
        image: null,
      };
      
      const newProduct: Product = { ...draft, id: crypto.randomUUID() };
      repo.add(newProduct);
      
      commit(); 
      form.reset(); 
      form.hidden = true;
    };

    const handleListClick = (e: MouseEvent): void => {
      const target = e.target as HTMLElement;
      // Вказуємо тип у дужках closest
      const btn = target.closest<HTMLElement>('[data-action]');
      if (!btn) return;
      
      const card = btn.closest<HTMLElement>('.card');
      if (!card || !card.dataset.id) return;
      
      const id = card.dataset.id;
      const action = btn.dataset.action;

      if (action === 'delete') {
        if (!confirm('Видалити товар?')) return;
        repo.remove(id);
        if (state.editingId === id) state.editingId = null;
        commit();
      } else if (action === 'toggle') {
        const p = repo.get(id);
        if (p) { 
          repo.update(id, { available: !p.available }); 
          commit(); 
        }
      } else if (action === 'edit') {
        state.editingId = id; 
        rerender();
      } else if (action === 'cancel') {
        state.editingId = null; 
        rerender();
      } else if (action === 'save') {
        const inputs = card.querySelectorAll<HTMLInputElement>('[data-field]');
        const patch: ProductPatch = {};
        
        inputs.forEach((input) => {
          const field = input.dataset.field as keyof Product;
          if (field === 'name') patch.name = input.value.trim();
          else if (field === 'price') patch.price = Number(input.value);
          else if (field === 'quantity') patch.quantity = Number(input.value);
        });
        
        repo.update(id, patch);
        state.editingId = null; 
        commit();
      }
    };

    const handleSearch = debounce((e: Event): void => {
      const input = e.currentTarget as HTMLInputElement;
      state.query = input.value; 
      rerender();
    }, 300);

    form.addEventListener('submit', handleSubmit);
    
    getElement<HTMLElement>('[data-action="toggle-form"]').addEventListener('click', () => {
      form.hidden = !form.hidden;
      if (!form.hidden) {
        const nameInput = form.elements.namedItem('name') as HTMLInputElement | null;
        if (nameInput) nameInput.focus();
      }
    });
    
    getElement<HTMLElement>('[data-action="cancel-form"]').addEventListener('click', () => {
      form.hidden = true; 
      form.reset();
    });
    
    searchInput.addEventListener('input', handleSearch);
    
    sortSelect.addEventListener('change', (e: Event) => { 
      const select = e.currentTarget as HTMLSelectElement;
      state.sortBy = select.value; 
      rerender(); 
    });
    
    categoryInputs.forEach((cb) => cb.addEventListener('change', () => {
      state.categories = new Set(Array.from(categoryInputs).filter((c) => c.checked).map((c) => c.value));
      rerender();
    }));

    priceInputs.forEach((rb) => rb.addEventListener('change', (e: Event) => {
      const radio = e.currentTarget as HTMLInputElement;
      state.priceRange = radio.value;
      rerender();
    }));

    onlyAvailableEl.addEventListener('change', (e: Event) => { 
      const checkbox = e.currentTarget as HTMLInputElement;
      state.onlyAvailable = checkbox.checked; 
      rerender(); 
    });
    
    listEl.addEventListener('click', handleListClick);

    rerender();
  }
};