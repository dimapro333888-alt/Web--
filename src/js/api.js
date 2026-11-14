const BASE_URL = 'https://jsonplaceholder.typicode.com';

export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}

export async function request(endpoint, method = 'GET', body = null, signal = null) {
    const headers = { 'Accept': 'application/json' };
    if (body) headers['Content-Type'] = 'application/json';
    
    const config = { method, headers, signal };
    if (body) config.body = JSON.stringify(body);

    let attempt = 0;
    const maxRetries = 3;
    let delay = 500;

    while (attempt < maxRetries) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, config);

            if (!response.ok) {
                throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
            }

            try {
                return await response.json();
            } catch (jsonError) {
                throw new Error('Помилка обробки JSON-відповіді');
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                throw error;
            }

            if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                throw error;
            }

            attempt++;
            
            if (attempt >= maxRetries) {
                throw error;
            }

            console.warn(`Спроба ${attempt} не вдалася (${error.message}). Повтор через ${delay} мс...`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
}

export async function fetchPosts(query = '', page = 1, limit = 10, signal = null) {
    let endpoint = `/posts?_page=${page}&_limit=${limit}`;
    if (query) {
        endpoint += `&q=${encodeURIComponent(query)}`;
    }
    return request(endpoint, 'GET', null, signal);
}
export async function fetchSequential(userId) {
    const user = await request(`/users/${userId}`);
    const posts = await request(`/posts?userId=${userId}`);
    const albums = await request(`/albums?userId=${userId}`);
    return { user, posts, albums };
}

export async function fetchParallel(userId) {
    const [user, posts, albums] = await Promise.all([
        request(`/users/${userId}`),
        request(`/posts?userId=${userId}`),
        request(`/albums?userId=${userId}`)
    ]);
    return { user, posts, albums };
}

export async function fetchAllSettledDemo(userId) {
    return Promise.allSettled([
        request(`/users/${userId}`),
        request(`/posts?userId=${userId}`),
        request(`/albums/9999999`) 
    ]);
}