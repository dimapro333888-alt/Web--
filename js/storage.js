(function (App) {
    "use strict";

    const KEY = "shop-products-v1";

    const uuid = () => {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            try { return crypto.randomUUID(); } catch (_) { /* fallback */ }
        }
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : ((r & 0x3) | 0x8);
            return v.toString(16);
        });
    };

    const getDefault = () => [
        { id: uuid(), name: "Смартфон Galaxy X",   price: 12999, quantity: 5,  available: true,  category: "phone",       image: "img/phone.jpg" },
        { id: uuid(), name: "Ноутбук Pro 15",      price: 34999, quantity: 3,  available: true,  category: "laptop",      image: "img/laptop.jpg" },
        { id: uuid(), name: "Навушники AirSound",  price: 2499,  quantity: 10, available: true,  category: "headphones",  image: "img/headphones.jpg" },
        { id: uuid(), name: "Планшет Tab Mini",    price: 7999,  quantity: 7,  available: false, category: "phone",       image: "img/tablet.jpg" },
        { id: uuid(), name: "Смарт-годинник Fit",  price: 4999,  quantity: 12, available: true,  category: "accessories", image: "img/watch.jpg" },
        { id: uuid(), name: "Камера ActionCam",    price: 9999,  quantity: 4,  available: true,  category: "accessories", image: "img/camera.jpg" },
        { id: uuid(), name: "Клавіатура MechPro",  price: 2999,  quantity: 15, available: true,  category: "accessories", image: "img/keyboard.jpg" },
        { id: uuid(), name: "Мишка Gaming X",      price: 1499,  quantity: 20, available: false, category: "accessories", image: "img/mouse.jpg" }
    ];

    const load = () => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw === null) return null;
            const data = JSON.parse(raw);
            if (!Array.isArray(data)) return null;
            return data
                .filter((p) => p && typeof p === "object" &&
                    typeof p.id === "string" &&
                    typeof p.name === "string" &&
                    typeof p.price === "number" &&
                    typeof p.quantity === "number")
                .map((p) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    quantity: p.quantity,
                    available: Boolean(p.available),
                    category: typeof p.category === "string" ? p.category : "accessories",
                    image: typeof p.image === "string" ? p.image : null
                }));
        } catch (_) {
            return null;
        }
    };

    const save = (items) => {
        try { localStorage.setItem(KEY, JSON.stringify(items)); }
        catch (e) { console.error("Не вдалося зберегти:", e); }
    };

    const clear = () => {
        try { localStorage.removeItem(KEY); } catch (_) { /* noop */ }
    };

    App.storage = { load, save, clear, uuid, getDefault };
})(window.App = window.App || {});