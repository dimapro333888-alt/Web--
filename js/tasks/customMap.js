(function () {
    "use strict";

    const map = (arr, fn) => {
        const result = [];
        for (let i = 0; i < arr.length; i++) result.push(fn(arr[i], i, arr));
        return result;
    };

    const arr = [1, 2, 3, 4];
    const double = (x) => x * 2;

    console.assert(JSON.stringify(map(arr, double)) === JSON.stringify(arr.map(double)), "map: results differ");
    console.assert(JSON.stringify(arr) === JSON.stringify([1, 2, 3, 4]), "map: input mutated");
    console.assert(JSON.stringify(map([], double)) === "[]", "map: empty");
    console.assert(JSON.stringify(map(["a","b"], (x,i)=>x+i)) === JSON.stringify(["a0","b1"]), "map: index");

    console.log("customMap OK");
})();