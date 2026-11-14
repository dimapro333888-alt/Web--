import { debounce, safeReadLocalStorage, safeWriteLocalStorage } from './utils.js';
import { fetchPosts, fetchSequential, fetchParallel, fetchAllSettledDemo } from './api.js';

const searchInput = document.getElementById('search-input');
const statusEl = document.getElementById('status');
const listEl = document.getElementById('posts-list');
const loadMoreBtn = document.getElementById('load-more');

const LIMIT = 10;
const CACHE_KEY = 'lab4_posts_cache';
const CACHE_TTL = 5 * 60 * 1000;

let currentController = null;
let currentPage = 1;
let currentQuery = '';

const showLoading = () => {
    statusEl.textContent = 'Завантаження...';
    statusEl.style.color = 'var(--color-text-muted)';
};

const showError = (message, onRetry) => {
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
    retryBtn.addEventListener('click', onRetry);
    
    errorBox.append(text, retryBtn);
    listEl.append(errorBox);
};

const showEmpty = () => {
    statusEl.textContent = 'За вашим запитом нічого не знайдено';
    listEl.replaceChildren();
    loadMoreBtn.hidden = true;
};

const renderPosts = (posts, isAppend) => {
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

const saveCache = (posts) => {
    const cacheData = {
        timestamp: Date.now(),
        data: posts
    };
    safeWriteLocalStorage(CACHE_KEY, cacheData);
};

const loadCache = () => {
    const cached = safeReadLocalStorage(CACHE_KEY);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
    if (isExpired) {
        return null;
    }
    return cached.data;
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
        
        if (!isAppend && query === '' && currentPage === 1) {
            saveCache(posts);
        }

        if (posts.length < LIMIT) {
            loadMoreBtn.hidden = true;
        } else {
            loadMoreBtn.hidden = false;
        }
    } catch (error) {
        if (error.name === 'AbortError') return;
        
        if (error.name === 'TimeoutError') {
            showError('Перевищено час очікування (5 секунд). Сервер не відповідає.', () => loadData(query, isAppend));
        } else if (error.message === 'Failed to fetch') {
            showError('Немає з’єднання з мережею. Перевірте інтернет.', () => loadData(query, isAppend));
        } else {
            showError(`Помилка: ${error.message}`, () => loadData(query, isAppend));
        }
    } finally {
        loadMoreBtn.disabled = false;
    }
};

const handleSearch = debounce((e) => {
    currentPage = 1;
    currentQuery = e.target.value;
    loadData(currentQuery, false);
}, 400);

searchInput.addEventListener('input', handleSearch);

loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    loadData(currentQuery, true);
});

document.getElementById('test-parallel').addEventListener('click', async () => {
    console.log('%c--- ПОЧАТОК ТЕСТУ ---', 'color: blue; font-weight: bold;');
    
    console.time('Послідовно');
    await fetchSequential(1);
    console.timeEnd('Послідовно');

    console.time('Promise.all');
    await fetchParallel(1);
    console.timeEnd('Promise.all');

    console.log('%c--- Promise.allSettled ---', 'color: orange; font-weight: bold;');
    const results = await fetchAllSettledDemo(1);
    results.forEach((res, index) => {
        if (res.status === 'fulfilled') {
            console.log(`Запит ${index + 1}: Успіх (отримано ${Array.isArray(res.value) ? res.value.length + ' елементів' : 'об\'єкт'})`);
        } else {
            console.error(`Запит ${index + 1}: Помилка (${res.reason.message})`);
        }
    });
});

const init = () => {
    const cachedPosts = loadCache();
    if (cachedPosts) {
        renderPosts(cachedPosts, false);
        statusEl.textContent = 'Показано збережені дані. Оновлення...';
        statusEl.style.color = 'var(--color-text-muted)';
    }
    loadData('', false);
};

init();