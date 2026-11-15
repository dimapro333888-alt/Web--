// Використовуємо never[] замість unknown[], щоб дозволити передавати конкретні типи (наприклад, Event)
export function debounce<T extends (...args: never[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>): void => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => { fn(...args); }, delay);
  };
}