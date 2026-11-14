import '../styles/main.scss';
import './storage.js';
import './render.js';
import './events.js';

(function (App) {
    "use strict";

    const stored = App.storage.load();
    const products = stored !== null ? stored : App.storage.getDefault();
    if (stored === null) {
        App.storage.save(products);
    }

    App.events.bind(products);

    const apiUrl = import.meta.env.VITE_API_URL;
    const appTitle = import.meta.env.VITE_APP_TITLE;
    console.log("API URL:", apiUrl);
    console.log("App Title:", appTitle);

    const footer = document.querySelector('.footer__text');
    if (footer) {
        footer.textContent += ` | API: ${apiUrl}`;
    }

    console.log("[Shop] namespace:", Object.keys(App));
    console.log("[Shop] товарів:", products.length);
})(window.App = window.App || {});