const BASE_URL = 'https://jsonplaceholder.typicode.com';

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// --- Захисники типу (Type Guards) ---
export function isPost(data: unknown): data is Post {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.userId === 'number' &&
    typeof obj.id === 'number' &&
    typeof obj.title === 'string' &&
    typeof obj.body === 'string'
  );
}

export function isPostArray(data: unknown): data is Post[] {
  return Array.isArray(data) && data.every(isPost);
}

// Додатковий захисник для об'єктів (для users та albums)
export function isObject(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null;
}

export function isObjectArray(data: unknown): data is Record<string, unknown>[] {
  return Array.isArray(data) && data.every(isObject);
}

// --- Узагальнена функція ---
export async function request<T>(
  endpoint: string,
  validator: (data: unknown) => data is T,
  method = 'GET',
  body: unknown = null,
  signal: AbortSignal | null = null
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  
  const config: RequestInit = { method, headers, signal };
  if (body) config.body = JSON.stringify(body);
  
  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new ApiError(response.status, `HTTP ${response.status}`);
  }
  
  const rawData: unknown = await response.json();
  
  if (!validator(rawData)) {
    throw new ApiError(500, 'Невірна структура відповіді від сервера');
  }
  
  return rawData;
}

export async function fetchPosts(
  query = '',
  page = 1,
  limit = 10,
  signal: AbortSignal | null = null
): Promise<Post[]> {
  let endpoint = `/posts?_page=${page}&_limit=${limit}`;
  if (query) endpoint += `&q=${encodeURIComponent(query)}`;
  
  return request<Post[]>(endpoint, isPostArray, 'GET', null, signal);
}

// --- Повертаємо ваші функції ---
export async function fetchSequential(userId: number) {
  const user = await request<Record<string, unknown>>(`/users/${userId}`, isObject);
  const posts = await request<Post[]>(`/posts?userId=${userId}`, isPostArray);
  const albums = await request<Record<string, unknown>[]>(`/albums?userId=${userId}`, isObjectArray);
  return { user, posts, albums };
}

export async function fetchParallel(userId: number) {
  const [user, posts, albums] = await Promise.all([
    request<Record<string, unknown>>(`/users/${userId}`, isObject), 
    request<Post[]>(`/posts?userId=${userId}`, isPostArray), 
    request<Record<string, unknown>[]>(`/albums?userId=${userId}`, isObjectArray)
  ]);
  return { user, posts, albums };
}

export async function fetchAllSettledDemo(userId: number) {
  return Promise.allSettled([
    request<Record<string, unknown>>(`/users/${userId}`, isObject), 
    request<Post[]>(`/posts?userId=${userId}`, isPostArray), 
    request<Record<string, unknown>[]>(`/albums/9999999`, isObjectArray) // Спеціально викликаємо 404
  ]);
}