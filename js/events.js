(function (App) {
    "use strict";

    const state = {
        products: [],
        query: "",
        sortBy: "name-asc",
        categories: new Set(["phone", "laptop", "headphones", "accessories"]),
        priceRange: "all",
        onlyAvailable: false,
        editingId: null
    };

    const debounce = (fn, delay) => {
        let timerId;
        return (...args) => {
            clearTimeout(timerId);
            timerId = setTimeout(() => fn(...args), delay);
        };
    };

    const form             = document.querySelector('[data-role="product-form"]');
    const searchInput      = document.querySelector('[data-role="search"]');
    const sortSelect       = document.querySelector('[data-role="sort"]');
    const listEl           = document.querySelector('[data-role="list"]');
    const categoryInputs   = document.querySelectorAll('[data-role="category-filters"] input');
    const priceInputs      = document.querySelectorAll('[data-role="price-filters"] input');
    const onlyAvailableEl  = document.querySelector('[data-role="only-available"]');

    const getFiltered = () => {
        const q = state.query.trim().toLowerCase();
        const result = state.products.filter((p) => {
            if (state.onlyAvailable && !p.available) return false;
            if (!state.categories.has(p.category)) return false;
            if (state.priceRange === "low"  && p.price >= 5000) return false;
            if (state.priceRange === "mid"  && (p.price < 5000 || p.price > 15000)) return false;
            if (state.priceRange === "high" && p.price <= 15000) return false;
            if (q && !p.name.toLowerCase().includes(q)) return false;
            return true;
        });

        const [field, dir] = state.sortBy.split("-");
        const mult = dir === "desc" ? -1 : 1;
        return [...result].sort((a, b) =>
            field === "name"
                ? mult * a.name.localeCompare(b.name, "uk")
                : mult * (a.price - b.price)
        );
    };

       const rerender = () => {
        const filtered = getFiltered(); // отримуємо відфільтрований масив
        App.render.renderList(filtered, state.editingId); // малюємо його
        App.render.updateStats(state.products.length, filtered); // передаємо ЗАГАЛЬНУ кількість і ВІДФІЛЬТРОВАНУ
    };

    const commit = () => {
        App.storage.save(state.products);
        rerender();
    };

    const setFieldError = (input, message) => {
        const field = input.closest(".main__field");
        const errorEl = field ? field.querySelector('[data-role="error"]') : null;
        if (errorEl) errorEl.textContent = message || "";
        if (message) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
    };

    const validateForm = () => {
        let ok = true;
        let firstInvalid = null;

        const nameInput  = form.elements.name;
        const priceInput = form.elements.price;
        const qtyInput   = form.elements.quantity;

        const name = String(nameInput.value).trim();
        let nameError = "";
        if (!name)                nameError = "Вкажіть назву";
        else if (name.length < 2) nameError = "Мінімум 2 символи";
        else if (name.length > 80) nameError = "Максимум 80 символів";
        setFieldError(nameInput, nameError);
        if (nameError) { ok = false; firstInvalid = firstInvalid || nameInput; }

        const price = Number(priceInput.value);
        let priceError = "";
        if (!Number.isFinite(price))   priceError = "Вкажіть число";
        else if (!Number.isInteger(price)) priceError = "Ціле число";
        else if (price < 1)            priceError = "Мінімум 1";
        else if (price > 10000000)     priceError = "Занадто велика ціна";
        setFieldError(priceInput, priceError);
        if (priceError) { ok = false; firstInvalid = firstInvalid || priceInput; }

        const qty = Number(qtyInput.value);
        let qtyError = "";
        if (!Number.isFinite(qty))     qtyError = "Вкажіть число";
        else if (!Number.isInteger(qty)) qtyError = "Ціле число";
        else if (qty < 1)              qtyError = "Мінімум 1";
        else if (qty > 100000)         qtyError = "Занадто велика кількість";
        setFieldError(qtyInput, qtyError);
        if (qtyError) { ok = false; firstInvalid = firstInvalid || qtyInput; }

        if (!ok && firstInvalid) firstInvalid.focus();
        return ok;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const data = new FormData(form);
        const product = {
            id: App.storage.uuid(),
            name: String(data.get("name")).trim(),
            price: Math.round(Number(data.get("price"))),
            quantity: Math.round(Number(data.get("quantity"))),
            available: true,
            category: String(data.get("category") || "accessories")
        };
        state.products.push(product);
        commit();
        form.reset();
        form.hidden = true;
    };

    const handleListClick = (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;
        const card = btn.closest(".card");
        if (!card) return;
        const id = card.dataset.id;
        const action = btn.dataset.action;

        if (action === "delete") {
            if (!confirm("Видалити товар?")) return;
            state.products = state.products.filter((p) => p.id !== id);
            if (state.editingId === id) state.editingId = null;
            commit();
        } else if (action === "toggle") {
            const p = state.products.find((p) => p.id === id);
            if (p) { p.available = !p.available; commit(); }
        } else if (action === "edit") {
            state.editingId = id;
            rerender();
        } else if (action === "save") {
            const product = state.products.find((p) => p.id === id);
            if (!product) return;
            const inputs = card.querySelectorAll("[data-field]");
            let ok = true;
            inputs.forEach((input) => {
                const field = input.dataset.field;
                const raw = input.value.trim();
                if (field === "name") {
                    if (raw.length < 2) { ok = false; input.setAttribute("aria-invalid", "true"); }
                    else { input.removeAttribute("aria-invalid"); product.name = raw; }
                } else {
                    const n = Number(raw);
                    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
                        ok = false; input.setAttribute("aria-invalid", "true");
                    } else {
                        input.removeAttribute("aria-invalid");
                        product[field] = n;
                    }
                }
            });
            if (!ok) return;
            state.editingId = null;
            commit();
        } else if (action === "cancel") {
            state.editingId = null;
            rerender();
        }
    };

    const handleSearch = debounce((value) => {
        state.query = value;
        rerender();
    }, 300);

    const bind = (products) => {
        state.products = products;

        form.addEventListener("submit", handleSubmit);
        form.addEventListener("input", (e) => {
            const t = e.target;
            if (t.matches("input, select") && t.getAttribute("aria-invalid") === "true") {
                validateForm();
            }
        });

        document.querySelector('[data-action="toggle-form"]')
            .addEventListener("click", () => {
                form.hidden = !form.hidden;
                if (!form.hidden) form.elements.name.focus();
            });

        document.querySelector('[data-action="cancel-form"]')
            .addEventListener("click", () => {
                form.hidden = true;
                form.reset();
                form.querySelectorAll('[data-role="error"]').forEach((el) => { el.textContent = ""; });
                form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute("aria-invalid"));
            });

        searchInput.addEventListener("input", (e) => handleSearch(e.target.value));

        sortSelect.addEventListener("change", (e) => {
            state.sortBy = e.target.value;
            rerender();
        });

        categoryInputs.forEach((cb) => cb.addEventListener("change", () => {
            state.categories = new Set(
                Array.from(categoryInputs).filter((c) => c.checked).map((c) => c.value)
            );
            rerender();
        }));

        priceInputs.forEach((rb) => rb.addEventListener("change", () => {
            state.priceRange = rb.value;
            rerender();
        }));

        onlyAvailableEl.addEventListener("change", (e) => {
            state.onlyAvailable = e.target.checked;
            rerender();
        });

        listEl.addEventListener("click", handleListClick);

        rerender();
    };

    App.events = { bind };
})(window.App = window.App || {});