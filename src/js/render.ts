import type { Product } from './types.ts';

// Безпечна функція для отримання DOM-елементів
const getElement = <T extends HTMLElement>(selector: string): T => {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`Елемент не знайдено: ${selector}`);
  return el as T;
};

const listEl = getElement<HTMLElement>('[data-role="list"]');
const emptyEl = getElement<HTMLElement>('[data-role="empty"]');

const formatPrice = (n: number): string => new Intl.NumberFormat('uk-UA').format(Math.round(n));

const createPlaceholder = (name: string): HTMLDivElement => {
  const div = document.createElement('div');
  div.className = 'card__img card__img--placeholder';
  div.textContent = name.charAt(0).toUpperCase();
  return div;
};

const createCard = (product: Product): HTMLElement => {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.id = product.id;
  if (!product.available) card.classList.add('card--unavailable');

  let img: HTMLElement;
  if (product.image) {
    const imgEl = document.createElement('img');
    imgEl.className = 'card__img';
    imgEl.src = product.image;
    imgEl.alt = product.name;
    imgEl.onerror = function () {
      this.replaceWith(createPlaceholder(product.name));
    };
    img = imgEl;
  } else {
    img = createPlaceholder(product.name);
  }
  card.append(img);

  const body = document.createElement('div');
  body.className = 'card__body';

  const title = document.createElement('h2');
  title.className = 'card__title';
  title.textContent = product.name;
  body.append(title);

  const priceInfo = document.createElement('p');
  priceInfo.className = 'card__text';
  priceInfo.textContent = `${formatPrice(product.price)} ₴ × ${product.quantity} шт.`;
  body.append(priceInfo);

  const sum = document.createElement('p');
  sum.className = 'card__sum';
  sum.textContent = `Сума: ${formatPrice(product.price * product.quantity)} ₴`;
  body.append(sum);

  const status = document.createElement('p');
  status.className = `card__status ${product.available ? 'card__status--in' : 'card__status--out'}`;
  status.textContent = product.available ? '✓ В наявності' : '○ Немає в наявності';
  body.append(status);

  const actions = document.createElement('div');
  actions.className = 'card__actions';
  
  const btnToggle = document.createElement('button');
  btnToggle.type = 'button'; btnToggle.className = 'card__btn card__btn--toggle'; btnToggle.dataset.action = 'toggle'; btnToggle.textContent = 'Змінити наявність';
  const btnEdit = document.createElement('button');
  btnEdit.type = 'button'; btnEdit.className = 'card__btn card__btn--edit'; btnEdit.dataset.action = 'edit'; btnEdit.textContent = 'Редагувати';
  const btnDel = document.createElement('button');
  btnDel.type = 'button'; btnDel.className = 'card__btn card__btn--delete'; btnDel.dataset.action = 'delete'; btnDel.textContent = 'Видалити';
  
  actions.append(btnToggle, btnEdit, btnDel);
  body.append(actions);
  card.append(body);
  return card;
};

const createEditCard = (product: Product): HTMLElement => {
  const card = document.createElement('article');
  card.className = 'card card--editing';
  card.dataset.id = product.id;

  const body = document.createElement('div');
  body.className = 'card__body';

  const fields: { key: keyof Product; label: string; type: string; value: string; max?: number; min?: number }[] = [
    { key: 'name', label: 'Назва', type: 'text', value: product.name, max: 80 },
    { key: 'price', label: 'Ціна', type: 'number', value: String(product.price), min: 1 },
    { key: 'quantity', label: 'Кількість', type: 'number', value: String(product.quantity), min: 1 }
  ];

  fields.forEach((f) => {
    const label = document.createElement('label');
    label.className = 'card__field';
    const span = document.createElement('span');
    span.className = 'card__field-label'; span.textContent = f.label; label.append(span);
    const input = document.createElement('input');
    input.type = f.type; input.value = f.value; input.dataset.field = f.key; input.required = true;
    if (f.max) input.maxLength = f.max;
    if (f.min) input.min = String(f.min);
    label.append(input); body.append(label);
  });

  const actions = document.createElement('div');
  actions.className = 'card__actions';
  const btnSave = document.createElement('button');
  btnSave.type = 'button'; btnSave.className = 'card__btn card__btn--save'; btnSave.dataset.action = 'save'; btnSave.textContent = 'Зберегти';
  const btnCancel = document.createElement('button');
  btnCancel.type = 'button'; btnCancel.className = 'card__btn'; btnCancel.dataset.action = 'cancel'; btnCancel.textContent = 'Скасувати';
  actions.append(btnSave, btnCancel); body.append(actions); card.append(body);
  return card;
};

export const render = {
  renderList: (products: Product[], editingId: string | null) => {
    listEl.replaceChildren();
    if (products.length === 0) { emptyEl.hidden = false; return; }
    emptyEl.hidden = true;
    const fragment = document.createDocumentFragment();
    products.forEach((p) => fragment.append(p.id === editingId ? createEditCard(p) : createCard(p)));
    listEl.append(fragment);
  },
  updateStats: (totalCount: number, filteredProducts: Product[]) => {
    // Використовуємо безпечне отримання елементів
    const countTotalEl = getElement<HTMLElement>('[data-role="count-total"]');
    const countFilteredEl = getElement<HTMLElement>('[data-role="count-filtered"]');
    const totalEl = getElement<HTMLElement>('[data-role="total"]');
    
    const totalSum = filteredProducts.reduce((acc, p) => acc + p.price * p.quantity, 0);
    countTotalEl.textContent = String(totalCount);
    countFilteredEl.textContent = String(filteredProducts.length);
    totalEl.textContent = formatPrice(totalSum);
  }
};