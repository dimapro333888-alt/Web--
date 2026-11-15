import '../styles/main.scss';
import { storage } from './storage.ts';
import { events } from './events.ts';
import type { Product } from './types.ts';

const stored = storage.load();
const products: Product[] = stored !== null ? stored : storage.getDefault();
if (stored === null) storage.save(products);

events.bind(products);

const apiUrl = import.meta.env.VITE_API_URL;
const footer = document.querySelector('.footer__text');
if (footer) footer.textContent += ` | API: ${apiUrl}`;