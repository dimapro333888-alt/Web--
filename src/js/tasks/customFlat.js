(function () {
    "use strict";

    const flat = (arr, depth = 1) => {
        const result = [];
        const walk = (a, d) => {
            for (const item of a) {
                if (Array.isArray(item) && d > 0) walk(item, d - 1);
                else result.push(item);
            }
        };
        walk(arr, depth);
        return result;
    };

    const arr = [1, [2, 3], [4, [5, 6]]];
    console.assert(JSON.stringify(flat(arr, 1)) === JSON.stringify([1,2,3,4,[5,6]]), "flat: depth 1");
    console.assert(JSON.stringify(flat(arr, 2)) === JSON.stringify([1,2,3,4,5,6]),   "flat: depth 2");
    console.assert(JSON.stringify(flat(arr, Infinity)) === JSON.stringify([1,2,3,4,5,6]), "flat: Infinity");
    console.assert(JSON.stringify(flat([], 1)) === "[]", "flat: empty");
    console.assert(JSON.stringify(arr) === JSON.stringify([1,[2,3],[4,[5,6]]]), "flat: input mutated");

    console.log("customFlat OK");
})();