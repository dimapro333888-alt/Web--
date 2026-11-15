import '../styles/main.scss';
import { debounce } from './utils.ts';
import { fetchPosts, fetchSequential, fetchParallel, fetchAllSettledDemo, type Post } from './api.ts';

const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
const statusEl = document.getElementById('status');
const listEl = document.getElementById('posts-list');
const loadMoreBtn = document.getElementById('load-more') as HTMLButtonElement | null;

if (!searchInput || !statusEl || !listEl || !loadMoreBtn) {
  throw new Error('Не знайдено необхідні DOM-елементи для сторінки API');
}

const LIMIT = 10;
let currentController: AbortController | null = null;
let currentPage = 1;
let currentQuery = '';

const showLoading = () => {
  statusEl.textContent = 'Завантаження...';
  statusEl.style.color = 'var(--color-text-muted)';
};

const showError = (message: string, onRetry: () => void) => {
  statusEl.textContent = '';
  listEl.replaceChildren();
  loadMoreBtn.hidden = true;

  const errorBox = document.createElement('div');
  errorBox.className = 'api-error';

  const text = document.createElement('p');
  text.textContent = message;
  text.style.color = '#c0392b';

  const retryBtn = document.createElement('button');
  retryBtn.className = 'main__btn main__btn--primary';
  retryBtn.textContent = 'Спробувати ще раз';
  retryBtn.addEventListener('click', () => { void onRetry(); });

  errorBox.append(text, retryBtn);
  listEl.append(errorBox);
};

const showEmpty = () => {
  statusEl.textContent = 'За вашим запитом нічого не знайдено';
  listEl.replaceChildren();
  loadMoreBtn.hidden = true;
};

const renderPosts = (posts: Post[], isAppend: boolean) => {
  statusEl.textContent = '';

  if (!isAppend) {
    listEl.replaceChildren();
  }

  if (posts.length === 0 && !isAppend) {
    showEmpty();
    return;
  }

  const fragment = document.createDocumentFragment();

  posts.forEach((post) => {
    const card = document.createElement('article');
    card.className = 'card';

    const title = document.createElement('h2');
    title.className = 'card__title';
    title.textContent = post.title;
    card.append(title);

    const text = document.createElement('p');
    text.className = 'card__text';
    text.textContent = post.body;
    card.append(text);

    fragment.append(card);
  });

  listEl.append(fragment);
};

const loadData = async (query = '', isAppend = false) => {
  if (currentController) {
    currentController.abort();
  }

  currentController = new AbortController();
  const signal = AbortSignal.any([currentController.signal, AbortSignal.timeout(5000)]);

  showLoading();
  loadMoreBtn.disabled = true;

  try {
    const posts = await fetchPosts(query, currentPage, LIMIT, signal);
    renderPosts(posts, isAppend);

    if (posts.length < LIMIT) {
      loadMoreBtn.hidden = true;
    } else {
      loadMoreBtn.hidden = false;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') return;

      if (error.name === 'TimeoutError') {
        showError('Перевищено час очікування (5 секунд).', () => { void loadData(query, isAppend); });
      } else if (error.message === 'Failed to fetch') {
        showError('Немає з’єднання з мережею.', () => { void loadData(query, isAppend); });
      } else {
        showError(`Помилка: ${error.message}`, () => { void loadData(query, isAppend); });
      }
    } else {
      showError('Сталася невідома помилка', () => { void loadData(query, isAppend); });
    }
  } finally {
    loadMoreBtn.disabled = false;
  }
};

const handleSearch = debounce((e: Event) => {
  const target = e.currentTarget as HTMLInputElement;
  currentPage = 1;
  currentQuery = target.value;
  void loadData(currentQuery, false); // Додано void
}, 400);

searchInput.addEventListener('input', handleSearch);

loadMoreBtn.addEventListener('click', () => {
  currentPage++;
  void loadData(currentQuery, true); // Додано void
});

document.getElementById('test-parallel')?.addEventListener('click', () => {
  // Обгортаємо асинхронну функцію, щоб лінтер не сварився
  void (async () => {
    console.log('%c--- ПОЧАТОК ТЕСТУ ---', 'color: blue; font-weight: bold;');

    console.time('Послідовно');
    await fetchSequential(1);
    console.timeEnd('Послідовно');

    console.time('Promise.all');
    await fetchParallel(1);
    console.timeEnd('Promise.all');

    console.log('%c--- Promise.allSettled ---', 'color: orange; font-weight: bold;');
    const results = await fetchAllSettledDemo(1);

    results.forEach((res: PromiseSettledResult<unknown>, index: number) => {
      if (res.status === 'fulfilled') {
        console.log(`Запит ${index + 1}: Успіх`);
      } else {
        console.error(`Запит ${index + 1}: Помилка`);
      }
    });

    void loadData('', false); // Додано void
  })();
});