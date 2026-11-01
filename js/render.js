(function (App) {
    "use strict";

    const listEl  = document.querySelector('[data-role="list"]');
    const emptyEl = document.querySelector('[data-role="empty"]');
    const countEl = document.querySelector('[data-role="count"]');
    const totalEl = document.querySelector('[data-role="total"]');

    const formatPrice = (n) =>
        new Intl.NumberFormat("uk-UA").format(Math.round(n));

    // Допоміжна функція для створення заглушки, якщо немає картинки
    const createPlaceholder = (name) => {
        const div = document.createElement("div");
        div.className = "card__img card__img--placeholder";
        div.textContent = name.charAt(0).toUpperCase();
        div.setAttribute("aria-hidden", "true");
        return div;
    };

    const createCard = (product) => {
        const card = document.createElement("article");
        card.className = "card";
        card.dataset.id = product.id;
        if (!product.available) card.classList.add("card--unavailable");

        // Логіка відображення картинки
        let img;
        if (product.image) {
            img = document.createElement("img");
            img.className = "card__img";
            img.src = product.image;
            img.alt = product.name;
            // Якщо картинка не знайдеться, покажемо заглушку
            img.onerror = function() {
                this.replaceWith(createPlaceholder(product.name));
            };
        } else {
            img = createPlaceholder(product.name);
        }
        card.append(img);

        const body = document.createElement("div");
        body.className = "card__body";

        const title = document.createElement("h2");
        title.className = "card__title";
        title.textContent = product.name;
        body.append(title);

        const priceInfo = document.createElement("p");
        priceInfo.className = "card__text";
        priceInfo.textContent = `${formatPrice(product.price)} ₴ × ${product.quantity} шт.`;
        body.append(priceInfo);

        const sum = document.createElement("p");
        sum.className = "card__sum";
        sum.textContent = `Сума: ${formatPrice(product.price * product.quantity)} ₴`;
        body.append(sum);

        const status = document.createElement("p");
        status.className = "card__status " +
            (product.available ? "card__status--in" : "card__status--out");
        status.textContent = product.available ? "✓ В наявності" : "○ Немає в наявності";
        body.append(status);

        const actions = document.createElement("div");
        actions.className = "card__actions";

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "card__btn card__btn--toggle";
        toggle.dataset.action = "toggle";
        toggle.textContent = "Змінити наявність";
        toggle.setAttribute("aria-label",
            product.available ? "Позначити як відсутній" : "Позначити як наявний");
        actions.append(toggle);

        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "card__btn card__btn--edit";
        edit.dataset.action = "edit";
        edit.textContent = "Редагувати";
        actions.append(edit);

        const del = document.createElement("button");
        del.type = "button";
        del.className = "card__btn card__btn--delete";
        del.dataset.action = "delete";
        del.textContent = "Видалити";
        actions.append(del);

        body.append(actions);
        card.append(body);
        return card;
    };

    const createEditCard = (product) => {
        const card = document.createElement("article");
        card.className = "card card--editing";
        card.dataset.id = product.id;

        const body = document.createElement("div");
        body.className = "card__body";

        const fields = [
            { key: "name",     label: "Назва",         type: "text",   value: product.name,   max: 80 },
            { key: "price",    label: "Ціна, ₴",       type: "number", value: String(product.price),    min: 1, step: 1 },
            { key: "quantity", label: "Кількість, шт.",type: "number", value: String(product.quantity), min: 1, step: 1 }
        ];

        fields.forEach((f) => {
            const label = document.createElement("label");
            label.className = "card__field";

            const span = document.createElement("span");
            span.className = "card__field-label";
            span.textContent = f.label;
            label.append(span);

            const input = document.createElement("input");
            input.type = f.type;
            input.value = f.value;
            input.dataset.field = f.key;
            input.required = true;
            if (f.max)  input.maxLength = f.max;
            if (f.min)  input.min = f.min;
            if (f.step) input.step = f.step;
            label.append(input);

            body.append(label);
        });

        const actions = document.createElement("div");
        actions.className = "card__actions";

        const saveBtn = document.createElement("button");
        saveBtn.type = "button";
        saveBtn.className = "card__btn card__btn--save";
        saveBtn.dataset.action = "save";
        saveBtn.textContent = "Зберегти";
        actions.append(saveBtn);

        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "card__btn card__btn--cancel";
        cancelBtn.dataset.action = "cancel";
        cancelBtn.textContent = "Скасувати";
        actions.append(cancelBtn);

        body.append(actions);
        card.append(body);
        return card;
    };

    const renderList = (products, editingId) => {
        listEl.replaceChildren();
        if (products.length === 0) {
            emptyEl.hidden = false;
            return;
        }
        emptyEl.hidden = true;
        const fragment = document.createDocumentFragment();
        products.forEach((p) => {
            fragment.append(p.id === editingId ? createEditCard(p) : createCard(p));
        });
        listEl.append(fragment);
    };

       const updateStats = (totalCount, filteredProducts) => {
        const countTotalEl = document.querySelector('[data-role="count-total"]');
        const countFilteredEl = document.querySelector('[data-role="count-filtered"]');
        const totalEl = document.querySelector('[data-role="total"]');

        // Суму вважаємо тільки для тих товарів, які зараз відображаються
        const totalSum = filteredProducts.reduce((acc, p) => acc + p.price * p.quantity, 0);

        countTotalEl.textContent = String(totalCount);
        countFilteredEl.textContent = String(filteredProducts.length);
        totalEl.textContent = formatPrice(totalSum);
    };

    App.render = { renderList, updateStats, formatPrice };
})(window.App = window.App || {});