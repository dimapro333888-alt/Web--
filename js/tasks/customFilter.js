(function () {
    "use strict";

    const filter = (arr, fn) => {
        const result = [];
        for (let i = 0; i < arr.length; i++) if (fn(arr[i], i, arr)) result.push(arr[i]);
        return result;
    };

    const arr = [1, 2, 3, 4, 5];
    const isEven = (x) => x % 2 === 0;

    console.assert(JSON.stringify(filter(arr, isEven)) === JSON.stringify(arr.filter(isEven)), "filter: results differ");
    console.assert(JSON.stringify(filter([], isEven)) === "[]", "filter: empty");
    console.assert(JSON.stringify(filter([1, 3], isEven)) === "[]", "filter: none");
    console.assert(JSON.stringify(filter([2, 4], isEven)) === "[2,4]", "filter: all");
    console.assert(JSON.stringify(arr) === JSON.stringify([1,2,3,4,5]), "filter: input mutated");

    console.log("customFilter OK");
})();