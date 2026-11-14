(function (App) {
    "use strict";

    const stored = App.storage.load();
    const products = stored !== null ? stored : App.storage.getDefault();
    if (stored === null) {
        App.storage.save(products);
    }

    App.events.bind(products);

    console.log("[Shop] namespace:", Object.keys(App));
    console.log("[Shop] товарів:", products.length);
})(window.App = window.App || {});