(function () {
    "use strict";

    const deepClone = (value) => {
        if (value === null || typeof value !== "object") return value;
        if (value instanceof Date) return new Date(value.getTime());
        if (value instanceof Map) {
            const m = new Map();
            value.forEach((v, k) => m.set(deepClone(k), deepClone(v)));
            return m;
        }
        if (value instanceof Set) {
            const s = new Set();
            value.forEach((v) => s.add(deepClone(v)));
            return s;
        }
        if (Array.isArray(value)) return value.map(deepClone);

        const result = {};
        for (const key of Object.keys(value)) result[key] = deepClone(value[key]);
        return result;
    };

    const source = { id: 1, nested: { value: 42 }, tags: ["a", "b"] };
    const clone = deepClone(source);

    console.assert(JSON.stringify(clone) === JSON.stringify(source), "deepClone: equal");
    console.assert(clone !== source, "deepClone: different refs");
    console.assert(clone.nested !== source.nested, "deepClone: nested refs");
    console.assert(clone.tags !== source.tags, "deepClone: array refs");

    clone.nested.value = 99;
    console.assert(source.nested.value === 42, "deepClone: mutation isolated");

    const date = new Date("2026-01-01");
    const dc = deepClone(date);
    console.assert(dc instanceof Date, "deepClone: Date type");
    console.assert(dc.getTime() === date.getTime(), "deepClone: Date value");
    console.assert(dc !== date, "deepClone: Date ref");

    const map = new Map([["a", { x: 1 }]]);
    const mc = deepClone(map);
    console.assert(mc instanceof Map, "deepClone: Map type");
    console.assert(mc.get("a") !== map.get("a"), "deepClone: Map deep");

    const withUndef = { a: 1, b: undefined };
    const uc = deepClone(withUndef);
    console.assert(uc.a === 1, "deepClone: undefined sibling");
    console.assert("b" in uc, "deepClone: undefined key preserved");

    console.log("customDeepClone OK");
})();