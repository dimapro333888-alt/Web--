/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // сюди можна додати інші змінні, якщо вони є
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}